
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ShopProvider } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Contact from './pages/Contact';
import ReturnPolicy from './pages/ReturnPolicy';
import AdminDashboard from './pages/Admin/Dashboard';
import POS from './pages/Admin/POS';
import StockManager from './pages/Admin/StockManager';
import Giveaway from './pages/Giveaway';
import { ToastProvider } from './components/Toast';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'page_view', {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title
      });
    }
    if (!pathname.startsWith('/admin')) {
      const day = new Date().toISOString().slice(0, 10);
      const dedupeKey = `iii_monks_viewed_${pathname}_${day}`;
      if (!localStorage.getItem(dedupeKey)) {
        localStorage.setItem(dedupeKey, '1');
        import('./firebase').then(m => m.recordPageView());
      }
    }
  }, [pathname]);

  return null;
};

const ConditionalFooter = () => {
  const { pathname } = useLocation();

  if (pathname.includes('/product/')) {
    return null;
  }
  return <Footer />;
};


const MaintenanceScreen = () => {
  return (
    <div className="min-h-screen bg-[#202124] text-white flex items-start justify-center pt-[15vh] md:pt-[17vh] px-6 md:px-10 selection:bg-neutral-700">
      <div className="w-full max-w-[680px] text-left">
        <svg className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] mb-8 md:mb-10" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8eaed" />
              <stop offset="100%" stopColor="#9aa0a6" />
            </linearGradient>
            <linearGradient id="cloudSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bdc1c6" />
              <stop offset="100%" stopColor="#5f6368" />
            </linearGradient>
          </defs>
          <ellipse cx="62" cy="128" rx="12" ry="10" fill="#5f6368" />
          <ellipse cx="88" cy="124" rx="9" ry="8" fill="#80868b" />
          <ellipse cx="72" cy="140" rx="7" ry="6" fill="#5f6368" />
          <path d="M38 78c-11 0-20-9-20-20s9-20 20-20c3 0 6 .6 8.5 1.8C52 26 68 17 86 17c25 0 46 20 46 45 0 1.5-.1 3-.3 4.5C143 69 152 79 152 92c0 14-11 25-25 25H48c-15 0-27-12-27-27 0-6 2-11 5-15-1.5-2.5-2.5-5.5-2.5-8.5 0 4 5.5 7.5 14.5 9z" fill="url(#cloudTop)" fillOpacity="0.55" />
          <path d="M33 88h94c12 0 21 9 21 21s-9 21-21 21H40c-13 0-23-10-23-23 0-8 4-15 10-19z" fill="url(#cloudSide)" fillOpacity="0.75" />
          <circle cx="52" cy="100" r="4.2" fill="#202124" />
          <circle cx="70" cy="100" r="4.2" fill="#202124" />
          <circle cx="88" cy="100" r="4.2" fill="#202124" />
        </svg>

        <h1 className="text-[26px] md:text-[34px] font-normal leading-snug mb-5">
          Hmmm... can't reach this page
        </h1>

        <p className="text-[14px] md:text-[15px] text-[#e8eaed] mb-4">
          Check if there is a typo in{' '}
          <span className="font-semibold">{typeof window !== 'undefined' ? window.location.hostname : 'www.monks.com'}</span>.
        </p>

        <p className="text-[12px] text-[#9aa0a6] mb-7 tracking-wide">DNS_PROBE_FINISHED_NXDOMAIN</p>

        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-[#8ab4f8] text-[#202124] text-[14px] font-medium rounded hover:bg-[#aecbfa] transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { pathname } = useLocation();
  const isMaintenanceMode = false; 

  if (isMaintenanceMode && !pathname.startsWith('/admin')) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-ink text-white selection:bg-neutral-800 selection:text-white">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/giveaway" element={<Giveaway />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pos" element={<POS />} />
            <Route path="/admin/stock/:productId" element={<StockManager />} />
            <Route path="/policy" element={<ReturnPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ConditionalFooter />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <ShopProvider>
          <MainLayout />
        </ShopProvider>
      </Router>
    </ToastProvider>
  );
};

export default App;
