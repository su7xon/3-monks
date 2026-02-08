
import React, { useState, useEffect, useMemo } from 'react';
import { useShop } from '../store';
import { Link, useSearchParams } from 'react-router-dom';
import AIStylist from '../components/AIStylist';

const Shop: React.FC = () => {
  const { products, categories: globalCategories } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState<string>(categoryFromUrl || 'All');

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
    const filtered = activeCategory === 'All'
      ? products
      : products.filter(p => p.category === activeCategory);

    return filtered.slice().sort((a, b) => {
      const dateA = a.createdAt || 0;
      const dateB = b.createdAt || 0;
      if (dateA !== dateB) return dateB - dateA;

      return a.name.localeCompare(b.name);
    });
  }, [activeCategory, products]);

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        {}
        <div className="flex flex-col md:flex-row justify-center items-center mb-20 gap-8">

          {}
          <AIStylist />

          {}
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

        {}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 md:gap-x-8 md:gap-y-16">
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
    </div>
  );
};

export default Shop;
