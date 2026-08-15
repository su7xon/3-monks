import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../store';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductUrl } from '../utils/slugify';

const Shop: React.FC = () => {
  const { products, categories: globalCategories, productTypes } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const tagFromUrl = searchParams.get('type');
  
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'newest' | 'price_low' | 'price_high'>('none');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string>(tagFromUrl || '');

  const categoryNames = useMemo(() => ['All', ...globalCategories.map(c => c.name)], [globalCategories]);

  useEffect(() => {
    setActiveTag(tagFromUrl || '');
    if (tagFromUrl) {
      setActiveCategory('All');
      setSearchParams({ type: tagFromUrl }, { replace: true });
    } else if (categoryFromUrl && categoryNames.includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    } else if (!categoryFromUrl) {
      setActiveCategory('All');
    }
  }, [categoryFromUrl, tagFromUrl, categoryNames]);

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

    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (activeTag) {
      result = result.filter(p => (p.tags || []).includes(activeTag));
    } else if (selectedTypes.length > 0 && !selectedTypes.includes('All')) {
      result = result.filter(p => p.productType && selectedTypes.includes(p.productType));
    } else {
      if (activeCategory !== 'All') {
        result = result.filter(p => p.category === activeCategory);
      }
    }

    if (sortBy === 'none') return result;

    return result.slice().sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'price_high':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'newest':
          let timeA = Number(a.createdAt) || 0;
          let timeB = Number(b.createdAt) || 0;
          if (isNaN(timeA)) timeA = 0;
          if (isNaN(timeB)) timeB = 0;
          return timeB - timeA;
        default:
          return 0;
      }
    });
  }, [activeCategory, products, sortBy, selectedTypes, searchQuery, activeTag]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredProducts]);

  const toggleType = (type: string) => {
    if (type === 'All') {
      setSelectedTypes([]);
      return;
    }
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-white min-h-screen animate-page-fade text-black selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {}
        <div className="mb-8 md:mb-16 mt-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8 border-b border-gray-100 pb-8">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-widest">
              Collection
            </h1>

            {}
            <div className="relative w-full md:w-1/3 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-sm py-3 pl-12 pr-4 text-xs font-bold text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all"
              />
            </div>
          </div>

          {}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {categoryNames.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-colors whitespace-nowrap pb-1 border-b-2 ${activeCategory === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative flex items-center min-w-[150px] shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-gray-200 text-black text-[10px] font-bold uppercase tracking-[0.15em] py-3 pl-4 pr-8 outline-none appearance-none cursor-pointer hover:border-black transition-colors rounded-sm"
              >
                <option value="none">Sort By: Featured</option>
                <option value="newest">Sort By: Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <div className="absolute right-4 pointer-events-none text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>

          {activeTag && (
            <div className="flex items-center gap-3 mb-6 bg-gray-900 text-white rounded-sm px-4 py-3">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">Tag: {activeTag}</span>
              <span className="text-xs text-gray-400">({filteredProducts.length} items)</span>
              <button
                onClick={() => {
                  setActiveTag('');
                  setSearchParams({});
                }}
                className="ml-auto text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Clear ×
              </button>
            </div>
          )}

          {}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => toggleType('All')}
              className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-colors ${selectedTypes.length === 0 ? 'bg-black text-white' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-black'}`}
            >
              All Types
            </button>
            {productTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`whitespace-nowrap px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition-colors ${selectedTypes.includes(type) ? 'bg-black text-white' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-black'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-x-6 md:gap-y-12 pb-20">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              to={getProductUrl(product.name, product.id)}
              className="group block relative reveal-up"
              style={{ transitionDelay: `${(index % 4) * 0.1}s` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl mb-4 group-hover:shadow-md transition-shadow">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />

                {}
                {product.isNew && !product.salePrice && (
                  <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full z-10">
                    New
                  </div>
                )}
                {product.salePrice && (
                  <div className="absolute top-3 right-3 bg-[#e60000] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-10">
                    Sale
                  </div>
                )}
                
                {product.isTrending && (
                  <div className={`absolute left-3 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-full z-10 ${product.isNew ? 'top-10' : 'top-3'}`}>
                    Trending
                  </div>
                )}
                

              </div>

              {}
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-black tracking-wide uppercase line-clamp-1 mb-1 font-display">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-sm font-bold text-[#e60000]">
                          ₹{product.salePrice}
                        </span>
                        <span className="text-gray-400 line-through text-[11px]">
                          ₹{product.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-black">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  
                  {}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      {product.colors.slice(0, 3).map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-2.5 h-2.5 rounded-full border border-gray-200" 
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center animate-fade-in">
            <p className="text-gray-400 font-display font-bold text-xl uppercase tracking-widest">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
