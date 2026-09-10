
import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../../store';
import { OrderStatus, Product, Category, CategoryWithImage, SiteConfig, Story, Review, GiveawayEntry } from '../../types';
import { useToast } from '../../components/Toast';
import imageCompression from 'browser-image-compression';
import AnalyticsTab from './AnalyticsTab';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-black">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-500 text-white text-sm font-semibold rounded-lg">
            Delete
          </button>
        </div>

      </div>
    </div>
  );
};

interface ProductModalProps {
  product: Partial<Product> | null;
  isOpen: boolean;
  isNew: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  categories: CategoryWithImage[];
  productTypes: string[];
}

const EMPTY_FORM: Partial<Product> = {
  name: '',
  subtitle: '',
  description: '',
  price: 0,
  category: 'Men',
  images: [],
  colors: [],
  sizes: [],
  stock: 0,
  isNew: true,
  isFeatured: false,
  isTopPick: false,
  productType: '',
  tags: [],
  barcode: '',
  variantBarcode: {}
};

const genBarcode = (): string => {
  const ts = Date.now().toString().slice(-7);
  const rnd = Math.floor(1000 + Math.random() * 9000).toString();
  return `${ts}${rnd}`.padStart(12, '0').slice(-12);
};

const DEFAULT_TAGS = ['T-Shirts', 'Denims', 'Shirts', 'Waffles', 'Lower'];

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, isNew, onClose, onSave, categories, productTypes }) => {
  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_FORM);
  const [newColor, setNewColor] = useState('');
  const [newColorStock, setNewColorStock] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const barcodeRef = useRef<SVGSVGElement>(null);
  const [barcodeMode, setBarcodeMode] = useState<'barcode' | 'qr'>('barcode');
  const [qrPayload, setQrPayload] = useState<'url' | 'plain'>('url');

  useEffect(() => {
    if (formData.barcode && barcodeRef.current && barcodeMode === 'barcode') {
      try { JsBarcode(barcodeRef.current, formData.barcode, { format: 'CODE128', width: 1.6, height: 56, displayValue: true, fontSize: 12, margin: 4 }); } catch {}
    }
  }, [formData.barcode, barcodeMode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isNew) {
        setFormData({ ...EMPTY_FORM, id: `prod_${Date.now()}`, barcode: genBarcode(), variantBarcode: {}, colorStock: {}, variantStock: {} });
        setNewColor('');
        setNewColorStock('');
        setNewSize('');
        setNewTag('');
      } else if (product) {
        setFormData({
          ...product,
          barcode: product.barcode || genBarcode(),
          variantBarcode: product.variantBarcode || {},
          colorStock: product.colorStock || {},
          variantStock: product.variantStock || {}
        });
        setNewColor('');
        setNewColorStock('');
        setNewSize('');
        setNewTag('');
      }
    }
  }, [isOpen, isNew, product]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      showToast('Please enter a product name', 'error');
      return;
    }

    setIsSaving(true);
    const ensureVariantBarcodes = (): Record<string, string> => {
      const vb: Record<string, string> = { ...(formData.variantBarcode || {}) };
      const colors = formData.colors?.length ? formData.colors : ['Standard'];
      const sizes = formData.sizes || [];
      if (sizes.length > 0) {
        for (const c of colors) for (const s of sizes) {
          const k = `${c}_${s}`;
          if (!vb[k]) vb[k] = genBarcode();
        }
        for (const k of Object.keys(vb)) if (!colors.some(c => sizes.some(s => `${c}_${s}` === k))) delete vb[k];
      }
      return vb;
    };
    const newProduct: Product = {
      id: isNew ? (formData.id || `prod_${Date.now()}`) : (product?.id || ''),
      name: formData.name || '',
      subtitle: formData.subtitle || '',
      description: formData.description || '',
      price: formData.price || 0,
      category: formData.category || 'Men',
      images: formData.images || [],
      colors: formData.colors || [],
      colorStock: formData.colorStock || {},
      variantStock: formData.variantStock || {},
      sizes: formData.sizes || [],
      stock: formData.stock || 0,
      barcode: formData.barcode || genBarcode(),
      variantBarcode: ensureVariantBarcodes(),
      isNew: formData.isNew || false,
      isFeatured: formData.isFeatured || false,
      isTrending: formData.isTrending || false,
      isTopPick: formData.isTopPick || false,
      isBestSeller: formData.isBestSeller || false,
      productType: formData.productType || '',
      tags: formData.tags || [],
      sizeGuide: formData.sizeGuide,
      createdAt: isNew ? Date.now() : product?.createdAt,
    };

    if (formData.salePrice && formData.salePrice > 0) {
      newProduct.salePrice = formData.salePrice;
    }

    try {
      await onSave(newProduct);
      onClose();
    } catch (error) {

    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const options = {
            maxSizeMB: 0.2, 
            maxWidthOrHeight: 1080,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(file, options);
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({ ...prev, images: [...(prev.images || []), base64] }));
          };
          reader.readAsDataURL(compressedFile);
        } catch (error) {
          console.error("Error compressing image:", error);
          showToast("Image compression failed. Image might be corrupted.", "error");
        }
      }
    }
  };

  const handleRemoveImage = async (idx: number) => {
    const imageUrl = formData.images?.[idx];
    if (imageUrl) {
      try {
        const { deleteImage } = await import('../../firebase');
        await deleteImage(imageUrl);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors?.includes(newColor.trim())) {
      const colorName = newColor.trim();
      setFormData(prev => ({ ...prev, colors: [...(prev.colors || []), colorName] }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setFormData(prev => {
      const newColorStock = { ...(prev.colorStock || {}) };
      delete newColorStock[color];

      const totalStock = Object.values(newColorStock).reduce((a: number, b: number) => a + b, 0);

      return {
        ...prev,
        colors: prev.colors?.filter(c => c !== color),
        colorStock: newColorStock,
        stock: totalStock
      };
    });
  };

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes?.includes(newSize.trim())) {
      setFormData(prev => ({ ...prev, sizes: [...(prev.sizes || []), newSize.trim()] }));
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes?.filter(s => s !== size) }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-end md:items-center justify-center p-4 pt-28 md:pt-36 pb-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl text-black" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Product Images</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img} className="w-16 h-16 object-cover rounded-lg border" alt="" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white px-4 py-3 text-sm font-semibold rounded-lg cursor-pointer active:scale-[0.98] transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Upload Images
              <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Product Name *</label>
            <input type="text" value={formData.name || ''} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900" placeholder="Enter product name" required />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Subtitle (Collection Name)</label>
            <input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="e.g. Drop 001 / Archive Collection" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Description</label>
            <textarea value={formData.description || ''} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} placeholder="Material, fit, style..." className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Category</label>
              <select value={formData.category || 'Men'} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 bg-white">
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Price (₹)</label>
              <input type="number" value={formData.price || ''} onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Filter By (Optional)</label>
              <select
                value={formData.productType || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value }))}
                className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 bg-white"
              >
                <option value="">Select Type</option>
                {productTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Stock</label>
              <input type="number" value={formData.stock || ''} onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Sale Price</label>
              <input type="number" value={formData.salePrice || ''} onChange={(e) => setFormData(prev => ({ ...prev, salePrice: parseInt(e.target.value) || undefined }))} placeholder="Optional" className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Colors & Stock</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.colors?.map((color, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-gray-900"></span>
                  {color}
                  <span className="text-xs text-gray-500 ml-1">
                    ({formData.colorStock?.[color] || 0} in stock)
                  </span>
                  <button type="button" onClick={() => handleRemoveColor(color)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                  placeholder="Color Name (e.g. Black)"
                  className="w-full border border-gray-200 px-4 py-2.5 text-base rounded-lg outline-none focus:border-gray-900"
                />
              </div>
              <button type="button" onClick={handleAddColor} className="px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Add Color
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Add colors here. Then set stock for each variant below.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.sizes?.map((size, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm font-bold border border-gray-200">
                  {size}
                  <button type="button" onClick={() => handleRemoveSize(size)} className="ml-1 text-gray-400 hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                placeholder="Size (e.g. XL, 42, Free Size)"
                className="flex-1 border border-gray-200 px-4 py-2.5 text-base rounded-lg outline-none focus:border-gray-900"
              />
              <button type="button" onClick={handleAddSize} className="px-6 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-semibold transition-colors">
                Add Size
              </button>
            </div>
          </div>

          {(formData.sizes && formData.sizes.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="text-xs font-semibold text-gray-900 mb-3 block">Stock Matrix (Variant Management)</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(formData.colors && formData.colors.length > 0 ? formData.colors : ['Standard']).map(color => (
                  formData.sizes?.map(size => {
                    const variantKey = `${color}_${size}`;
                    return (
                      <div key={variantKey} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-100">
                        <span className="font-medium text-gray-700">{color === 'Standard' ? size : `${color} - ${size}`}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Qty:</span>
                          <input
                            type="number"
                            min="0"
                            value={formData.variantStock?.[variantKey] || 0}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 0;
                              setFormData(prev => {
                                const newVariantStock = { ...(prev.variantStock || {}), [variantKey]: qty };

                                const totalStock = Object.values(newVariantStock).reduce((a: number, b: number) => a + b, 0);
                                return { ...prev, variantStock: newVariantStock, stock: totalStock };
                              });
                            }}
                            className="w-20 border border-gray-200 px-2 py-1 rounded outline-none focus:border-gray-900"
                          />
                        </div>
                      </div>
                    );
                  })
                ))}
              </div>
              <div className="mt-2 text-right text-xs text-gray-500">
                Total Stock: <span className="font-bold text-gray-900">{formData.stock}</span>
              </div>
            </div>
          )}

          {(!formData.sizes?.length) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Total Stock</label>
                <input type="number" value={formData.stock || ''} onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="0" />
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-widest text-gray-900 uppercase">Barcode / QR *</label>
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button type="button" onClick={() => setBarcodeMode('barcode')} className={`px-3 py-1 text-xs font-bold rounded-full ${barcodeMode === 'barcode' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>BARCODE</button>
                <button type="button" onClick={() => setBarcodeMode('qr')} className={`px-3 py-1 text-xs font-bold rounded-full ${barcodeMode === 'qr' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>QR</button>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" value={formData.barcode || ''} onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))} placeholder="12-digit code" className="flex-1 border border-gray-200 px-3 py-2.5 text-sm font-mono rounded-lg outline-none focus:border-gray-900" />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, barcode: genBarcode() }))} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold whitespace-nowrap">⟳ GENERATE</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px] border border-dashed border-gray-200">
              {barcodeMode==='qr' && formData.barcode && (
                <div className="flex gap-1 mb-2">
                  <button type="button" onClick={()=>setQrPayload('plain')} className={`px-2 py-1 text-[10px] font-bold rounded-full ${qrPayload==='plain'?'bg-gray-900 text-white':'bg-white border'}`}>STOCK QR (scan)</button>
                  <button type="button" onClick={()=>setQrPayload('url')} className={`px-2 py-1 text-[10px] font-bold rounded-full ${qrPayload==='url'?'bg-gray-900 text-white':'bg-white border'}`}>CUSTOMER QR (link)</button>
                </div>
              )}
              {formData.barcode ? (
                barcodeMode === 'barcode' ? <svg ref={barcodeRef} className="max-w-full" /> : (
                  <div className="relative p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <QRCodeSVG
                      value={qrPayload==='plain'
                        ? `${window.location.origin}/admin/stock/${product?.id || formData.id || 'preview'}?barcode=${formData.barcode}`
                        : `${window.location.origin}/product/${product?.id || formData.id || 'preview'}?barcode=${formData.barcode}`}
                      size={130}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#111111"
                      imageSettings={{
                        src: '/3MONK.png',
                        x: undefined,
                        y: undefined,
                        height: 28,
                        width: 28,
                        excavate: true,
                      }}
                    />
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider" style={{background: qrPayload==='plain' ? '#111' : '#16a34a', color: '#fff'}}>
                      {qrPayload==='plain' ? 'STOCK' : 'SHOP'}
                    </div>
                  </div>
                )
              ) : <span className="text-xs text-gray-400">No barcode</span>}
              {formData.barcode && <span className="text-[10px] font-mono text-gray-500 mt-2 text-center break-all">{barcodeMode==='barcode' ? `${formData.barcode} • CODE128 → scan at POS to BILL` : qrPayload==='plain' ? `STOCK QR → scan to open stock manager for this product` : `${window.location.origin}/product/...?barcode=${formData.barcode} • QR LINK → customer phone opens product`}</span>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => {
                const w = window.open('', '_blank', 'width=420,height=600');
                if (!w) return;
                const svg = barcodeRef.current?.outerHTML || '';
                const pName = (formData.name || 'Product').replace(/</g, '&lt;');
                const pPrice = Number(formData.price || 0);
                const pBarcode = formData.barcode || '';
                const invNo = String(Date.now()).slice(-6);
                const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                const amt = '₹' + pPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                w.document.write(`<html><head><title>Tax Invoice ${invNo}</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#17213a;font-family:Arial,sans-serif}
@page{size:4in 4in;margin:0}
.invoice{width:4in;padding:10px 12px;font-size:11px}
.header{display:flex;gap:8px;align-items:flex-start}.logo{width:48px;height:48px;object-fit:contain}
.company h1{margin:0;font-size:15px;font-weight:900}.phone,.address{font-size:9px;color:#70798b;line-height:1.4}
.title{text-align:center;font-size:14px;font-weight:800;margin:10px 0 8px;border-top:1px dashed #999;border-bottom:1px dashed #999;padding:5px 0}
.meta{display:flex;justify-content:space-between;font-size:10px;margin-bottom:8px}
table{width:100%;border-collapse:collapse;font-size:10px}th{border-top:1px dashed #999;border-bottom:1px dashed #999;padding:4px 2px;text-align:left;font-size:9px;color:#555}td{border-bottom:1px dotted #ddd;padding:4px 2px;vertical-align:top}
.breakup{margin-top:8px;border-top:1px dashed #999;padding-top:6px;font-size:10px}.row{display:flex;justify-content:space-between;padding:2px 0}.total{font-weight:900;font-size:12px;color:#0877d1}
.barcodebox{margin-top:8px;text-align:center;border-top:1px dashed #999;padding-top:6px}.barcodebox svg{max-width:100%;height:50px}
.terms{margin-top:8px;font-size:8px;color:#555;border-top:1px dashed #999;padding-top:6px;text-align:center}
@media print{body{margin:0}.invoice{width:4in;padding:8px}}
</style></head><body><div class="invoice">
<div class="header"><img class="logo" src="/logo.png"/><div class="company"><h1>The 3 Monks Clothing</h1><div class="phone">9045848613</div><div class="address">1st Floor, M&S tower, Near Jamrani Auto Stand, Panchakki Chauraha, Haldwani, Nainital</div></div></div>
<div class="title">Tax Invoice</div>
<div class="meta"><div><b>Bill To:</b><br/>Walk-in<br/>--</div><div style="text-align:right"><b>Invoice No:</b> ${invNo}<br/><b>Date:</b> ${dateStr}</div></div>
<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
<tbody><tr><td><b>${pName}</b><br/><span style="color:#70798b;font-size:9px">${pBarcode}</span></td><td style="text-align:center">1</td><td style="text-align:right">₹${pPrice}</td><td style="text-align:right">${amt}</td></tr></tbody></table>
<div class="breakup"><div class="row"><span>Sub Total</span><strong>${amt}</strong></div>
<div class="row"><span>Additional Discount (0%)</span><strong>- ₹0.00</strong></div>
<div class="row"><span class="total">Total Amount</span><strong class="total">${amt}</strong></div>
<div class="row"><span>Received Amount</span><strong>${amt}</strong></div>
<div class="row"><span>Transaction Balance</span><strong>₹0.00</strong></div></div>
<div class="barcodebox">${svg}<div style="font-size:9px;font-family:monospace;margin-top:2px">${pBarcode}</div></div>
<div class="terms"><strong>Terms & Conditions :</strong> Thank you for doing business with us.</div>
</div><script>window.onload=()=>{setTimeout(()=>{window.print();},300)}<\/script></body></html>`);
                w.document.close();
                setTimeout(() => w.print(), 400);
              }} className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-bold">🖨️ PRINT BILL (4x4)</button>
              <button type="button" onClick={() => { navigator.clipboard.writeText(formData.barcode || ''); showToast('Barcode copied','success'); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-xs font-bold">COPY</button>
            </div>
            {formData.sizes && formData.sizes.length > 0 && formData.colors && formData.colors.length > 0 && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Variant Barcodes ({Object.keys(formData.variantBarcode || {}).length})</span>
                  <button type="button" onClick={() => {
                    const vb: Record<string,string> = {};
                    const cols = formData.colors || [];
                    const szs = formData.sizes || [];
                    for(const c of cols) for(const s of szs) vb[`${c}_${s}`]=genBarcode();
                    setFormData(prev=>({...prev, variantBarcode: vb}));
                  }} className="text-[10px] font-bold text-gray-900 underline">RE-GENERATE ALL</button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {(formData.colors || []).flatMap(c => (formData.sizes || []).map(s => {
                    const k = `${c}_${s}`;
                    return (
                      <div key={k} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100">
                        <span className="font-semibold text-gray-700 flex-1">{k}</span>
                        <input value={formData.variantBarcode?.[k] || ''} onChange={(e)=> setFormData(prev=> ({...prev, variantBarcode:{...(prev.variantBarcode||{}), [k]: e.target.value}}))} className="flex-1 font-mono border border-gray-200 rounded px-2 py-1 text-xs outline-none" placeholder="barcode" />
                        <button type="button" onClick={()=> setFormData(prev=> ({...prev, variantBarcode:{...(prev.variantBarcode||{}), [k]: genBarcode()}}))} className="text-[10px] font-bold px-2 py-1 bg-white border rounded">⟳</button>
                      </div>
                    );
                  }))}
                </div>
              </div>
            )}
            <p className="text-[10px] text-gray-400">Each product + each variant gets unique code. Scan at POS to auto-identify. Leave blank = auto generate on save.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-900">SIZE GUIDE</label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Unit</span>
                <select
                  value={formData.sizeGuide?.unit || 'inches'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sizeGuide: { ...prev.sizeGuide, unit: e.target.value as 'inches' | 'cm', measurements: prev.sizeGuide?.measurements || [] }
                  }))}
                  className="bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none"
                >
                  <option value="inches">Inches</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">
              ADD MEASUREMENT ROWS (E.G. CHEST, LENGTH). SHOWN TO CUSTOMERS AS A "SIZE GUIDE" TABLE ON THE PRODUCT PAGE.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead>
                  <tr>
                    <th className="font-bold tracking-widest pb-2 uppercase text-gray-500">Measurement</th>
                    {formData.sizes?.map(size => (
                      <th key={size} className="font-bold tracking-widest pb-2 uppercase text-gray-500 text-center w-16">{size}</th>
                    ))}
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {formData.sizeGuide?.measurements?.map((measurement, mIdx) => (
                    <tr key={mIdx}>
                      <td className="pr-2 pb-2">
                        <input
                          type="text"
                          value={measurement.name}
                          onChange={(e) => {
                            const newMeasurements = [...(formData.sizeGuide?.measurements || [])];
                            newMeasurements[mIdx] = { ...newMeasurements[mIdx], name: e.target.value };
                            setFormData(prev => ({ ...prev, sizeGuide: { ...prev.sizeGuide!, measurements: newMeasurements } }));
                          }}
                          className="w-full bg-white border border-gray-200 px-3 py-2 rounded outline-none text-black"
                          placeholder="e.g. Chest"
                        />
                      </td>
                      {formData.sizes?.map(size => (
                        <td key={size} className="px-1 pb-2">
                          <input
                            type="text"
                            value={measurement.values[size] || ''}
                            onChange={(e) => {
                              const newMeasurements = [...(formData.sizeGuide?.measurements || [])];
                              newMeasurements[mIdx] = { ...newMeasurements[mIdx], values: { ...newMeasurements[mIdx].values, [size]: e.target.value } };
                              setFormData(prev => ({ ...prev, sizeGuide: { ...prev.sizeGuide!, measurements: newMeasurements } }));
                            }}
                            className="w-full text-center bg-white border border-gray-200 px-1 py-2 rounded outline-none text-black"
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td className="pl-2 pb-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const newMeasurements = formData.sizeGuide!.measurements.filter((_, idx) => idx !== mIdx);
                            setFormData(prev => ({ ...prev, sizeGuide: { ...prev.sizeGuide!, measurements: newMeasurements } }));
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mx-auto"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  sizeGuide: {
                    unit: prev.sizeGuide?.unit || 'inches',
                    measurements: [...(prev.sizeGuide?.measurements || []), { name: '', values: {} }]
                  }
                }));
              }}
              className="mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest text-gray-500 hover:text-black uppercase transition-colors"
            >
              + ADD MEASUREMENT ROW
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 block">Product Tags</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isNew || false} onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))} className="w-5 h-5 accent-gray-900 rounded" />
                <span className="text-sm font-medium">New Arrival</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isFeatured || false} onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="w-5 h-5 accent-gray-900 rounded" />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isTrending || false} onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))} className="w-5 h-5 accent-orange-500 rounded" />
                <span className="text-sm font-medium">🔥 Trending</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isBestSeller || false} onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))} className="w-5 h-5 accent-blue-500 rounded" />
                <span className="text-sm font-medium">⭐ Best Seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.isTopPick || false} onChange={(e) => setFormData(prev => ({ ...prev, isTopPick: e.target.checked }))} className="w-5 h-5 accent-purple-500 rounded" />
                <span className="text-sm font-medium">🎯 Top Pick</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 block">Home Page Sections (Show in these rows)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags?.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {tag}
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }))} className="text-gray-300 hover:text-white transition-colors">×</button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_TAGS.filter(t => !(formData.tags || []).includes(t)).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }))}
                  className="px-3 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                >
                  + {tag}
                </button>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const t = newTag.trim();
                    if (t && !(formData.tags || []).includes(t)) {
                      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), t] }));
                    }
                    setNewTag('');
                  }
                }}
                placeholder="Custom tag + Enter"
                className="flex-1 min-w-[140px] border border-gray-200 px-3 py-1.5 rounded-full text-sm outline-none focus:border-gray-900"
              />
            </div>
            <p className="text-[10px] text-gray-400">Products with this tag will show as their own row on the homepage (e.g. T-Shirts, Denims).</p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isSaving} className="w-full px-4 py-4 bg-green-600 text-white text-sm font-bold rounded-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {isNew ? 'Save Product' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

