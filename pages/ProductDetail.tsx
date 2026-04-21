
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../store';
import { Product } from '../types';
import { useToast } from '../components/Toast';
import ImageViewer from '../components/ImageViewer';
import { ReviewsList, ReviewForm } from '../components/Reviews';

const ProductDetail: React.FC = () => {
  const { slug } = useParams();
  const id = slug?.split('-').pop();
  const navigate = useNavigate();
  const { products, addToCart, isLoading } = useShop();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentVariantStock, setCurrentVariantStock] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!product) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && activeImage < product.images.length - 1) {
      setActiveImage(activeImage + 1);
    } else if (diff < -threshold && activeImage > 0) {
      setActiveImage(activeImage - 1);
    }
  };

  const getStockForVariant = (size: string, color: string): number => {
    if (!product) return 0;

    // If no specific variant tracking is set up at all, use total stock
    if (!product.variantStock || Object.keys(product.variantStock).length === 0) {
      return product.stock;
    }

    const colorKey = color || 'Standard';
    const variantKey = `${colorKey}_${size}`;

    // 1. Try exact match (e.g. "Standard_S")
    if (product.variantStock[variantKey] !== undefined) return product.variantStock[variantKey];

    // 2. Try size-only match (e.g. "S")
    if (product.variantStock[size] !== undefined) return product.variantStock[size];

    // 3. Try underscore-prefixed match (e.g. "_S")
    if (product.variantStock[`_${size}`] !== undefined) return product.variantStock[`_${size}`];

    return 0;
  };

  useEffect(() => {
    if (isLoading) return;

    const p = products.find(p => p.id === id);
    if (p) {
      setProduct(p);
      setSelectedSize('');
      setIsExpanded(false);
      const initialColor = p.colors?.[0] || '';
      setSelectedColor(initialColor);
      setCurrentVariantStock(p.stock); // Initially show total stock
    } else {
      navigate('/shop');
    }
  }, [id, products, navigate, isLoading]);

  useEffect(() => {
    if (product && selectedSize) {
      const stock = getStockForVariant(selectedSize, selectedColor);
      setCurrentVariantStock(stock);
    } else if (product) {
      setCurrentVariantStock(product.stock);
    }
  }, [selectedSize, selectedColor, product]);

  useEffect(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current;
      const isTruncated = el.scrollHeight > el.clientHeight;
      if (isTruncated) {
        setShowSeeMore(true);
      } else if (!isExpanded) {
        // Only hide if not currently expanded, to avoid button flickering
        setShowSeeMore(false);
      }
    }
  }, [product, product?.description, isExpanded]);


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

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | III MONKS`,
      text: `Check out ${product.name} from III MONKS Premium Streetwear!`,
      url: window.location.origin + window.location.pathname,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('[Share] Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Product link copied!', 'success');
      } catch (err) {
        showToast('Failed to copy link', 'error');
      }
    }
  };

  if (isLoading || !product) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Loading Product...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-10 md:pb-16 bg-white min-h-screen text-gray-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 animate-fade-in">
          <div className="space-y-3 md:space-y-4">
            <div
              className="aspect-square md:aspect-square lg:aspect-[4/5] max-h-[500px] bg-gray-100 overflow-hidden cursor-zoom-in group relative"
              onClick={() => setIsViewerOpen(true)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-500"
                loading="eager"
              />
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              </div>
              {product.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                  {product.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${activeImage === idx ? 'bg-gray-900 w-4' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-gray-900' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-6 md:mb-8">
              <div className="flex-1">
                {product.subtitle && (
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 font-medium">{product.subtitle}</p>
                )}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl md:text-4xl font-oswald font-bold uppercase tracking-tighter mb-2 flex-grow">{product.name}</h1>
                  <button 
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100 group"
                    title="Share product"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0 10.628a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-2xl font-bold text-gray-900">₹{product.salePrice || product.price}</p>
                  {product.salePrice && (
                    <p className="text-lg text-gray-400 line-through">₹{product.price}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <p
                  ref={descriptionRef}
                  className={`text-gray-700 leading-relaxed text-base md:text-lg transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}
                >
                  {product.description}
                </p>
                {showSeeMore && (
                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                    >
                      {isExpanded ? 'See Less' : 'See More'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 md:space-y-12">
              {product.colors && product.colors.length > 0 && (
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
              )}

              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 md:mb-4 block">Select Size</span>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {product.sizes.map(size => {
                    const sizeStock = getStockForVariant(size, selectedColor);
                    const isOutOfStock = sizeStock === 0;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 md:w-14 md:h-14 flex flex-col items-center justify-center rounded-md border transition-all ${selectedSize === size
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                          : isOutOfStock
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed opacity-60'
                            : 'border-gray-300 text-gray-900 hover:border-gray-900 bg-white'
                          }`}
                      >
                        <span className="text-sm font-bold">{size}</span>
                        {isOutOfStock && <span className="text-[7px] uppercase leading-none mt-1 text-red-500 font-bold">OOS</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden md:block pt-10 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest mb-4">
                  <span className="text-gray-400">Stock Status</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${currentVariantStock! > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {currentVariantStock! > 10 ? 'Available' : currentVariantStock! > 0 ? `Only ${currentVariantStock} Left` : 'OUT OF STOCK'}
                  </span>
                </div>

                <div className="hidden md:block space-y-6">
                  <>
                    {currentVariantStock! > 0 && (
                      <button
                        onClick={handleAddToCart}
                        className="w-full py-4 bg-[#FFD814] text-black text-sm md:text-base font-bold uppercase tracking-wider hover:bg-[#F7CA00] transition-colors rounded-full shadow-sm border border-[#FCD200]"
                      >
                        Add to Cart
                      </button>
                    )}

                    <button
                      onClick={handleBuyNow}
                      disabled={currentVariantStock === 0}
                      className="w-full py-4 bg-gray-900 text-white text-sm md:text-base font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </>

                  <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    Free Worldwide Shipping on all Monks Drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-16 md:mt-24 border-t border-gray-100 pt-12 md:pt-16">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1">
            <h2 className="text-2xl font-oswald font-bold uppercase tracking-tighter mb-8">Customer Reviews</h2>
            <ReviewsList productId={product.id} />
          </div>
          <div className="w-full md:w-1/3">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Write a Review</h3>
              <ReviewForm productId={product.id} productName={product.name} productImage={product.images[0]} />
            </div>
          </div>
        </div>
      </div>


      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3 pb-8 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-end mb-2">
          <span className={`text-[10px] uppercase font-bold tracking-wider ${currentVariantStock! > 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {currentVariantStock! > 10 ? 'Available' : currentVariantStock! > 0 ? `Only ${currentVariantStock} Left` : 'OUT OF STOCK'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
            <p className="text-lg font-oswald font-bold text-gray-900">₹{product.salePrice || product.price}</p>
          </div>
          {currentVariantStock! > 0 && (
            <button
              onClick={handleAddToCart}
              className="px-4 py-3 bg-[#FFD814] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#F7CA00] transition-colors rounded-full shadow-sm border border-[#FCD200]"
            >
              Add to Cart
            </button>
          )}
          <button
            onClick={handleBuyNow}
            disabled={currentVariantStock === 0}
            className="px-4 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </div>
      </div>

      <div className="h-32 md:hidden"></div>

      <ImageViewer
        images={product.images}
        initialIndex={activeImage}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div >
  );
};

export default ProductDetail;
