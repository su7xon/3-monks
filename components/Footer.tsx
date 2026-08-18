
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black pt-10 md:pt-16 pb-8 md:pb-12 border-t border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-8 md:mb-12">
          <div className="col-span-2 md:col-span-2">
            <h2 className="text-xl md:text-3xl font-oswald font-bold uppercase tracking-tighter mb-4 md:mb-8 text-white">
              THE III <span className="text-neutral-500">MONKS</span>
            </h2>
            <p className="max-w-xs text-neutral-400 text-[10px] md:text-xs leading-relaxed uppercase tracking-[0.2em]">
              Premium streetwear designed for the urban nomad. Silence, Motion, Intent. Crafted in Uttarakhand.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500 mb-4 md:mb-8">Navigation</h4>
            <ul className="space-y-2 md:space-y-4 text-xs uppercase tracking-widest font-medium text-neutral-400">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Ethos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500 mb-4 md:mb-8">Social</h4>
            <ul className="space-y-2 md:space-y-4 text-xs uppercase tracking-widest font-medium text-neutral-400">
              <li><a href="https://www.instagram.com/the_3monks_clo?igsh=aWticW9nY3E4djdr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://wa.me/917451861370" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
          <p>© 2024 THE III MONKS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
