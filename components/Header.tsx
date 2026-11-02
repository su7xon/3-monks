import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../store';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cart, products, giveawayEnabled } = useShop();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const headerBg = scrolled ? 'bg-white shadow-sm' : 'bg-white';
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults = searchQuery.trim().length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${headerBg} border-b border-gray-100`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-24 md:h-32">
        
        {}
        <div className="flex-1">
          <Link to="/" className="inline-flex items-center hover:opacity-80 transition-opacity -ml-4 md:ml-0">
            <img
              src="/logo.png"
              alt="THE III MONKS"
              className="h-24 md:h-32 scale-110 origin-left w-auto object-contain transition-all duration-300 hover:opacity-80 mix-blend-multiply translate-y-4 md:translate-y-0"
            />
            <span className="md:hidden font-oswald font-black text-lg uppercase tracking-tighter ml-1 mt-2 whitespace-nowrap text-black">
              THE 3 MONKS
            </span>
          </Link>
        </div>

        {}
        <nav className="hidden md:flex flex-1 justify-center space-x-10">
          {[
            { name: 'Home', path: '/' },
            { name: 'Collections', path: '/shop' },
            ...(giveawayEnabled ? [{ name: 'Giveaway', path: '/giveaway' }] : []),
            { name: 'Story', path: '/#story' }
          ].map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[11px] uppercase tracking-[0.2em] font-bold transition-all ${
                location.pathname === link.path ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {}
        <div className="flex-1 flex justify-end items-center space-x-6 text-black">
          <button 
            className="hover:text-[#e60000] transition-colors" 
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
          
          <div className="hidden md:block w-px h-5 bg-gray-200"></div>

          <Link to="/cart" className="relative hover:text-[#e60000] transition-colors group flex items-center gap-2">
            <span className="hidden md:inline text-[10px] uppercase font-bold tracking-widest group-hover:text-[#e60000]">Cart</span>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#e60000] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          <button 
            className="md:hidden hover:text-[#e60000] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
      <div className={`md:hidden fixed inset-0 top-20 bg-white z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col p-8 space-y-8">
          {[
            { name: 'Home', path: '/' },
            { name: 'Collections', path: '/shop' },
            ...(giveawayEnabled ? [{ name: 'Giveaway', path: '/giveaway' }] : []),
            { name: 'Story', path: '/#story' }
          ].map(link => (
            <Link
              key={link.name}
              to={link.path}
              className="text-2xl font-display font-black uppercase tracking-tighter text-black border-b border-gray-100 pb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="bg-white w-full" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-3xl mx-auto px-6 py-6">
              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full text-lg md:text-xl outline-none border-none bg-transparent text-black placeholder-gray-300 font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
                <button 
                  onClick={() => setIsSearchOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {searchQuery.trim().length >= 2 && (
                <div className="mt-4 border-t border-gray-100 pt-4 max-h-[60vh] overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug || product.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-black uppercase tracking-wide truncate group-hover:text-[#e60000] transition-colors">{product.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.subtitle || product.category}</p>
                          </div>
                          <p className="text-sm font-bold text-[#e60000] shrink-0">₹{product.salePrice || product.price}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-8">No products found for "<span className="text-black font-medium">{searchQuery}</span>"</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
