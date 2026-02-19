
import React from 'react';
import Hero from '../components/Hero';
import Stories from '../components/Stories';
import WallOfLove from '../components/WallOfLove';
import { Link } from 'react-router-dom';
import { useShop } from '../store';

const Home: React.FC = () => {
  const { products, categories, isLoading } = useShop();
  const featured = products.filter(p => p.isFeatured).slice(0, 3);

  return (
    <div className="bg-white">
      <Hero />
      <Stories />

      <section className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center mb-8 md:mb-12 max-w-4xl mx-auto px-2">
            <h2 className="text-base md:text-lg font-black uppercase text-gray-900 tracking-wide text-center">
              THE COLLECTION
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-8 max-w-4xl mx-auto">
            {isLoading || categories.length === 0 ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative w-[calc(50%-6px)] md:w-[calc(33.333%-11px)] max-w-[280px] aspect-[3/4] overflow-hidden bg-gray-200 rounded-sm animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-300 p-3 md:p-4">
                      <div className="h-4 bg-gray-400 rounded w-20 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              categories.map((cat, index) => (
                <Link
                  key={index}
                  to={`/shop?category=${cat.name}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm">
                    <img
                      src={cat.image}
                      alt={`${cat.name} Category`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                    />
                  </div>
                  <h3 className="text-sm md:text-base font-bold uppercase text-gray-900 tracking-wide text-center mt-3">
                    {cat.name}
                  </h3>
                </Link>
              ))
            )}
          </div>

          <div className="flex justify-end mt-8 md:mt-12 max-w-4xl mx-auto px-2">
            <Link to="/shop" className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 border-b border-gray-300 hover:border-gray-900 transition-all pb-0.5">
              View All
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-8 md:py-32 flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900 via-black to-black"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full text-center animate-fade-in">
          <span className="inline-block bg-red-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 mb-4 md:mb-6">
            Store Experience
          </span>
          <h2 className="text-3xl md:text-7xl font-oswald font-black uppercase tracking-tight mb-3 md:mb-6 text-white max-w-[90%] mx-auto">
            HALDWANI RETAIL STORE
          </h2>
          <p className="text-xs md:text-lg text-gray-400 mb-5 md:mb-10 leading-relaxed max-w-2xl mx-auto">
            Located at Panchakki Chauraha, M&S Tower.<br />
            Visit us to experience premium fabrics and custom fits.
          </p>
          <div className="flex flex-row gap-2 md:gap-4 justify-center">
            <a
              href="https://maps.app.goo.gl/dgwsiPFDMGSThHRNA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-4 py-2 md:px-8 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Locate Store
            </a>
            <a
              href="https://wa.me/919045848613"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white border border-white/20 px-4 py-2 md:px-8 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {products.filter(p => p.isTrending).length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-base md:text-lg font-black uppercase text-gray-900 text-center mb-8 md:mb-12 tracking-wide">
              TRENDING NOW
            </h2>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {products.filter(p => p.isTrending).slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-sm mb-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-sm font-bold text-gray-900">₹{product.salePrice}</span>
                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <WallOfLove />
    </div>
  );
};

export default Home;
