
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProductStock } from '../../firebase';
import { Product } from '../../types';

const StockManager: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [variantStock, setVariantStock] = useState<{ [key: string]: number }>({});
  const [colorStock, setColorStock] = useState<{ [key: string]: number }>({});

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError('');
    try {
      const p = await getProductById(productId);
      if (p) {
        setProduct(p);
        setVariantStock({ ...(p.variantStock || {}) });
        setColorStock({ ...(p.colorStock || {}) });
      } else {
        setError('Product not found');
      }
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const computeTotalStock = (vs: { [key: string]: number }) => {
    return Object.values(vs).reduce((a, b) => a + b, 0);
  };

  const handleVariantChange = (key: string, delta: number) => {
    setVariantStock(prev => {
      const newVal = Math.max(0, (prev[key] || 0) + delta);
      const updated = { ...prev, [key]: newVal };

      // Also update colorStock
      if (product?.colors?.length) {
        const color = key.split('_')[0];
        const newColorStock = { ...colorStock };
        let colorTotal = 0;
        for (const k of Object.keys(updated)) {
          if (k.startsWith(`${color}_`)) {
            colorTotal += updated[k];
          }
        }
        newColorStock[color] = colorTotal;
        setColorStock(newColorStock);
      }

      return updated;
    });
    setSuccess('');
  };

  const handleDirectInput = (key: string, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setVariantStock(prev => {
      const updated = { ...prev, [key]: num };

      if (product?.colors?.length) {
        const color = key.split('_')[0];
        const newColorStock = { ...colorStock };
        let colorTotal = 0;
        for (const k of Object.keys(updated)) {
          if (k.startsWith(`${color}_`)) {
            colorTotal += updated[k];
          }
        }
        newColorStock[color] = colorTotal;
        setColorStock(newColorStock);
      }

      return updated;
    });
    setSuccess('');
  };

  const handleSave = async () => {
    if (!productId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const total = computeTotalStock(variantStock);
      await updateProductStock(productId, variantStock, total, colorStock);
      setSuccess('Stock updated successfully!');
      // Refresh product data
      const p = await getProductById(productId);
      if (p) {
        setProduct(p);
      }
    } catch {
      setError('Failed to update stock. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalStock = computeTotalStock(variantStock);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold mb-2">Product Not Found</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/admin')} className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl">
            Go to Admin
          </button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasVariants = product.sizes && product.sizes.length > 0;
  const colors = product.colors?.length ? product.colors : ['Standard'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-neutral-800">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/admin')} className="p-2 -ml-2 hover:bg-white/5 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-sm font-bold tracking-wider uppercase">Stock Manager</h1>
          <button onClick={fetchProduct} className="p-2 -mr-2 hover:bg-white/5 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Product Info Card */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex gap-4 items-center">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-xl border border-white/10 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{product.name}</h2>
            {product.subtitle && <p className="text-white/40 text-xs mt-0.5 truncate">{product.subtitle}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-white/50 text-xs">₹{product.price}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono">
                {product.barcode}
              </span>
            </div>
          </div>
        </div>

        {/* Total Stock Badge */}
        <div className="bg-gradient-to-r from-white/[0.05] to-white/[0.02] rounded-2xl border border-white/[0.06] p-5 text-center">
          <p className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Total Stock</p>
          <p className="text-4xl font-black tabular-nums">{totalStock}</p>
          {product.stock !== totalStock && (
            <p className="text-white/30 text-xs mt-1">was {product.stock}</p>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {success}
          </div>
        )}

        {/* Variant Stock Controls */}
        {hasVariants ? (
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase px-1">Variants</p>
            {colors.map(color =>
              product.sizes!.map(size => {
                const key = `${color}_${size}`;
                const currentVal = variantStock[key] || 0;
                const originalVal = product.variantStock?.[key] || 0;
                const changed = currentVal !== originalVal;

                return (
                  <div
                    key={key}
                    className={`bg-white/[0.03] rounded-xl border p-3.5 flex items-center justify-between transition-all ${
                      changed ? 'border-white/20 bg-white/[0.05]' : 'border-white/[0.06]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{color === 'Standard' ? size : `${color} — ${size}`}</p>
                      {changed && (
                        <p className="text-white/30 text-[10px] mt-0.5">was {originalVal}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVariantChange(key, -1)}
                        disabled={currentVal <= 0}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:border-white/10 disabled:hover:text-white active:scale-90"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={currentVal}
                        onChange={(e) => handleDirectInput(key, e.target.value)}
                        className="w-14 h-9 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold tabular-nums outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleVariantChange(key, 1)}
                        className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Simple stock control for products without variants */
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">Adjust Stock</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setVariantStock(prev => {
                    const v = Math.max(0, (prev['_total'] || product.stock || 0) - 1);
                    return { '_total': v };
                  });
                  setSuccess('');
                }}
                className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all active:scale-90"
              >
                −
              </button>
              <input
                type="number"
                value={hasVariants ? totalStock : (variantStock['_total'] ?? product.stock ?? 0)}
                onChange={(e) => {
                  const v = Math.max(0, parseInt(e.target.value) || 0);
                  setVariantStock({ '_total': v });
                  setSuccess('');
                }}
                className="w-24 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-2xl font-black tabular-nums outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => {
                  setVariantStock(prev => {
                    const v = (prev['_total'] ?? product.stock ?? 0) + 1;
                    return { '_total': v };
                  });
                  setSuccess('');
                }}
                className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all active:scale-90"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-white text-black font-bold text-sm rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Stock Changes
            </>
          )}
        </button>

        {/* Quick Info */}
        <div className="text-center pb-8">
          <p className="text-white/20 text-[10px] tracking-wider">
            {product.id} • {product.colors?.join(', ') || 'No colors'} • {product.sizes?.join(', ') || 'No sizes'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockManager;
