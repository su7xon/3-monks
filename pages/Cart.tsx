import React from 'react';
import { useShop } from '../store';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useShop();

  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice || item.price) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="pt-32 md:pt-60 pb-20 md:pb-40 text-center bg-white min-h-screen animate-page-fade">
        <h2 className="text-2xl md:text-4xl font-display font-black uppercase tracking-widest mb-4 md:mb-8 text-black">Your bag is empty</h2>
        <Link to="/shop" className="inline-block bg-black text-white px-8 md:px-12 py-3 md:py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-10 md:pb-20 bg-white min-h-screen text-black animate-page-fade">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-widest mb-10 md:mb-16">Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          <div className="lg:col-span-8 space-y-8 md:space-y-12">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 md:gap-8 group border-b border-gray-100 pb-8 last:border-0">
                <div className="w-24 md:w-40 aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0 rounded-lg">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-all" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm md:text-base font-bold uppercase tracking-wide mb-1 text-black font-display">{item.name}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">{item.selectedColor} | Size {item.selectedSize}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-gray-400 hover:text-black transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-gray-200 rounded-sm">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-50 text-gray-500 hover:text-black transition-colors"
                      >-</button>
                      <span className="px-3 md:px-4 text-xs md:text-sm font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-50 text-gray-500 hover:text-black transition-colors"
                      >+</button>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-[#e60000]">₹{(item.salePrice || item.price) * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-6 md:p-8 sticky top-32 rounded-xl border border-gray-100">
              <h3 className="text-xl md:text-2xl font-display font-black uppercase tracking-widest mb-6 md:mb-8 text-black">Order Summary</h3>
              <div className="space-y-4 md:space-y-5 mb-6 md:mb-8">
                <div className="flex justify-between text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-black">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
                  <span>Shipping</span>
                  <span className="text-black">Calculated at next step</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between font-black text-lg md:text-xl font-display text-black uppercase tracking-widest">
                  <span>Estimated Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full bg-black text-white text-center py-4 md:py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all rounded-sm shadow-md">
                Proceed to Checkout
              </Link>
              <div className="mt-8 flex justify-center items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MC" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
              </div>

              {}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-xs uppercase tracking-widest">No Returns</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest border border-gray-300 text-gray-500 px-2 py-1 rounded-sm">
                      T&C Apply
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed">
                    All sales are final — <strong className="text-black">no returns</strong>. Exchange is applicable only if a <strong className="text-black">damaged or incorrect product</strong> is received. <Link to="/policy" className="text-black underline underline-offset-2 cursor-pointer hover:text-gray-700 transition-colors">Read full policy</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 md:hidden z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Total</p>
            <p className="text-xl font-bold text-black font-display tracking-widest">₹{subtotal}</p>
          </div>
          <Link to="/checkout" className="px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors rounded-sm shadow-md">
            Checkout
          </Link>
        </div>
      </div>

      <div className="h-24 md:hidden"></div>
    </div>
  );
};

export default Cart;
