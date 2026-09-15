import React, { useEffect, useRef, useState } from 'react';
import { Product, Order, OrderStatus } from '../../types';
import { getVariantByBarcode, saveOrder, reduceStockForOrder } from '../../firebase';
import { useShop } from '../../store';
import { useToast } from '../../components/Toast';

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
  const [scanStatus, setScanStatus] = useState<string>('');
  const [extraDiscountPct, setExtraDiscountPct] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [lastDiscountPct, setLastDiscountPct] = useState(0);
  const [lastReceived, setLastReceived] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const focusScanner = () => {
    setTimeout(() => inputRef.current?.focus(), 50);
  };

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
    try {
      const found = await getVariantByBarcode(c);
      if (found) return found;
    } catch {}
    const local = products.find(p => p.barcode === c || Object.values(p.variantBarcode || {}).includes(c));
    if (local) {
      const vk = local.variantBarcode ? Object.entries(local.variantBarcode).find(([, v]) => v === c)?.[0] || null : null;
      return { product: local, variantKey: vk };
    }
    return null;
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

  // Mall style: every scan adds directly to the bill, no popup
  const addByBarcode = async (code: string) => {
    const raw = code.trim();
    const c = extractBarcode(raw);
    if (!c) return;
    if (c === lastScan) { setScanStatus(`Duplicate block: ${c} — wait 1 sec then scan again`); return; }
    setLastScan(c);
    setTimeout(() => setLastScan(''), 800);
    setScanStatus(`Looking up ${c}...`);
    const res = await resolveProduct(c);
    if (!res) {
      playBeep(false);
      setScanStatus(`❌ Not found: ${c} — print the barcode from Dashboard first`);
      showToast(`Barcode ${c} not found`, 'error');
      focusScanner();
      return;
    }
    playBeep(true);
    pushToCart(res.product, res.variantKey);
    setScanStatus(`✅ Added: ${res.product.name}${res.variantKey ? ' (' + res.variantKey + ')' : ''} — scan next item`);
    showToast(`Added: ${res.product.name}`, 'success');
    focusScanner();
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = scanInput.trim();
    setScanInput('');
    if (!code) return;
    await addByBarcode(code);
  };

  // Scanners without Enter-suffix just type the digits and stop.
  // Auto-submit the scan box after a short pause so no ADD press is needed.
  const autoTimer = useRef<any>(null);
  useEffect(() => {
    const v = scanInput.trim();
    if (/^[0-9A-Za-z_-]{8,}$/.test(v)) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => {
        setScanInput('');
        addByBarcode(v);
      }, 500);
      return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
    }
  }, [scanInput]);

  // USB scanner types like a keyboard wedge — capture it from anywhere,
  // but don't disturb typing in customer fields
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== inputRef.current && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }
      if (active === inputRef.current) return; // form submit handle karega
      const now = Date.now();
      if (now - lastTime > 100) buffer = '';
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

  const subTotal = cart.reduce((s, i) => s + (i.product.salePrice || i.product.price) * i.quantity, 0);
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const discountPct = Math.min(100, Math.max(0, extraDiscountPct || 0));
  const discountAmt = subTotal * discountPct / 100;
  const total = Math.max(0, subTotal - discountAmt);
  const balance = Math.max(0, total - (receivedAmount || 0));

  const money = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const printInvoice = (order: Order, discPct: number, received: number) => {
    const sub = order.items.reduce((s: number, it: any) => s + (it.salePrice || it.price) * it.quantity, 0);
    const dAmt = sub * discPct / 100;
    const grand = Math.max(0, sub - dAmt);
    const bal = Math.max(0, grand - received);
    const invNo = order.id.replace('ORD_', '').slice(-6);
    const dateStr = new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const rows = order.items.map((it: any) => {
      const rate = it.salePrice || it.price;
      const amt = rate * it.quantity;
      const variant = [it.selectedColor, it.selectedSize].filter(Boolean).join(' / ');
      return `<tr><td><b>${it.name}</b><br/><span style="color:#70798b;font-size:6px">${variant || ''}</span></td><td style="text-align:center">${it.quantity}</td><td style="text-align:right">₹${rate}</td><td style="text-align:right">${money(amt)}</td></tr>`;
    }).join('');
    const w = window.open('', '_blank', 'width=300,height=600');
    if (!w) { showToast('Popup blocked — allow popups for print', 'error'); return; }
    w.document.write(`<html><head><title>Invoice ${order.id}</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#17213a;font-family:Arial,sans-serif}
@page{size:2.76in auto;margin:0}
.invoice{width:2.76in;height:auto;padding:4px 6px;font-size:7px}
.header{display:flex;gap:5px;align-items:flex-start}.logo{width:28px;height:28px;object-fit:contain}
.company h1{margin:0;font-size:10px;font-weight:900}.phone,.address{font-size:6px;color:#70798b;line-height:1.3}
.title{text-align:center;font-size:8px;font-weight:800;margin:4px 0;border-top:1px dashed #999;border-bottom:1px dashed #999;padding:2px 0}
.meta{display:flex;justify-content:space-between;font-size:7px;margin-bottom:4px;line-height:1.3}
table{width:100%;border-collapse:collapse;font-size:7px}th{border-top:1px dashed #999;border-bottom:1px dashed #999;padding:2px 1px;text-align:left;font-size:6px;color:#555}td{border-bottom:1px dotted #ddd;padding:2px 1px;vertical-align:top}
.breakup{margin-top:4px;border-top:1px dashed #999;padding-top:3px;font-size:7px}.row{display:flex;justify-content:space-between;padding:1px 0}.total{font-weight:900;font-size:8px;color:#0877d1}
.terms{margin-top:4px;font-size:5px;color:#555;border-top:1px dashed #999;padding-top:3px;text-align:center}
@media print{body{margin:0}.invoice{width:2.76in;height:auto;padding:4px 6px}}
</style></head><body><div class="invoice">
<div class="header"><img class="logo" src="/logo.png"/><div class="company"><h1>The 3 Monks Clothing</h1><div class="phone">9045848613</div><div class="address">1st Floor, M&S tower, Near Jamrani Auto Stand, Panchakki Chauraha, Haldwani, Nainital</div></div></div>
<div class="title">Tax Invoice</div>
<div class="meta"><div><b>Bill To:</b><br/>${order.customer.name}<br/>${order.customer.phone}</div><div style="text-align:right"><b>Invoice No:</b> ${invNo}<br/><b>Date:</b> ${dateStr}<br/><b>Order:</b> ${order.id}</div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="breakup"><div class="row"><span>Sub Total</span><strong>${money(sub)}</strong></div>
<div class="row"><span>Discount (${discPct}%)</span><strong>- ${money(dAmt)}</strong></div>
<div class="row"><span class="total">Total</span><strong class="total">${money(grand)}</strong></div>
<div class="row"><span>Received</span><strong>${money(received)}</strong></div>
<div class="row"><span>Balance</span><strong>${money(bal)}</strong></div></div>
<div class="terms">Thank you for doing business with us.<br/>No returns • Exchange only on damaged/incorrect item</div>
</div><script>window.onload=()=>{setTimeout(()=>{window.print();},300)}<\/script></body></html>`);
    w.document.close();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) { showToast('Cart empty — scan items first', 'error'); return; }
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
      setLastOrder(order); setLastDiscountPct(discountPct); setLastReceived(receivedAmount || total);
      showToast(`Bill done! ${order.id}`, 'success');
      printInvoice(order, discountPct, receivedAmount || total);
      setCart([]); setExtraDiscountPct(0); setReceivedAmount(0);
      setCustomerName(''); setCustomerPhone('');
      focusScanner();
    } catch (e: any) {
      showToast(e?.message || 'Checkout failed', 'error');
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="pt-28 md:pt-36 pb-10 bg-gray-50 min-h-screen text-black overflow-x-hidden relative z-0">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 w-full">
        <div className="py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black">Billing • Mall Style</h1>
            <p className="text-xs text-gray-500">Step 1: scan items (beep = added) → Step 2: press PAY → 2.76" wide roll prints (height auto).</p>
          </div>
          <a href="/admin" className="shrink-0 px-4 py-2 bg-white border rounded-lg text-xs font-bold text-center">← Admin</a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 space-y-4 min-w-0 w-full">
            <form onSubmit={handleScanSubmit} className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm flex flex-col sm:flex-row gap-2">
              <input ref={inputRef} autoFocus value={scanInput} onChange={e => setScanInput(e.target.value)} placeholder="Scan with scanner — keep focus here" className="flex-1 min-w-0 w-full border-2 border-gray-900 px-4 py-3 rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="flex gap-2 shrink-0">
                <button type="submit" className="flex-1 sm:flex-none px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-bold">ADD</button>
                <button type="button" onClick={focusScanner} className="flex-1 sm:flex-none px-4 py-3 rounded-lg text-sm font-bold border bg-white">🎯 Focus</button>
              </div>
            </form>
            {scanStatus && <div className={`text-xs font-mono px-3 py-2 rounded-lg border break-words ${scanStatus.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : scanStatus.startsWith('❌') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200'}`}>{scanStatus}</div>}

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden w-full">
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest">BILL • {totalQty} items</span>
                {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-bold text-red-500">CLEAR</button>}
              </div>
              {cart.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-4xl mb-2">🧾</p>
                  <p className="text-sm text-gray-400">No items yet. Pick up the scanner and scan the first barcode.</p>
                  <p className="text-xs text-gray-400 mt-1">Beep = item added to the bill.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {cart.map((it, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 p-3 items-center w-full">
                      <img src={it.product.images[0]} alt="" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded border shrink-0" />
                      <div className="flex-1 min-w-0 basis-40">
                        <p className="text-sm font-bold truncate">{it.product.name}</p>
                        <p className="text-xs text-gray-500 truncate">{it.variantKey || it.product.barcode} • ₹{it.product.salePrice || it.product.price}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setCart(prev => prev.map((p, i) => i === idx ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))} className="w-8 h-8 border rounded">−</button>
                        <span className="w-8 text-center text-sm font-bold">{it.quantity}</span>
                        <button onClick={() => setCart(prev => prev.map((p, i) => i === idx ? { ...p, quantity: p.quantity + 1 } : p))} className="w-8 h-8 border rounded">+</button>
                      </div>
                      <span className="text-sm font-bold w-20 text-right shrink-0">₹{(it.product.salePrice || it.product.price) * it.quantity}</span>
                      <button onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 shrink-0 px-1">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 w-full min-w-0 lg:sticky lg:top-36 self-start">
            <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
              <h3 className="text-xs font-bold tracking-widest">CUSTOMER</h3>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Name (Walk-in)" className="w-full border px-3 py-2.5 rounded-lg text-sm outline-none focus:border-gray-900" />
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone" className="w-full border px-3 py-2.5 rounded-lg text-sm outline-none focus:border-gray-900" />
              <div className="pt-2 border-t space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sub Total</span><span className="font-bold">₹{subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Discount %</span><input type="number" min={0} max={100} value={extraDiscountPct} onChange={e => setExtraDiscountPct(Number(e.target.value))} className="w-20 border px-2 py-1 rounded text-right text-sm font-bold" /></div>
                {discountAmt > 0 && <div className="flex justify-between text-xs"><span className="text-gray-500">Discount Amt</span><span className="font-bold">- ₹{discountAmt.toFixed(2)}</span></div>}
                <div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-black">₹{total.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Received</span><input type="number" min={0} value={receivedAmount} onChange={e => setReceivedAmount(Number(e.target.value))} placeholder={total.toFixed(0)} className="w-24 border px-2 py-1 rounded text-right text-sm font-bold" /></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Balance</span><span className="font-bold">₹{balance.toFixed(2)}</span></div>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing || cart.length === 0} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold text-sm disabled:opacity-40">{isProcessing ? 'Printing...' : `PAY ₹${total.toFixed(0)} • PRINT BILL`}</button>
              {lastOrder && <button onClick={() => printInvoice(lastOrder, lastDiscountPct, lastReceived)} className="w-full py-2.5 border border-gray-900 rounded-lg font-bold text-xs">🖨 REPRINT LAST BILL</button>}
              <p className="text-[10px] text-gray-400 text-center">2.76 inch wide roll • Height auto (continuous) • Margins None • Keep popups allowed</p>
            </div>

            <div className="bg-gray-900 text-white rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold">Scanner setup (one time)</p>
              <ol className="list-decimal ml-4 space-y-1 text-gray-300">
                <li>Plug in the USB scanner — it works like a keyboard.</li>
                <li>From its manual, scan the <b>Enter suffix ON</b> barcode.</li>
                <li>Keep focus in the scan box here, then scan products.</li>
                <li>Beep = added. After 3-4 scans press PAY.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
