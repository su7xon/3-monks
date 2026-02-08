
import React, { useState } from 'react';
import { useShop } from '../store';
import { useNavigate } from 'react-router-dom';
import { OrderStatus } from '../types';

type PaymentMethod = 'instagram' | 'whatsapp';

const Checkout: React.FC = () => {
  const { cart, clearCart, addOrder, siteConfig } = useShop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  const total = cart.reduce((acc, item) => acc + (item.salePrice || item.price) * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setLoading(true);

    const order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total,
      status: OrderStatus.PENDING,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.city}`,
        pincode: form.pincode,
      },
      paymentMethod,
    };

    await addOrder(order);

    if (paymentMethod === 'whatsapp') {
      const itemsList = cart.map(item =>
        `• ${item.name} (${item.selectedSize}) x${item.quantity} - ₹${(item.salePrice || item.price) * item.quantity}`
      ).join('\n');

      const text = `Hyyy! 👋 I would like to make a purchase from the store.\n\n` +
        `*Order ID:* ${order.id}\n\n` +
        `*Customer Details:*\n` +
        `Name: ${form.name}\n` +
        `Phone: ${form.phone}\n` +
        `Email: ${form.email}\n` +
        `Address: ${form.address}, ${form.city} - ${form.pincode}\n\n` +
        `*Order Summary:*\n${itemsList}\n\n` +
        `*Total Amount:* ₹${total}\n\n` +
        `--------------------------------\n` +
        `Please confirm my order! ✨`;

      const whatsappNumber = '919045848613';
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } else if (paymentMethod === 'instagram') {

      window.open('https://www.instagram.com/the_3monks_clo', '_blank');
    }

    clearCart();
    setLoading(false);
    navigate('/order-success', { state: { order, paymentMethod } });
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="pt-20 pb-24 bg-white min-h-screen text-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-oswald font-bold uppercase tracking-tighter mb-6 md:mb-12 border-b-2 border-black pb-3 md:pb-4">
          Checkout
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16">
          {}
          <div className="lg:col-span-7 space-y-12">

            {}
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-sm md:text-lg font-oswald font-bold uppercase tracking-widest mb-3 md:mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                  Shipping
                </h2>
                <div className="grid grid-cols-2 gap-x-3 md:gap-x-6 gap-y-3 md:gap-y-5">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Phone</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="+91 9XXXXXXXXX"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Address</label>
                    <input
                      required
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="Street, House No."
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">City</label>
                    <input
                      required
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="City"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Pincode</label>
                    <input
                      required
                      value={form.pincode}
                      onChange={e => setForm({ ...form, pincode: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>

              {}
              <div>
                <h2 className="text-sm md:text-lg font-oswald font-bold uppercase tracking-widest mb-3 md:mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                  Payment
                </h2>

                <div className="space-y-2">
                  {}
                  <label
                    className={`block cursor-pointer border px-3 md:px-5 py-3 md:py-4 transition-all duration-200 ${paymentMethod === 'instagram' ? 'border-2 border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${paymentMethod === 'instagram' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'instagram' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-oswald font-medium uppercase tracking-wider text-xs md:text-sm">Order via Instagram</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">DM us to confirm</p>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value="instagram"
                        checked={paymentMethod === 'instagram'}
                        onChange={() => setPaymentMethod('instagram')}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {}
                  <label
                    className={`block cursor-pointer border px-3 md:px-5 py-3 md:py-4 transition-all duration-200 ${paymentMethod === 'whatsapp' ? 'border-2 border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${paymentMethod === 'whatsapp' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'whatsapp' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-oswald font-medium uppercase tracking-wider text-xs md:text-sm">Order via WhatsApp</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Chat with us to confirm</p>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value="whatsapp"
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-4 md:p-6 lg:p-8 border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-base md:text-xl font-oswald font-bold uppercase tracking-widest mb-4 md:mb-6 border-b border-gray-200 pb-3 md:pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-[30vh] lg:max-h-[40vh] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                    <div className="w-14 h-16 md:w-16 md:h-20 bg-gray-200 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.images?.[0] || 'https://via.placeholder.com/64x80?text=No+Image'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs md:text-sm uppercase tracking-wide truncate">{item.name}</h3>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-1 uppercase">Size: {item.selectedSize} | Qty: {item.quantity}</p>
                      <p className="text-xs md:text-sm font-semibold mt-1 md:mt-2">₹{(item.salePrice || item.price) * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xs md:text-sm uppercase tracking-wide text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm uppercase tracking-wide text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-base md:text-lg font-bold uppercase tracking-wide pt-3 border-t border-gray-200 mt-3">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {}
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full bg-black text-white py-3 md:py-4 font-oswald font-bold uppercase tracking-widest text-sm md:text-lg hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING...' : `PAY ₹${total}`}
              </button>

              {}
              <div className="mt-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  By placing this order you agree to our terms
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-bold uppercase text-red-600 tracking-wider">
                    NO RETURNS • NO REFUNDS
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">All sales are final.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
