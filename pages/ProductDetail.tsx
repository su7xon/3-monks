
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import { Product } from '../types';
import { useToast } from '../components/Toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart } = useShop();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const p = products.find(p => p.id === id);
    if (p) {
      setProduct(p);

      setSelectedSize('');
      setSelectedColor(p.colors?.[0] || '');
    } else {
      navigate('/shop');
    }
  }, [id, products, navigate]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Please select a size first', 'error');
      return;
    }
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: 1
    });
    showToast('Added to cart!', 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Please select a size first', 'error');
      return;
    }
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      quantity: 1
    });
    navigate('/checkout');
  };

  return (
    <div className="pt-20 md:pt-24 pb-10 md:pb-16 bg-white min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 animate-fade-in">
          {}
          <div className="space-y-3 md:space-y-4">
            <div className="aspect-square md:aspect-square lg:aspect-[4/5] max-h-[500px] bg-gray-100 overflow-hidden">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-gray-900' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {}
          <div className="flex flex-col">
            <div className="mb-6 md:mb-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-medium">Drop 001 / Archive Collection</p>
              <h1 className="text-2xl md:text-4xl font-oswald font-bold uppercase tracking-tighter mb-3 md:mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                {product.salePrice ? (
                  <>
                    <span className="text-xl md:text-2xl text-gray-400 line-through">₹{product.price}</span>
                    <span className="text-3xl md:text-4xl font-bold font-oswald text-gray-900">₹{product.salePrice}</span>
                  </>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold font-oswald text-gray-900">₹{product.price}</span>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                {product.description}
              </p>
            </div>

            {}
            <div className="space-y-6 md:space-y-12">
              {}
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 md:mb-4 block">Select Finish</span>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-3 md:px-6 md:py-3 text-sm font-medium rounded-md border transition-all ${selectedColor === color ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'border-gray-300 text-gray-900 hover:border-gray-900 bg-white'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 md:mb-4 block">Select Size</span>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-sm font-bold rounded-md border transition-all ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'border-gray-300 text-gray-900 hover:border-gray-900 bg-white'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div className="hidden md:block pt-10 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest mb-4">
                  <span className="text-gray-400">Stock Status</span>
                  {(() => {

                    let currentStock = product.stock;
                    let msg = 'Stock';

                    if (selectedColor && selectedSize && product.variantStock) {
                      const variantKey = `${selectedColor}_${selectedSize}`;
                      if (product.variantStock[variantKey] !== undefined) {
                        currentStock = product.variantStock[variantKey];
                        msg = `${selectedColor} / ${selectedSize}`;
                      }
                    } else if (selectedColor && product.colorStock && product.colorStock[selectedColor] !== undefined) {
                      currentStock = product.colorStock[selectedColor];
                      msg = selectedColor;
                    }

                    return (
                      <span className={currentStock > 0 ? 'text-gray-900 font-bold' : 'text-red-500'}>
                        {currentStock > 10 ? 'Available' : currentStock > 0 ? `Only ${currentStock} left` : `Out of Stock (${msg})`}
                      </span>
                    );
                  })()}
                </div>

                {}
                <div className="hidden md:block space-y-6">

                  {(() => {

                    let currentStock = product.stock;
                    let stockLabel = '';

                    if (selectedColor && selectedSize && product.variantStock) {
                      const variantKey = `${selectedColor}_${selectedSize}`;
                      if (product.variantStock[variantKey] !== undefined) {
                        currentStock = product.variantStock[variantKey];
                        stockLabel = `(in ${selectedColor}, ${selectedSize})`;
                      }
                    } else if (selectedColor && product.colorStock && product.colorStock[selectedColor] !== undefined) {

                      currentStock = product.colorStock[selectedColor];
                      stockLabel = `(in ${selectedColor})`;
                    }

                    return (
                      <>
                        <button
                          onClick={handleAddToCart}
                          disabled={currentStock === 0}
                          className="w-full py-4 bg-[#FFD814] text-black text-sm md:text-base font-bold uppercase tracking-wider hover:bg-[#F7CA00] transition-colors rounded-full shadow-sm border border-[#FCD200] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {currentStock === 0 ? `Out of Stock ${stockLabel}` : 'Add to Cart'}
                        </button>

                        <button
                          onClick={handleBuyNow}
                          disabled={currentStock === 0}
                          className="w-full py-4 bg-gray-900 text-white text-sm md:text-base font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy Now
                        </button>
                      </>
                    );
                  })()}

                  <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    Free Worldwide Shipping on all Monks Drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 pb-8 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {}
        <div className="flex justify-end mb-2">
          {(() => {
            let currentStock = product.stock;
            if (selectedColor && selectedSize && product.variantStock) {
              const variantKey = `${selectedColor}_${selectedSize}`;
              if (product.variantStock[variantKey] !== undefined) {
                currentStock = product.variantStock[variantKey];
              }
            } else if (selectedColor && product.colorStock && product.colorStock[selectedColor] !== undefined) {
              currentStock = product.colorStock[selectedColor];
            }

            return (
              <span className={`text-[10px] uppercase font-bold tracking-wider ${currentStock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                {currentStock > 10 ? 'Available' : currentStock > 0 ? `Only ${currentStock} Left` : 'Out of Stock'}
              </span>
            );
          })()}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
            <p className="text-lg font-oswald font-bold text-gray-900">₹{product.salePrice || product.price}</p>
          </div>
          {(() => {
            let currentStock = product.stock;
            if (selectedColor && selectedSize && product.variantStock) {
              const variantKey = `${selectedColor}_${selectedSize}`;
              if (product.variantStock[variantKey] !== undefined) {
                currentStock = product.variantStock[variantKey];
              }
            } else if (selectedColor && product.colorStock && product.colorStock[selectedColor] !== undefined) {
              currentStock = product.colorStock[selectedColor];
            }

            return (
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="px-4 py-3 bg-[#FFD814] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#F7CA00] transition-colors rounded-full shadow-sm border border-[#FCD200] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStock === 0 ? 'OOS' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={currentStock === 0}
                  className="px-4 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {}
      <div className="h-32 md:hidden"></div>
    </div>
  );
};

export default ProductDetail;
