import React, { useEffect, useRef, useState } from 'react';
import { Product, Order, OrderStatus } from '../../types';
import { getProductByBarcode, getVariantByBarcode, saveOrder, reduceStockForOrder } from '../../firebase';
import { useShop } from '../../store';
import { useToast } from '../../components/Toast';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, productsCollection } from '../../firebase';

interface POSItem {
  product: Product;
  variantKey: string | null;
  quantity: number;
}

const POS: React.FC = () => {
  const { products } = useShop();
  const { showToast } = useToast();
  const [scanInput, setScanInput] = useState('');
  const [cart, setCart] = useState<POSItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [scanAction, setScanAction] = useState<{ product: Product; variantKey: string | null } | null>(null);
  const [actionQty, setActionQty] = useState(1);
  const [mode, setMode] = useState<'billing' | 'stock'>('billing');
  const [scanStatus, setScanStatus] = useState<string>('');

  useEffect(() => {
    inputRef.current?.focus();
    const h = () => inputRef.current?.focus();
    window.addEventListener('click', h);
    return () => window.removeEventListener('click', h);
  }, []);

  useEffect(() => {
    if (!showCamera) { qrRef.current?.stop().catch(()=>{}); return; }
    const id = 'pos-qr-reader';
    const qr = new Html5Qrcode(id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.UPC_A], verbose: false });
    qrRef.current = qr;
    qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, async (decoded) => {
      console.log('[POS camera] decoded:', decoded);
      await addByBarcode(decoded);
    }, () => {}).catch(e => { console.error(e); showToast('Camera failed: ' + (e as any)?.message || e, 'error'); });
    return () => { qr.stop().catch(()=>{}); qrRef.current = null; };
  }, [showCamera]);

  const playBeep = (ok: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = ok ? 880 : 220;
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      setTimeout(() => ctx.close(), 200);
    } catch {}
  };

  const extractBarcode = (raw: string): string => {
    const s = raw.trim();
    if (!s) return s;
    try {
      if (s.startsWith('http://') || s.startsWith('https://')) {
        const u = new URL(s);
        const b = u.searchParams.get('barcode');
        if (b) return b;
        const parts = u.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || '';
        if (last && /^[0-9A-Za-z_-]{4,}$/.test(last)) return last;
        return s;
      }
    } catch {}
    return s;
  };

  const resolveProduct = async (c: string): Promise<{ product: Product; variantKey: string | null } | null> => {
    const found = await getVariantByBarcode(c);
    if (found) return found;
    const local = products.find(p => p.barcode === c || Object.values(p.variantBarcode || {}).includes(c));
    if (local) {
      const vk = local.variantBarcode ? Object.entries(local.variantBarcode).find(([, v]) => v === c)?.[0] || null : null;
      return { product: local, variantKey: vk };
    }
    return null;
  };

  const addByBarcode = async (code: string) => {
    const raw = code.trim();
    const c = extractBarcode(raw);
    console.log('[POS] scanned raw:', raw, 'extracted:', c, 'mode:', mode);
    setScanStatus(`Scanned: ${raw} → ${c}`);
    if (!c) { setScanStatus('Empty scan'); return; }
    if (c === lastScan) { setScanStatus(`Duplicate block: ${c}`); return; }
    setLastScan(c);
    setTimeout(() => setLastScan(''), 800);
    setScanStatus(`Looking up ${c}...`);
    const res = await resolveProduct(c);
    if (!res) { playBeep(false); setScanStatus(`❌ Not found: ${c} — Fix missing barcodes or reprint label`); showToast(`Barcode ${c} not found`, 'error'); return; }
    playBeep(true);
    setScanStatus(`✅ Found: ${res.product.name}${res.variantKey ? ' '+res.variantKey : ''} — choose Add / Decrease`);
    setActionQty(1);
    setScanAction(res);
  };

  const pushToCart = (product: Product, variantKey: string | null) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.variantKey === variantKey);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 };
        return copy;
      }
      return [...prev, { product, variantKey, quantity: 1 }];
    });
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim();
    setScanInput('');
    if (!code) return;
    await addByBarcode(code);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    let buffer = '';
    let lastTime = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        if (active === inputRef.current) return;
      }
      const now = Date.now();
      if (now - lastTime > 300) buffer = '';
      lastTime = now;
      if (e.key === 'Enter') {
        if (buffer.length >= 4) {
          e.preventDefault();
          const code = buffer;
          buffer = '';
          addByBarcode(code);
        } else buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [products]);

  const total = cart.reduce((s, i) => s + (i.product.salePrice || i.product.price) * i.quantity, 0);
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);

  const handleStockAdjust = async (delta: number) => {
    if (!scanAction) return;
    const qty = Math.max(1, Math.abs(actionQty));
    const d = delta > 0 ? qty : -qty;
    setIsProcessing(true);
    try {
      const ref = doc(db, 'products', scanAction.product.id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Product not found');
      const data = snap.data() as Product;
      const updates: any = { stock: increment(d) };
      if (scanAction.variantKey) {
        updates[`variantStock.${scanAction.variantKey}`] = increment(d);
        const color = scanAction.variantKey.split('_')[0];
        if (color && color !== 'Standard') updates[`colorStock.${color}`] = increment(d);
        const curVar = data.variantStock?.[scanAction.variantKey] || 0;
        if (curVar + d < 0) { showToast('Not enough variant stock', 'error'); setIsProcessing(false); return; }
      } else {
        if ((data.stock || 0) + d < 0) { showToast('Not enough stock', 'error'); setIsProcessing(false); return; }
      }
      await updateDoc(ref, updates);
      showToast(`${d > 0 ? 'Stock +'+qty : 'Stock -'+qty} done for ${scanAction.product.name}${scanAction.variantKey? ' '+scanAction.variantKey:''}`, 'success');
      playBeep(true);
      setScanAction(null);
      setScanInput('');
      setTimeout(()=> inputRef.current?.focus(), 100);
    } catch (e: any) { console.error(e); showToast(e?.message || 'Stock update failed', 'error'); } finally { setIsProcessing(false); }
  };

  const fixMissingBarcodes = async () => {
    const gen = () => Date.now().toString().slice(-7) + Math.floor(1000+Math.random()*9000).toString();
    let fixed = 0;
    for (const p of products) {
      if (!p.barcode) {
        const bc = gen().padStart(12,'0').slice(-12);
        const vb: Record<string,string> = {};
        const cols = p.colors?.length ? p.colors : ['Standard'];
        const szs = p.sizes || [];
        if (szs.length) for (const c of cols) for (const s of szs) vb[`${c}_${s}`] = gen().padStart(12,'0').slice(-12);
        try { await updateDoc(doc(db,'products', p.id), { barcode: bc, variantBarcode: vb }); fixed++; } catch {}
      }
    }
    showToast(fixed ? `Fixed ${fixed} products` : 'All products already have barcodes', fixed ? 'success' : 'info');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { showToast('Cart empty', 'error'); return; }
    setIsProcessing(true);
    try {
      const order: Order = {
        id: `ORD_${Date.now()}`,
        date: new Date().toISOString(),
        items: cart.map(c => {
          const [color, size] = c.variantKey ? c.variantKey.split('_') : ['Standard', ''];
          return {
            ...c.product,
            selectedColor: color || c.product.colors[0] || 'Standard',
            selectedSize: size || c.product.sizes[0] || '',
            quantity: c.quantity
          } as any;
        }),
        total,
        status: OrderStatus.CONFIRMED,
        customer: { name: customerName || 'Walk-in', email: '', address: 'POS', phone: customerPhone || '0000000000' },
        paymentMethod: 'POS - Barcode'
      };
      await saveOrder(order);
      await reduceStockForOrder(order);
      showToast(`Bill done! ${order.id} • Stock deducted`, 'success');
      setCart([]);
      setCustomerName(''); setCustomerPhone('');
    } catch (e: any) {
      showToast(e?.message || 'Checkout failed', 'error');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="pt-16 pb-10 bg-gray-50 min-h-screen text-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">POS • Scan Stock Control</h1>
            <p className="text-xs text-gray-500">Kisi bhi QR/Barcode scan → popup me Add / Decrease choose → stock turant update.</p>
          </div>
          <a href="/admin" className="px-4 py-2 bg-white border rounded-lg text-xs font-bold">← Admin</a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <form onSubmit={handleScanSubmit} className="bg-white rounded-xl p-4 border shadow-sm flex gap-2">
              <input ref={inputRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="Scan any QR / Barcode → Add / Decrease popup" className="flex-1 border-2 border-gray-900 px-4 py-3 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <button type="submit" className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-bold">SCAN</button>
              <button type="button" onClick={() => setShowCamera(v=>!v)} className={`px-4 py-3 rounded-lg text-sm font-bold border ${showCamera?'bg-red-500 text-white border-red-500':'bg-white'}`}>{showCamera?'✕ Close':'📷 Camera'}</button>
            </form>
            {scanStatus && <div className={`text-xs font-mono px-3 py-2 rounded-lg border ${scanStatus.startsWith('✅')?'bg-green-50 border-green-200 text-green-700': scanStatus.startsWith('❌')?'bg-red-50 border-red-200 text-red-700':'bg-gray-50 border-gray-200'}`}>{scanStatus}</div>}
            {showCamera && <div className="bg-white rounded-xl border shadow-sm p-3"><div id="pos-qr-reader" className="w-full overflow-hidden rounded-lg" /><p className="text-[10px] text-gray-400 mt-2 text-center">{mode==='stock' ? 'Camera se scan → Add / Decrease choose karo' : 'Camera se barcode/QR scan → auto cart me add → PAY pe stock -1'}</p></div>}
            {scanAction && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl">
                  <div className="flex gap-3">
                    <img src={scanAction.product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate">{scanAction.product.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{scanAction.variantKey || scanAction.product.barcode}</p>
                      <p className="text-xs text-gray-600 mt-1">Current stock: <b>{scanAction.variantKey ? (scanAction.product.variantStock?.[scanAction.variantKey] ?? scanAction.product.stock) : scanAction.product.stock}</b></p>
                    </div>
                    <button onClick={()=>setScanAction(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
                  </div>
                  <div className="flex items-center gap-2 mt-4 justify-center">
                    <button onClick={()=> setActionQty(q=> Math.max(1, q-1))} className="w-10 h-10 border rounded-lg font-bold">−</button>
                    <input type="number" min={1} value={actionQty} onChange={e=> setActionQty(Math.max(1, parseInt(e.target.value)||1))} className="w-20 text-center border-2 border-gray-900 rounded-lg py-2 font-bold" />
                    <button onClick={()=> setActionQty(q=> q+1)} className="w-10 h-10 border rounded-lg font-bold">+</button>
                    <span className="text-xs text-gray-500">Qty</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button disabled={isProcessing} onClick={()=> handleStockAdjust(-1)} className="py-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-40">− DECREASE</button>
                    <button disabled={isProcessing} onClick={()=> handleStockAdjust(1)} className="py-3 bg-green-600 text-white rounded-xl font-bold disabled:opacity-40">+ ADD</button>
                  </div>
                  <button onClick={()=> { if(!scanAction) return; pushToCart(scanAction.product, scanAction.variantKey); setScanAction(null); showToast('Added to billing cart','success'); setMode('billing'); }} className="w-full mt-2 py-2.5 border rounded-xl text-xs font-bold">Or Add to Billing Cart →</button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">ADD = stock +qty, DECREASE = stock -qty (variant + total both update)</p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest">CART • {totalQty} items</span>
                {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-bold text-red-500">CLEAR</button>}
              </div>
              {cart.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-400">No items. Scan a product barcode.</div>
              ) : (
                <div className="divide-y">
                  {cart.map((it, idx) => (
                    <div key={idx} className="flex gap-3 p-3 items-center">
                      <img src={it.product.images[0]} alt="" className="w-14 h-14 object-cover rounded border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{it.product.name}</p>
                        <p className="text-xs text-gray-500">{it.variantKey || it.product.barcode} • ₹{it.product.salePrice || it.product.price}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCart(prev => prev.map((p,i)=> i===idx?{...p,quantity:Math.max(1,p.quantity-1)}:p))} className="w-8 h-8 border rounded">−</button>
                        <span className="w-8 text-center text-sm font-bold">{it.quantity}</span>
                        <button onClick={() => setCart(prev => prev.map((p,i)=> i===idx?{...p,quantity:p.quantity+1}:p))} className="w-8 h-8 border rounded">+</button>
                      </div>
                      <span className="text-sm font-bold w-20 text-right">₹{(it.product.salePrice||it.product.price)*it.quantity}</span>
                      <button onClick={() => setCart(prev=> prev.filter((_,i)=>i!==idx))} className="text-gray-400 hover:text-red-500">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
              <h3 className="text-xs font-bold tracking-widest">CUSTOMER (optional)</h3>
              <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name (Walk-in)" className="w-full border px-3 py-2.5 rounded-lg text-sm outline-none focus:border-gray-900" />
              <input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full border px-3 py-2.5 rounded-lg text-sm outline-none focus:border-gray-900" />
              <div className="pt-2 border-t space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{total}</span></div>
                <div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-black">₹{total}</span></div>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing || cart.length===0} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm disabled:opacity-40">{isProcessing?'Processing...':'PAY & DEDUCT STOCK'}</button>
              <p className="text-[10px] text-gray-400 text-center">Stock deduct via Firebase increment (atomic). Beep = success.</p>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold">How to use</p>
              <ol className="list-decimal ml-4 space-y-1 text-gray-300">
                <li>Product save pe barcode auto-banta + print karo.</li>
                <li>USB scanner plug karo → POS input focused rahega.</li>
                <li>Scan → popup → ADD / DECREASE → stock turant update.</li>
                <li>Variant (M/Black) ka alag barcode = exact stock deduct.</li>
              </ol>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold tracking-widest">DEBUG • Test barcodes</h3>
                <button onClick={fixMissingBarcodes} className="text-[10px] font-bold px-2 py-1 bg-gray-900 text-white rounded">Fix missing barcodes</button>
              </div>
              <p className="text-[10px] text-gray-400">Copy barcode → input me paste → SCAN → popup aana chahiye. Missing barcode wale products pe pehle Fix dabao.</p>
              <div className="max-h-48 overflow-y-auto divide-y text-xs">
                {products.slice(0,8).map(p=> (
                  <div key={p.id} className="py-2 flex justify-between gap-2">
                    <span className="font-semibold truncate">{p.name.slice(0,22)}</span>
                    <button onClick={()=> { setScanInput(p.barcode || p.id); }} className="font-mono bg-gray-100 px-2 py-1 rounded text-[10px]">{p.barcode || 'NO BARCODE'}</button>
                  </div>
                ))}
                {products.length===0 && <p className="text-xs text-gray-400 py-4 text-center">No products loaded yet</p>}
              </div>
              {lastScan && <p className="text-[10px] font-mono text-gray-500">Last scanned: {lastScan}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
