
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useShop } from '../store';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useShop();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const headerBg = scrolled ? 'bg-white shadow-sm' : 'bg-white';
  const borderColor = 'border-gray-300';

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${headerBg} py-4`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {}
        <div className="hidden md:flex items-center space-x-6 flex-1">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="THE III MONKS"
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <nav className="flex space-x-8 uppercase text-xs tracking-[0.2em] font-medium text-gray-900">
            <Link to="/shop" className="hover:opacity-50 transition-opacity">Shop</Link>
            <Link to="/about" className="hover:opacity-50 transition-opacity">Story</Link>
            <Link to="/contact" className="hover:opacity-50 transition-opacity">Contact</Link>
          </nav>
        </div>

        {}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img
            src="/images/logo.png"
            alt="THE III MONKS"
            className="w-8 h-8 md:hidden rounded-full object-cover"
          />
          <span className="text-2xl md:text-3xl font-oswald font-bold tracking-tighter text-gray-900">
            THE 3 <span style={{ color: '#e68a00' }}>MONKS</span>
          </span>
        </Link>

        {}
        <div className="flex items-center space-x-6 text-gray-900 flex-1 justify-end">
          <Link to="/admin" className={`hidden md:block uppercase text-[10px] border ${borderColor} px-3 py-1 hover:bg-gray-900 hover:text-white transition-all`}>
            Admin
          </Link>

          <Link to="/cart" className="relative group" aria-label="Shopping cart">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {}
          <button
            className="md:hidden z-50 text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {}
      <div className={`fixed top-0 right-0 h-full w-[70%] max-w-[280px] bg-white z-40 shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        {}
        <div className="flex justify-end p-6">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-900">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {}
        <nav className="flex flex-col px-6">
          <Link to="/shop" className="py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">Shop Collection</Link>
          <Link to="/about" className="py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">Our Story</Link>
          <Link to="/contact" className="py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">Contact</Link>
          <Link to="/admin" className="py-4 text-sm font-medium text-gray-500 mt-4">Admin Access</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