const GiveawayManager: React.FC<{
  entries: GiveawayEntry[];
  onDelete: (id: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error') => void;
  giveawayEnabled: boolean;
  setGiveawayEnabled: (enabled: boolean) => Promise<void>;
}> = ({ entries, onDelete, showToast, giveawayEnabled, setGiveawayEnabled }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<GiveawayEntry | null>(null);
  const [displayName, setDisplayName] = useState('');
  const spinRef = useRef<number>(0);
  const totalEntries = entries.length;

  const pickWinner = () => {
    if (totalEntries === 0) {
      showToast('No entries to pick from', 'error');
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    let count = 0;
    const totalSteps = 40 + Math.floor(Math.random() * 15);
    const interval = 160;

    const spin = () => {
      count++;
      const idx = Math.floor(Math.random() * totalEntries);
      setDisplayName(shuffled[idx].name);

      if (count >= totalSteps) {
        const finalWinner = shuffled[Math.floor(Math.random() * totalEntries)];
        setDisplayName(finalWinner.name);
        setTimeout(() => {
          setWinner(finalWinner);
          setIsSpinning(false);
          showToast(`Winner: ${finalWinner.name}${finalWinner.instagram ? ` (@${finalWinner.instagram.replace(/^@/, '')})` : ''}!`, 'success');
        }, 300);
        return;
      }

      const delay = interval + Math.random() * count * 6;
      spinRef.current = window.setTimeout(spin, delay);
    };

    spin();
  };

  useEffect(() => {
    return () => {
      if (spinRef.current) clearTimeout(spinRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes winner-pop {
          0% { transform: scale(0.2) rotate(-8deg); opacity: 0; }
          55% { transform: scale(1.15) rotate(3deg); opacity: 1; }
          75% { transform: scale(0.95) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes winner-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.7); }
          50% { box-shadow: 0 0 0 16px rgba(250, 204, 21, 0); }
        }
        @keyframes winner-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(20deg); opacity: 0.6; }
        }
        .winner-pop { animation: winner-pop 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .winner-glow { animation: winner-glow 1.4s ease-out infinite; }
        .winner-sparkle { animation: winner-sparkle 0.9s ease-in-out infinite; display: inline-block; }
      `}</style>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900">Giveaway Status</h3>
          <p className="text-sm text-gray-500 mt-0.5">{giveawayEnabled ? 'Giveaway is live — users can see and enter' : 'Giveaway is hidden from users'}</p>
        </div>
        <button
          onClick={() => setGiveawayEnabled(!giveawayEnabled)}
          className={`relative w-14 h-7 rounded-full transition-all ${giveawayEnabled ? 'bg-gray-900' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${giveawayEnabled ? 'translate-x-7' : ''}`} />
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">🎁 Giveaway Random Picker</h2>
        <p className="text-gray-400 text-sm mb-6">{totalEntries} participants</p>

        <div className="w-48 h-48 rounded-full border-4 border-white/20 mx-auto mb-6 flex items-center justify-center bg-white/5 backdrop-blur-sm">
          {winner ? (
            <div className={`text-center ${winner ? 'winner-pop winner-glow' : ''}`}>
              <div className="relative inline-flex flex-col items-center">
                <span className="absolute -top-10 text-2xl winner-sparkle">✨</span>
                <span className="absolute -top-10 right-[-28px] text-lg winner-sparkle" style={{ animationDelay: '0.3s' }}>🎉</span>
                <span className="absolute -top-10 left-[-28px] text-lg winner-sparkle" style={{ animationDelay: '0.5s' }}>✨</span>
                <p className="text-2xl font-black tracking-tight">{winner.name}</p>
                {winner.instagram && <p className="text-sm font-semibold text-white/90 mt-1">@{winner.instagram.replace(/^@/, '')}</p>}
                <p className="text-sm text-gray-400 mt-1">🏆 Winner!</p>
              </div>
            </div>
          ) : isSpinning ? (
            <p className="text-2xl font-black tracking-tight animate-pulse">{displayName}</p>
          ) : (
            <div className="text-center">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-gray-400">Click to spin</p>
            </div>
          )}
        </div>

        <button
          onClick={pickWinner}
          disabled={isSpinning || totalEntries === 0}
          className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full text-sm uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-40"
        >
          {isSpinning ? 'Spinning...' : 'Pick Winner'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">All Entries ({totalEntries})</h3>
        </div>
        {totalEntries === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No entries yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Instagram</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{entry.name}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.instagram || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm('Delete this entry?')) {
                            onDelete(entry.id);
                            showToast('Entry deleted', 'success');
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    siteConfig,
    setSiteConfig,
    categories,
    setCategories,
    saveAllCategories,
    addProduct,
    updateProduct,
    removeProduct,
    updateOrderStatus,
    deleteOrder,
    productTypes,
    setProductTypes,
    saveProductTypes,
    stories,
    addStory,
    deleteStory,
    reduceStock,
    getAllReviews,
    updateReviewStatus,
    deleteReview,
    giveawayEntries,
    addGiveawayEntry,
    deleteGiveawayEntry,
    giveawayEnabled,
    setGiveawayEnabled
  } = useShop();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'config' | 'reviews' | 'giveaway' | 'analytics'>(() => {
    return (localStorage.getItem('adminTab') as any) || 'products';
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showPendingOrders, setShowPendingOrders] = useState(false);
  const [configForm, setConfigForm] = useState<SiteConfig>(siteConfig);

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: string; id: string; name: string }>({ isOpen: false, type: '', id: '', name: '' });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => { setConfigForm(siteConfig); }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('adminTab', activeTab);
  }, [activeTab]);

  const handleLogin = async () => {
    if (!loginPassword.trim()) {
      setLoginError('Please enter password');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const { verifyAdminPassword } = await import('../../firebase');
      const isValid = await verifyAdminPassword(loginPassword);
      if (isValid) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
      } else {
        setLoginError('Incorrect password');
      }
    } catch (error) {
      setLoginError('Error verifying password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPass || !passwordForm.newPass || !passwordForm.confirmPass) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }
    setIsChangingPassword(true);
    try {
      const { verifyAdminPassword, saveAdminPassword } = await import('../../firebase');
      const isOldValid = await verifyAdminPassword(passwordForm.oldPass);
      if (!isOldValid) {
        showToast('Old password is incorrect', 'error');
        return;
      }
      await saveAdminPassword(passwordForm.newPass);
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
    } catch (error) {
      showToast('Error changing password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="pt-20 pb-10 bg-gray-50 min-h-screen flex items-center justify-center px-4 text-black">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-sm text-gray-500">Enter password to access the dashboard</p>
          </div>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
              />
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-gray-900 text-white py-3 text-sm font-bold rounded-lg disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteProduct = (product: Product) => {
    setDeleteConfirm({ isOpen: true, type: 'product', id: product.id, name: product.name });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.type === 'product') {
      const product = products.find(p => p.id === deleteConfirm.id);
      if (product) {
        try {
          const { deleteImage } = await import('../../firebase');
          for (const img of product.images) {
            await deleteImage(img);
          }
        } catch (err) {
          console.error('Error deleting product images:', err);
        }
      }
      removeProduct(deleteConfirm.id);
      showToast('Product deleted', 'success');
    } else if (deleteConfirm.type === 'category') {
      try {

        const indexToDelete = parseInt(deleteConfirm.id);
        const categoryToDelete = categories[indexToDelete];
        if (categoryToDelete && categoryToDelete.image) {
          const { deleteImage } = await import('../../firebase');
          await deleteImage(categoryToDelete.image);
        }

        const filteredCategories = categories.filter((_, i) => i !== indexToDelete);

        const { saveCategory } = await import('../../firebase');
        for (let i = 0; i < filteredCategories.length; i++) {
          const cat = filteredCategories[i];
          await saveCategory({ name: cat.name, image: cat.image }, `cat_${i}`);
        }

        const { deleteCategory: deleteCat } = await import('../../firebase');
        for (let i = filteredCategories.length; i < categories.length; i++) {
          await deleteCat(`cat_${i}`);
        }

        setCategories(filteredCategories);
        showToast('Category deleted', 'success');
      } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error deleting category', 'error');
      }
    } else if (deleteConfirm.type === 'order') {
      try {
        await deleteOrder(deleteConfirm.id);
        showToast('Order deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error deleting order', 'error');
      }
    }
    setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsAddingProduct(false);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsAddingProduct(true);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      if (isAddingProduct) {
        await addProduct(product);
        showToast('Product added successfully!', 'success');
      } else {
        await updateProduct(product);
        showToast('Product updated successfully!', 'success');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMsg = error?.message || 'Images may be too large';
      showToast(`Error: ${errorMsg}`, 'error');
    }
  };

  const handleUpdateCategoryImage = async (index: number, newImage: string) => {
    const updatedCategories = categories.map((cat, i) => i === index ? { ...cat, image: newImage } : cat);
    setCategories(updatedCategories);

    try {
      const { saveCategory } = await import('../../firebase');
      const cat = updatedCategories[index];
      const id = cat.id || `cat_${index}`;
      await saveCategory({ name: cat.name, image: newImage }, id);
    } catch (error: any) {
      console.error('Error saving category image:', error);
      showToast('Error saving. Try "Save Changes" button.', 'error');
    }
  };

  const handleUpdateCategoryName = async (index: number, newName: string) => {
    const updatedCategories = categories.map((cat, i) => i === index ? { ...cat, name: newName } : cat);
    setCategories(updatedCategories);

    try {
      const { saveCategory } = await import('../../firebase');
      const cat = updatedCategories[index];
      const id = cat.id || `cat_${index}`;
      await saveCategory({ name: newName, image: cat.image }, id);
    } catch (error: any) {
      console.error('Error saving category name:', error);
    }
  };

  const handleAddCategory = async () => {
    const newCat = { name: 'New Category', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800' };
    const newCategories = [...categories, newCat];
    setCategories(newCategories);

    try {
      const { saveCategory } = await import('../../firebase');
      const id = `cat_${newCategories.length - 1}`;
      await saveCategory(newCat, id);
      showToast('Category added!', 'success');
    } catch (error: any) {
      console.error('Error saving new category:', error);
      showToast('Category added locally. Click "Save Changes" to persist.', 'info');
    }
  };

  const handleDeleteCategory = (index: number, name: string) => {
    setDeleteConfirm({ isOpen: true, type: 'category', id: index.toString(), name });
  };

  const handleSaveCategories = async () => {
    try {
      showToast('Saving categories...', 'info');
      await saveAllCategories();
      showToast('Categories saved!', 'success');
    } catch (error: any) {
      console.error('Error saving categories:', error);
      showToast(`Error: ${error?.message || 'Images may be too large'}`, 'error');
    }
  };

  const handleSaveConfig = () => {
    setSiteConfig(configForm);
    showToast('Settings saved!', 'success');
  };



  const stats = [
    { label: 'Products', value: products.length, icon: '📦' },
    { label: 'In Stock', value: products.filter(p => p.stock > 0).length, icon: '✓' },
    { label: 'Categories', value: categories.length, icon: '🏷️' },
    { label: 'Orders', value: orders.length, icon: '🛒' },
  ];

  const tabs = [
    { id: 'products' as const, label: 'Products', icon: '📦' },
    { id: 'categories' as const, label: 'Categories', icon: '🏷️' },
    { id: 'product-types' as const, label: 'Filters', icon: '⚡' },
    { id: 'orders' as const, label: 'Orders', icon: '📋' },
    { id: 'reviews' as const, label: 'Reviews', icon: '⭐' },
    { id: 'giveaway' as const, label: 'Giveaway', icon: '🎁' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📊' },
    { id: 'config' as const, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="pt-28 md:pt-36 pb-24 md:pb-12 bg-gray-50 min-h-screen text-black relative z-0">
      <div className="max-w-6xl mx-auto px-4">
        <div className="py-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your store</p>
          </div>
          <a href="/admin/pos" className="shrink-0 px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow hover:bg-black">🧾 Billing →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="hidden md:flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 gap-4">
              <h2 className="text-base font-bold text-gray-900">Products ({products.length})</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-900 transition-colors"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <button onClick={handleAddProduct} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 text-sm font-semibold rounded-lg active:scale-[0.98] transition-transform flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).map(product => (
                <div key={product.id} className="p-4 flex gap-4">
                  <img src={product.images[0] || 'https://via.placeholder.com/80'} className="w-16 h-20 object-cover rounded-lg bg-gray-100 flex-shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${product.stock > 10 ? 'bg-green-50 text-green-600' : product.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {product.stock} left
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        {product.salePrice ? (
                          <>
                            <span className="text-lg font-bold text-red-600">₹{product.salePrice}</span>
                            <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditProduct(product)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteProduct(product)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase())).length === 0 && (
                <div className="p-12 text-center text-gray-400">No products found.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Categories ({categories.length})</h2>
              <p className="text-xs text-gray-500 mt-1">These appear on the homepage</p>
            </div>

            <div className="p-4 space-y-4">
              {categories.map((cat, index) => (
                <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <img src={cat.image} className="w-20 h-24 object-cover rounded-lg flex-shrink-0" alt="" />
                  <div className="flex-1 space-y-2">
                    <input type="text" value={cat.name} onChange={(e) => handleUpdateCategoryName(index, e.target.value)} className="w-full border border-gray-200 px-3 py-2 text-sm font-medium rounded-lg outline-none focus:border-gray-900" placeholder="Category Name" />
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer">
                        📷 Change
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const options = { maxSizeMB: 0.1, maxWidthOrHeight: 600, useWebWorker: true };
                              const compressedFile = await imageCompression(file, options);
                              const reader = new FileReader();
                              reader.onloadend = () => handleUpdateCategoryImage(index, reader.result as string);
                              reader.readAsDataURL(compressedFile);
                            } catch (error) {
                              console.error("Error compressing category image:", error);
                              showToast("Compression failed", "error");
                            }
                          }
                        }} className="hidden" />
                      </label>
                      <button onClick={() => handleDeleteCategory(index, cat.name)} className="bg-red-50 text-red-600 px-3 py-2 text-xs font-semibold rounded-lg">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={handleAddCategory} className="w-full py-3 bg-gray-900 text-white text-sm font-bold rounded-lg">Add Category</button>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={handleSaveCategories} className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-lg">Save Changes</button>
            </div>
          </div>
        )}
        {activeTab === 'product-types' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Filters ({productTypes.length})</h2>
              <p className="text-xs text-gray-500 mt-1">Manage types for filtering (e.g., Oversized T-Shirt, Karpets)</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add new product type"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !productTypes.includes(val)) {
                        setProductTypes([...productTypes, val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="flex-1 border border-gray-200 px-4 py-3 text-sm rounded-lg outline-none focus:border-gray-900"
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const val = input.value.trim();
                    if (val && !productTypes.includes(val)) {
                      setProductTypes([...productTypes, val]);
                      input.value = '';
                    }
                  }}
                  className="bg-gray-900 text-white px-6 py-3 text-sm font-bold rounded-lg"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {productTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <button
                      onClick={() => setProductTypes(productTypes.filter(t => t !== type))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={async () => {
                    try {
                      await saveProductTypes();
                      showToast('Product types saved!', 'success');
                    } catch (err) {
                      showToast('Failed to save types', 'error');
                    }
                  }}
                  className="w-full bg-green-600 text-white px-6 py-3 text-sm font-bold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-base font-bold text-gray-900">Orders ({orders.length}){orders.filter(o => o.status === OrderStatus.PENDING).length > 0 && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">({orders.filter(o => o.status === OrderStatus.PENDING).length})P</span>}</h2>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No orders yet</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{order.id}{order.status === OrderStatus.PENDING && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold">PENDING</span>}</p>
                          <p className="text-xs text-gray-500">
                            {(() => {
                              try {
                                if (!order.date) return 'Unknown Date';
                                if (typeof order.date === 'string' || typeof order.date === 'number') {
                                  const d = new Date(order.date);
                                  return isNaN(d.getTime()) ? 'Unknown Date' : d.toLocaleDateString();
                                }
                                if ((order.date as any).toDate) {
                                  return (order.date as any).toDate().toLocaleDateString();
                                }
                                return 'Unknown Date';
                              } catch {
                                return 'Unknown Date';
                              }
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                          <select
                            value={order.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as OrderStatus;
                              if (newStatus === OrderStatus.CONFIRMED && order.status === OrderStatus.PENDING) {
                                const confirmStock = window.confirm(
                                  "Confirming the order will reduce stock for these items. Continue?"
                                );
                                if (!confirmStock) return;

                                try {
                                  await reduceStock(order);
                                  showToast('Stock reduced & Order Confirmed', 'success');
                                } catch (error) {
                                  showToast('Failed to reduce stock. Order status NOT updated.', 'error');
                                  return; 
                                }
                              }
                              updateOrderStatus(order.id, newStatus);
                              if (newStatus !== OrderStatus.CONFIRMED) {
                                showToast('Order status updated', 'success');
                              }
                            }}
                            className="mt-1 text-xs bg-gray-100 border-0 rounded-lg px-2 py-1 font-semibold outline-none"
                          >
                            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, type: 'order', id: order.id, name: order.id })}
                            className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Customer Details</p>
                          <p className="text-sm font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-600">{order.customer?.email || 'N/A'}</p>
                          <p className="text-xs text-gray-600">{order.customer?.phone || 'N/A'}</p>
                          {order.customer?.instagramId && (
                            <p className="text-xs text-purple-600 font-medium mt-1">
                              IG: {order.customer.instagramId}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Shipping Address</p>
                          <p className="text-xs text-gray-600">{order.customer?.address || 'N/A'}</p>
                          <p className="text-xs text-gray-600">Pincode: {order.customer?.pincode || 'N/A'}</p>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-gray-500">Payment: </span>
                            <span className="text-xs font-bold text-gray-900 uppercase">{order.paymentMethod || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.name} | Size: {item.selectedSize} | Color: {item.selectedColor} × {item.quantity}</span>
                            <span className="font-medium text-gray-900">₹{(item.salePrice || item.price) * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === 'config' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Site Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure your store</p>
            </div>

            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Hero Section</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Hero Background Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {configForm.heroBannerImage ? (
                          <img src={configForm.heroBannerImage} alt="Hero" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const options = { maxSizeMB: 0.2, maxWidthOrHeight: 1080, useWebWorker: true };
                                const compressedFile = await imageCompression(file, options);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setConfigForm(prev => ({ ...prev, heroBannerImage: reader.result as string }));
                                };
                                reader.readAsDataURL(compressedFile);
                              } catch (error) {
                                console.error("Error compressing hero image:", error);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {configForm.heroBannerImage && (
                        <button
                          onClick={() => setConfigForm(prev => ({ ...prev, heroBannerImage: '' }))}
                          className="bg-red-50 text-red-600 border border-red-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Hero Title</label>
                    <input type="text" value={configForm.heroTitle || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, heroTitle: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="THE SEASON EDIT" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Hero Video URL (Optional)</label>
                    <input type="text" value={configForm.heroVideoUrl || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, heroVideoUrl: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="https://..." />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Subtitle</label>
                    <input type="text" value={configForm.heroSubtitle} onChange={(e) => setConfigForm(prev => ({ ...prev, heroSubtitle: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Main Button Text</label>
                      <input type="text" value={configForm.heroButtonText} onChange={(e) => setConfigForm(prev => ({ ...prev, heroButtonText: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Story Button Text</label>
                      <input type="text" value={configForm.storyButtonText || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, storyButtonText: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="Our Story" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Story Button Link</label>
                    <input type="text" value={configForm.storyButtonLink || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, storyButtonLink: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="/about" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Homepage Stories</h3>
                <div className="space-y-6">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                      const subtitle = (form.elements.namedItem('subtitle') as HTMLInputElement).value;
                      const link = (form.elements.namedItem('link') as HTMLInputElement).value;
                      const fileInput = form.elements.namedItem('image') as HTMLInputElement;
                      const file = fileInput.files?.[0];

                      if (!file) {
                        showToast('Please upload an image', 'error');
                        return;
                      }

                      try {
                        showToast('Uploading story...', 'info');
                        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1080, useWebWorker: true };
                        const compressedFile = await imageCompression(file, options);
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64 = reader.result as string;
                          await addStory({
                            id: Date.now().toString(),
                            image: base64,
                            title,
                            subtitle,
                            link,
                            createdAt: Date.now(),
                          });
                          showToast('Story added!', 'success');
                          form.reset();
                        };
                        reader.readAsDataURL(compressedFile);
                      } catch (error) {
                        console.error(error);
                        showToast('Failed to add story', 'error');
                      }
                    }}
                    className="bg-gray-50 p-4 rounded-xl space-y-4"
                  >
                    <h3 className="text-sm font-bold text-gray-900">Add New Story</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Image *</label>
                        <input type="file" name="image" accept="image/*" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Link (Optional)</label>
                        <input type="text" name="link" placeholder="/products/..." className="w-full border border-gray-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-gray-900" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Title (Optional)</label>
                        <input type="text" name="title" placeholder="Story Title" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-gray-900" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Subtitle (Optional)</label>
                        <input type="text" name="subtitle" placeholder="Short description" className="w-full border border-gray-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-gray-900" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white py-2.5 text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                      Add Story
                    </button>
                  </form>

                  <div className="space-y-4">
                    {stories.map(story => (
                      <div key={story.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-sm items-center">
                        <img src={story.image} className="w-16 h-24 object-cover rounded-lg bg-gray-100 flex-shrink-0" alt="" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{story.title || 'Untitled Story'}</h4>
                          <p className="text-xs text-gray-500 truncate">{story.subtitle}</p>
                          {story.link && <p className="text-[10px] text-blue-600 truncate mt-1">{story.link}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(story.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this story?')) {
                              deleteStory(story.id);
                              showToast('Story deleted', 'success');
                            }
                          }}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {stories.length === 0 && (
                      <div className="text-center text-gray-400 py-8 text-sm">No stories yet</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">About / Story Page</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Hero Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        {configForm.aboutImage ? (
                          <img src={configForm.aboutImage} alt="About" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true };
                                const compressedFile = await imageCompression(file, options);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setConfigForm(prev => ({ ...prev, aboutImage: reader.result as string }));
                                };
                                reader.readAsDataURL(compressedFile);
                              } catch (error) {
                                console.error("Compression failed", error);
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Page Title</label>
                    <input type="text" value={configForm.aboutTitle || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, aboutTitle: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" placeholder="MANIFESTO" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Story Text</label>
                    <textarea value={configForm.aboutText || ''} onChange={(e) => setConfigForm(prev => ({ ...prev, aboutText: e.target.value }))} rows={6} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900 resize-none whitespace-pre-wrap" placeholder="The Three Pillars..." />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                    <input type="text" value={configForm.contactPhone} onChange={(e) => setConfigForm(prev => ({ ...prev, contactPhone: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                    <input type="text" value={configForm.contactEmail} onChange={(e) => setConfigForm(prev => ({ ...prev, contactEmail: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                    <input type="text" value={configForm.contactAddress} onChange={(e) => setConfigForm(prev => ({ ...prev, contactAddress: e.target.value }))} className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Change Admin Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Old Password</label>
                    <input
                      type="password"
                      value={passwordForm.oldPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPass: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPass: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPass}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPass: e.target.value }))}
                      placeholder="Retype new password"
                      className="w-full border border-gray-200 px-4 py-3 text-base rounded-lg outline-none focus:border-gray-900"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-800 text-white py-3 text-sm font-bold rounded-lg disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <button onClick={handleSaveConfig} className="w-full bg-green-600 text-white px-6 py-4 text-sm font-bold rounded-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold">Reviews Management</h2>
              <button
                onClick={() => getAllReviews().then(setReviews)}
                className="text-sm text-gray-500 hover:text-black underline"
              >
                Refresh
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No reviews found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Comment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.productImage} alt="" className="w-10 h-10 rounded object-cover" />
                            <span className="font-medium truncate max-w-[150px]">{review.productName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{review.userName}</td>
                        <td className="px-6 py-4 text-yellow-500">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${review.status === 'approved' ? 'bg-green-100 text-green-700' :
                            review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {review.status === 'pending' && (
                            <button
                              onClick={async () => {
                                await updateReviewStatus(review.id, 'approved');
                                showToast('Review approved', 'success');
                                getAllReviews().then(setReviews);
                              }}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this review?')) {
                                await deleteReview(review.id);
                                showToast('Review deleted', 'success');
                                getAllReviews().then(setReviews);
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'giveaway' && (
          <GiveawayManager
            entries={giveawayEntries}
            onDelete={deleteGiveawayEntry}
            showToast={showToast}
            giveawayEnabled={giveawayEnabled}
            setGiveawayEnabled={setGiveawayEnabled}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex overflow-x-auto justify-start gap-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: '', id: '', name: '' })}
      />

      <ProductModal
        product={editingProduct}
        isOpen={isProductModalOpen}
        isNew={isAddingProduct}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        categories={categories}
        productTypes={productTypes}
      />
    </div >
  );
};

export default AdminDashboard;
