import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../store';

const Hero: React.FC = () => {
  const { siteConfig } = useShop();

  return (
    <section className="relative h-[100dvh] w-full flex flex-col justify-end overflow-hidden pb-16 md:pb-24">
      {}
      <div className="absolute inset-0 z-0">
        {siteConfig.heroBannerImage && (
          <img 
            src={siteConfig.heroBannerImage} 
            alt="Premium Streetwear Collection" 
            className="w-full h-full object-cover object-center"
          />
        )}
        {}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center text-center px-6">
        
        <div className="animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <h2 className="text-white text-3xl md:text-6xl font-display font-black uppercase tracking-widest mb-4 drop-shadow-sm">
            {siteConfig.heroTitle || 'The Season Edit'}
          </h2>
          <p className="text-white/90 font-serif italic text-lg md:text-2xl mb-8 drop-shadow-sm">
            {siteConfig.heroSubtitle || 'Refined pieces for the modern nomad.'}
          </p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <Link
            to="/shop"
            className="inline-block bg-white text-black py-4 px-12 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            {siteConfig.heroButtonText || 'Shop Collection'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
