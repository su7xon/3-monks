import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Stories from '../components/Stories';
import WallOfLove from '../components/WallOfLove';
import { Link } from 'react-router-dom';
import { useShop } from '../store';
import { getProductUrl } from '../utils/slugify';

const MarqueeSeparator = ({ text }: { text: string }) => (
  <div className="w-full bg-white border-y border-gray-100 py-4 overflow-hidden flex whitespace-nowrap relative">
    <div className="animate-marquee inline-block whitespace-nowrap text-black font-display font-bold text-xs md:text-sm tracking-[0.4em] uppercase">
      {Array(20).fill(text).map((t, i) => (
        <span key={i} className="mx-4">{t} <span className="mx-4 text-gray-300">|</span></span>
      ))}
    </div>
  </div>
);

const ProductCard: React.FC<{ product: any, index: number }> = ({ product, index }) => {
  const discount = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  return (
    <Link
      to={getProductUrl(product.name, product.id)}
      className="group block relative flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] snap-start reveal-up"
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl mb-4 group-hover:shadow-lg transition-all duration-300">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-[#e60000] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm z-10 shadow-sm">
            {discount}% OFF
          </div>
        )}

        {}
        {product.isTrending && (
          <div className={`absolute left-3 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm z-10 shadow-sm ${discount > 0 ? 'top-10' : 'top-3'}`}>
            🔥 TRENDING
          </div>
        )}
        
      </div>
      <h3 className="text-sm font-bold text-black tracking-wide uppercase line-clamp-1 mb-1 font-display pr-4">{product.name}</h3>
      <div className="flex items-center gap-2">
        {product.salePrice ? (
          <>
            <span className="text-[11px] text-gray-500 line-through">₹{product.price}</span>
            <span className="text-sm font-bold text-[#e60000]">₹{product.salePrice}</span>
          </>
        ) : (
          <span className="text-sm font-bold text-black">₹{product.price}</span>
        )}
      </div>
    </Link>
  );
};

const Home: React.FC = () => {
  const { products, categories, isLoading } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory || p.productType === activeCategory);

  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNew);
  const topPicks = filteredProducts.filter(p => p.isTopPick);
  const displayTopPicks = topPicks.length > 0 ? topPicks : filteredProducts.slice(0, 8);
  const trendingProducts = products.filter(p => p.isTrending);
  const tagSections = Array.from(new Set((products as any[]).flatMap(p => p.tags || [])))
    .map(tag => ({ tag: tag as string, items: products.filter(p => (p.tags || []).includes(tag as string)) }))
    .filter(s => s.items.length > 0);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [categories, products]);

  return (
    <div className="bg-white min-h-screen text-black animate-page-fade">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
         <Stories />
      </div>

      <MarqueeSeparator text="NEW DROP" />

      <section className="py-16 md:py-24 px-4 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col justify-center items-center mb-12 md:mb-16 max-w-4xl mx-auto px-2 text-center reveal-up">
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase text-black tracking-widest">
              The Collection
            </h2>
          </div>

          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {isLoading || categories.length === 0 ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] snap-start aspect-[3/4] overflow-hidden bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </>
            ) : (
              categories.map((cat, index) => {
                return (
                <Link
                  key={index}
                  to={`/shop?category=${cat.name}`}
                  className="group block relative flex-none w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[22vw] snap-start reveal-up"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={cat.image}
                      alt={`${cat.name} Category`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-full">
                      <h3 className="text-xl md:text-2xl font-black font-display uppercase text-white tracking-widest drop-shadow-md">
                        {cat.name}
                      </h3>
                      <span className="mt-2 text-[10px] bg-white text-black px-4 py-1.5 uppercase font-bold tracking-widest group-hover:bg-black group-hover:text-white transition-colors rounded-full shadow-md">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </Link>
              )})
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-6 reveal-up">
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-black">
              Top Picks
            </h2>
            <Link 
              to={`/shop${activeCategory !== 'All' ? `?category=${activeCategory}` : ''}`} 
              className="px-6 py-2.5 border border-gray-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 md:gap-10 pb-4 mb-6 reveal-up hide-scrollbar">
            {['All', ...categories.map(c => c.name)].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap text-2xl md:text-4xl font-display font-medium transition-colors ${activeCategory === cat ? 'text-black font-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {displayTopPicks.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {trendingProducts.length > 0 && (
            <div className="mt-16 md:mt-24">
              <div className="flex justify-between items-end mb-6 reveal-up">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-black flex items-center gap-3">
                  Trending Now <span className="text-3xl md:text-5xl">🔥</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {trendingProducts.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {bestSellers.length > 0 && (
            <div className="mt-16 md:mt-24">
              <div className="flex justify-between items-end mb-6 reveal-up">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-black">
                  Best Sellers
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {bestSellers.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {newArrivals.length > 0 && (
            <div className="mt-16 md:mt-24">
              <div className="flex justify-between items-end mb-6 reveal-up">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-black">
                  New Arrivals
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {newArrivals.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {tagSections.map(({ tag, items }) => (
            <div key={tag} className="mt-16 md:mt-24">
              <div className="flex justify-between items-end mb-6 reveal-up">
                <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tighter text-black">
                  {tag}
                </h2>
                <Link
                  to={`/shop?type=${encodeURIComponent(tag)}`}
                  className="px-6 py-2.5 border border-gray-900 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {items.slice(0, 8).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-24 md:py-32 flex items-center overflow-hidden border-t border-gray-100 bg-[#f8f8f8]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full text-center reveal-up">
          <span className="inline-block bg-black text-white text-[9px] uppercase tracking-[0.3em] font-bold px-4 py-2 mb-6 rounded-sm">
            Store Experience
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-widest mb-4 md:mb-6 text-black max-w-[90%] mx-auto">
            Haldwani Retail Store
          </h2>
          <p className="text-sm text-gray-500 tracking-[0.1em] mb-8 md:mb-12 leading-relaxed max-w-xl mx-auto uppercase">
            Located at Panchakki Chauraha, M&S Tower.<br />
            Visit us to experience exclusive streetwear and trend setting fits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <a
              href="https://maps.app.goo.gl/dgwsiPFDMGSThHRNA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm"
            >
              Locate Store
            </a>
          </div>
        </div>
      </section>

      <WallOfLove />
    </div>
  );
};

export default Home;
