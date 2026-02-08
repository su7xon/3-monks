
import React from 'react';
import { useShop } from '../store';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart } = useShop();

  const subtotal = cart.reduce((acc, item) => acc + (item.salePrice || item.price) * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="pt-32 md:pt-60 pb-20 md:pb-40 text-center bg-white min-h-screen">
        <h2 className="text-2xl md:text-4xl font-oswald font-bold uppercase tracking-tighter mb-4 md:mb-8 text-gray-900">Your bag is empty</h2>
        <Link to="/shop" className="inline-block bg-gray-900 text-white px-8 md:px-12 py-3 md:py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-32 pb-10 md:pb-20 bg-white min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-7xl font-oswald font-bold uppercase tracking-tighter mb-6 md:mb-20">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
          {}
          <div className="lg:col-span-8 space-y-6 md:space-y-12">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 md:gap-8 group">
                <div className="w-20 md:w-48 aspect-[4/5] bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-all" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm md:text-lg font-bold uppercase tracking-wider mb-0.5 md:mb-1 text-gray-900">{item.name}</h3>
                      <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">{item.selectedColor} | Size {item.selectedSize}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                      className="text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="px-2 md:px-4 py-1 md:py-2 hover:bg-gray-100"
                      >-</button>
                      <span className="px-2 md:px-4 text-xs md:text-sm font-mono text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="px-2 md:px-4 py-1 md:py-2 hover:bg-gray-100"
                      >+</button>
                    </div>
                    <p className="text-sm md:text-lg font-oswald font-bold text-gray-900">₹{(item.salePrice || item.price) * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-4 md:p-8 sticky top-32 border border-gray-200">
              <h3 className="text-xl md:text-2xl font-oswald font-bold uppercase mb-4 md:mb-8 text-gray-900">Order Summary</h3>
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-8">
                <div className="flex justify-between text-gray-400 text-xs md:text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-xs md:text-sm">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                <div className="pt-3 md:pt-4 border-t border-gray-200 flex justify-between font-bold text-base md:text-xl font-oswald text-gray-900">
                  <span>Estimated Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full bg-gray-900 text-white text-center py-3 md:py-5 text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
                Proceed to Checkout
              </Link>
              <div className="mt-6 flex justify-center items-center gap-4 opacity-40 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MC" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase">Total</p>
            <p className="text-xl font-oswald font-bold text-gray-900">₹{subtotal}</p>
          </div>
          <Link to="/checkout" className="px-8 py-3 bg-gray-900 text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-md">
            Checkout
          </Link>
        </div>
      </div>

      {}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default Cart;
