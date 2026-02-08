
import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../store';

const Hero: React.FC = () => {
  const { siteConfig } = useShop();

  return (
    <section className="relative h-[72vh] md:h-[85vh] w-full flex items-center justify-center overflow-x-clip overflow-y-visible bg-black px-4">
      {}
      <div className="absolute inset-0 z-0">
        {siteConfig.heroBannerImage ? (
          <img
            src={siteConfig.heroBannerImage}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60 grayscale"
          >
            <source src="https://player.vimeo.com/external/370331493.sd.mp4?s=27d04e137b2d58546b9a89c922a6132717a66e4a&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
      </div>

      {}
      <div className="relative z-10 text-center px-8 md:px-16">
        <div className="flex flex-col items-center animate-fade-in">
          <span className="text-mask text-xl md:text-5xl font-oswald font-black tracking-[0.1em] mb-[-0.25rem] md:mb-[-1.5rem] opacity-90 transition-all duration-700">
            {siteConfig.heroTitle?.split(' ').slice(0, 2).join(' ') || 'THE 3'}
          </span>
          <h1 className="text-5xl md:text-[12rem] font-oswald font-black leading-none text-mask">
            {siteConfig.heroTitle?.split(' ').slice(2).join(' ') || 'MONKS'}
          </h1>
          <p className="mt-4 text-sm md:text-lg uppercase tracking-[0.5em] font-light text-neutral-300">
            {siteConfig.heroSubtitle || 'Evolution of the Street Soul'}
          </p>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/shop" className="bg-white text-black px-8 py-3 md:px-12 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all w-full md:w-auto text-center">
            {siteConfig.heroButtonText || 'Shop Collection'}
          </Link>
          <Link to="/about" className="border border-white/30 text-white px-8 py-3 md:px-12 md:py-4 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all w-full md:w-auto text-center">
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
