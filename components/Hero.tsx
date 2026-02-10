
import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../store';

const Hero: React.FC = () => {
  const { siteConfig } = useShop();

  return (
    <section className="relative h-[72vh] md:h-[85vh] w-full flex items-center justify-center overflow-x-clip overflow-y-visible bg-black px-4">
      { }
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

      { }
      <div className="relative z-10 text-center px-8 md:px-16 md:-mt-52">
        <div className="flex flex-col items-center animate-fade-in">
          <img
            src="/hero-logo.png"
            alt="The 3"
            className="w-28 md:w-36 mb-1 md:mb-1 object-contain opacity-90 mt-8 md:mt-36"
          />

          <p className="mt-8 md:mt-4 text-sm md:text-lg uppercase tracking-[0.5em] font-light text-neutral-300">
            {siteConfig.heroSubtitle || 'Evolution of the Street Soul'}
          </p>
        </div>

        <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 animate-fade-in w-full px-5" style={{ animationDelay: '0.3s' }}>
          <Link to="/shop" className="bg-white text-black py-4 md:px-14 md:py-5 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all w-full md:w-auto text-center">
            {siteConfig.heroButtonText || 'Shop Collection'}
          </Link>
          <Link to={siteConfig.storyButtonLink || '/about'} className="border border-white/30 text-white py-4 md:px-14 md:py-5 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all w-full md:w-auto text-center">
            {siteConfig.storyButtonText || 'Our Story'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
