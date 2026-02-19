
import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../store';
import { Link, useSearchParams } from 'react-router-dom';
import AIStylist from '../components/AIStylist';

const Shop: React.FC = () => {
  const { products, categories: globalCategories, productTypes } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || 'All');

  // Sort & Filter State
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'newest' | 'price_low' | 'price_high'>('none');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const categoryNames = useMemo(() => ['All', ...globalCategories.map(c => c.name)], [globalCategories]);

  useEffect(() => {
    if (categoryFromUrl && categoryNames.includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    } else if (!categoryFromUrl) {
      setActiveCategory('All');
    }
  }, [categoryFromUrl, categoryNames]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);

    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply Type Filter (Global Override)
    if (selectedTypes.length > 0) {
      result = products.filter(p => p.productType && selectedTypes.includes(p.productType));
    } else {
      // Apply Category Filter
      if (activeCategory !== 'All') {
        result = products.filter(p => p.category === activeCategory);
      }
    }

    // Apply Sort
    if (sortBy === 'none') return result;

    return result.slice().sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'price_high':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'newest':
          return (b.createdAt || 0) - (a.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [activeCategory, products, sortBy, selectedTypes]);

  // Toggle Selection Helper
  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-center items-center mb-10 md:mb-20 gap-8">
          <AIStylist />

          <nav className="flex flex-wrap justify-center gap-6 animate-fade-in">
            {categoryNames.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`text-[10px] uppercase tracking-[0.3em] pb-1 border-b-2 transition-all duration-300 ${activeCategory === cat ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex justify-between items-start mb-10 pb-6 border-b border-gray-100">
          <div className="w-2/3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Filter:</span>
              {productTypes.length > 0 ? (
                productTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${selectedTypes.includes(type)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900'
                      }`}
                  >
                    {type}
                  </button>
                ))
              ) : (
                <span className="text-xs text-gray-300 italic">No filters available</span>
              )}

              {selectedTypes.length > 0 && (
                <button
                  onClick={() => setSelectedTypes([])}
                  className="text-xs text-red-500 underline hover:text-red-700 uppercase tracking-wider font-medium ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-none text-xs font-bold uppercase tracking-widest text-gray-900 focus:ring-0 cursor-pointer bg-transparent outline-none"
            >
              {[
                { label: 'Recommended', value: 'none' },
                { label: 'Newest', value: 'newest' },
                { label: 'Price: Low to High', value: 'price_low' },
                { label: 'Price: High to Low', value: 'price_high' },
              ].map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-16 pb-20">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-2 md:mb-6">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  loading="eager"
                />
                {product.salePrice && (
                  <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-widest shadow-sm">
                    Offer
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] md:text-xs font-bold px-2 py-1 border border-gray-200 uppercase tracking-widest shadow-sm">
                    New
                  </div>
                )}
              </div>
              <div className="space-y-1 md:space-y-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg md:text-xl font-bold font-oswald text-gray-900">₹{product.salePrice}</span>
                        <span className="text-xs text-gray-500 line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-lg md:text-xl font-bold font-oswald text-gray-900">₹{product.price}</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-gray-400 uppercase tracking-widest text-sm">No items found in this section.</p>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setIsSortOpen(true)}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 border-r border-gray-100 active:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
          </svg>
          Sort
        </button>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 active:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          Filter
          {selectedTypes.length > 0 && (
            <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center">
              {selectedTypes.length}
            </span>
          )}
        </button>
      </div>

      {isSortOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSortOpen(false)}></div>
          <div className="relative w-full bg-white rounded-t-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Sort By</h3>
              <button onClick={() => setIsSortOpen(false)} className="p-2 -mr-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-1">
              {[
                { label: 'None', value: 'none' },
                { label: 'Newest First', value: 'newest' },
                { label: 'Price: Low to High', value: 'price_low' },
                { label: 'Price: High to Low', value: 'price_high' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => { setSortBy(option.value as any); setIsSortOpen(false); }}
                  className={`w-full text-left py-3 text-sm font-medium border-b border-gray-50 last:border-0 ${sortBy === option.value ? 'text-gray-900 font-bold' : 'text-gray-500'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
          <div className="relative w-full bg-white rounded-t-2xl h-[70vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Filter</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-900 uppercase mb-4">Filter By</h4>
                {productTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No types available</p>
                ) : (
                  <div className="space-y-3">
                    {productTypes.map(type => (
                      <label key={type} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTypes.includes(type) ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'}`}>
                          {selectedTypes.includes(type) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3 h-3 text-white" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedTypes.includes(type)}
                          onChange={() => toggleType(type)}
                        />
                        <span className={`text-sm ${selectedTypes.includes(type) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-4">
              <button
                onClick={() => setSelectedTypes([])}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
