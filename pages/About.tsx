
import React from 'react';

import { useShop } from '../store';

const About: React.FC = () => {
  const { siteConfig } = useShop();

  return (
    <div className="pt-20 md:pt-32 pb-10 md:pb-20 bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <section className="mb-16 md:mb-40">
          <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400 mb-2 md:mb-4 block italic">Philosophy</span>
          <h1 className="text-3xl md:text-[10rem] font-oswald font-black uppercase tracking-tighter leading-none mb-8 md:mb-20 text-mask">
            {siteConfig.aboutTitle || 'MANIFESTO'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">
            <div className="aspect-square md:aspect-[3/4] bg-gray-100 overflow-hidden">
              <img
                src={siteConfig.aboutImage || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"}
                className="w-full h-full object-cover grayscale opacity-80"
                alt="About"
              />
            </div>
            <div className="space-y-4 md:space-y-8">
              <h2 className="text-2xl md:text-4xl font-oswald font-bold uppercase tracking-tight text-gray-900">The Three Pillars</h2>
              <div className="space-y-4 md:space-y-6 text-sm md:text-lg text-gray-500 font-light leading-relaxed whitespace-pre-wrap">
                {siteConfig.aboutText ? (
                  <p>{siteConfig.aboutText}</p>
                ) : (
                  <>
                    <p>
                      <span className="text-gray-900 font-bold uppercase tracking-widest text-sm block mb-1">I. Silence</span>
                      Our garments are designed to speak through silhouette, not logos. We embrace the quiet confidence of superior construction.
                    </p>
                    <p>
                      <span className="text-gray-900 font-bold uppercase tracking-widest text-sm block mb-1">II. Motion</span>
                      Every piece is tested for the urban nomad. Architecture in motion. Streetwear that adapts to the shifting landscapes of the megalopolis.
                    </p>
                    <p>
                      <span className="text-gray-900 font-bold uppercase tracking-widest text-sm block mb-1">III. Intent</span>
                      We reject the cycle of fast fashion. Every drop is a limited transmission. Crafted for longevity, intended for legacy.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-20 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-gray-900">
          {[
            { label: 'Founded', value: '2025' },
            { label: 'Base', value: 'Uttarakhand / Haldwani' },
            { label: 'Drops', value: 'Seasonal Archive' },
            { label: 'Quality', value: 'Handpicked' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 md:mb-2">{stat.label}</p>
              <p className="text-base md:text-2xl font-oswald font-bold">{stat.value}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default About;
