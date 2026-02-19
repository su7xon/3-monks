import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../store';

const Hero: React.FC = () => {
  const { siteConfig } = useShop();

  return (
    <section className="relative h-[80dvh] md:h-screen w-full flex items-center justify-center overflow-hidden bg-black px-4">
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

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center">

        <div className="flex flex-col items-center gap-2 md:gap-4 animate-fade-in">
          <img
            src="/hero-logo.png"
            alt="The 3"
            className="w-32 md:w-56 object-contain opacity-90 drop-shadow-2xl"
          />

          <p className="text-sm md:text-xl uppercase tracking-[0.4em] font-light text-neutral-200 drop-shadow-md px-2">
            {siteConfig.heroSubtitle || 'Evolution of the Street Soul'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full max-w-xs md:max-w-none gap-4 mt-8 md:mt-10 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link
            to="/shop"
            className="w-full md:w-auto bg-white text-black py-4 px-10 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all text-center whitespace-nowrap shadow-lg"
          >
            {siteConfig.heroButtonText || 'Shop Collection'}
          </Link>
          <Link
            to={siteConfig.storyButtonLink || '/about'}
            className="w-full md:w-auto border border-white/40 text-white py-4 px-10 text-xs md:text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-center whitespace-nowrap shadow-lg"
          >
            {siteConfig.storyButtonText || 'Our Story'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
