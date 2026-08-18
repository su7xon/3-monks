
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
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center relative overflow-hidden selection:bg-neutral-800 selection:text-white">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[40vw] md:h-[40vw] max-w-[600px] max-h-[600px] bg-white/5 rounded-full blur-[80px] md:blur-[120px] opacity-60 pointer-events-none" />
      
      <div className="relative z-10 max-w-lg w-full">
        {}
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-full mx-auto mb-8 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-5 drop-shadow-sm px-4">
          Stepping Up.
        </h1>
        
        <p className="text-gray-400 text-sm md:text-base mb-10 leading-relaxed font-light px-2 md:px-8">
          III Monks is currently undergoing scheduled maintenance to elevate your premium streetwear experience. We are optimizing our servers and will be right back.
        </p>

        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm text-gray-300 font-medium tracking-wide">
          <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-white opacity-75"></span>
          </span>
          Maintenance in progress
        </div>
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
