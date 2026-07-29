
import React, { useState } from 'react';
import { useShop } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { OrderStatus } from '../types';

type PaymentMethod = 'razorpay' | 'cod';

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout: React.FC = () => {
  const { cart, clearCart, addOrder, reduceStock, deleteOrder, siteConfig } = useShop();
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
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const baseShipping = 99;
  const extraShipping = 60;
  const computedShipping = totalItems > 0 ? baseShipping + (totalItems - 1) * extraShipping : 0;
  const shippingCost = paymentMethod === 'cod' ? computedShipping : 0;
  const finalTotal = total + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.replace(/[^0-9]/g, '').slice(-10))) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(form.pincode)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);

    const order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: finalTotal,
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

    const amountToPay = paymentMethod === 'razorpay' ? finalTotal : shippingCost;

    if (amountToPay > 0) {
      try {
        await addOrder(order);
      } catch {
        alert('Failed to save order. Please try again.');
        setLoading(false);
        return;
      }

      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      try {
        const result = await fetch('/.netlify/functions/create-razorpay-order', {
          method: 'POST',
          body: JSON.stringify({ amount: amountToPay }),
        });
        
        const data = await result.json();
        
        if (!data || !data.id) {
          alert('Server error. Are you online?');
          setLoading(false);
          return;
        }

        const options = {
          key: 'rzp_live_Ssl5rJRZ72IKfZ',
          amount: data.amount,
          currency: data.currency,
          name: 'The III Monks',
          description: paymentMethod === 'cod' ? 'Shipping & COD Charges' : 'Premium Streetwear',
          order_id: data.id,
          handler: async function (response: any) {
            try {
              const verify = await fetch('/.netlify/functions/verify-razorpay-payment', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verify.json();
              
              if (verifyData.success) {
                const confirmedOrder = { ...order, status: OrderStatus.CONFIRMED };
                await addOrder(confirmedOrder);
                await reduceStock(confirmedOrder);
                setLoading(false);
                navigate('/order-success', { state: { order, paymentMethod } });
              } else {
                alert('Payment verification failed.');
                setLoading(false);
              }
            } catch (err) {
              console.error(err);
              alert('Payment verification failed.');
              setLoading(false);
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: '#000000',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', async function (response: any) {
          try { await deleteOrder(order.id); } catch {}
          alert('Payment Failed: ' + response.error.description);
          setLoading(false);
        });
        paymentObject.on('modal.close', async function () {
          setTimeout(async () => {
            try {
              const { getOrder } = await import('../firebase');
              const savedOrder = await getOrder(order.id);
              if (savedOrder && savedOrder.status === OrderStatus.PENDING) {
                await deleteOrder(order.id);
              }
            } catch {}
          }, 2000);
        });
        paymentObject.open();
      } catch (err) {
        console.error(err);
        alert('Could not initiate payment');
        setLoading(false);
      }
    } else {
      await addOrder(order);
      await reduceStock(order);
      setLoading(false);
      navigate('/order-success', { state: { order, paymentMethod } });
    }
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
          <div className="lg:col-span-7 space-y-12">

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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Email (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="email@example.com (Optional)"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Phone</label>
                    <input
                      required
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      minLength={10}
                      title="Please enter exactly 10 digits"
                      value={form.phone}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 10) setForm({ ...form, phone: val });
                      }}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="9XXXXXXXXX"
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
                      type="text"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      minLength={6}
                      title="Please enter exactly 6 digits"
                      value={form.pincode}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 6) setForm({ ...form, pincode: val });
                      }}
                      className="w-full bg-transparent border-b border-gray-300 py-2 focus:border-black transition-colors outline-none text-sm placeholder-gray-300"
                      placeholder="6 Digit Pincode"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm md:text-lg font-oswald font-bold uppercase tracking-widest mb-3 md:mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                  Payment
                </h2>

                <div className="space-y-2">
                  <label
                    className={`block cursor-pointer border px-3 md:px-5 py-3 md:py-4 transition-all duration-200 ${paymentMethod === 'razorpay' ? 'border-2 border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${paymentMethod === 'razorpay' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'razorpay' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-oswald font-medium uppercase tracking-wider text-xs md:text-sm">Online Payment</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Cards, UPI, NetBanking (via Razorpay)</p>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="hidden"
                      />
                    </div>
                  </label>

                  <label
                    className={`block cursor-pointer border px-3 md:px-5 py-3 md:py-4 transition-all duration-200 ${paymentMethod === 'cod' ? 'border-2 border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'border-black' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-2 h-2 bg-black rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-oswald font-medium uppercase tracking-wider text-xs md:text-sm">Cash on Delivery (COD)</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Pay in cash when your order arrives (+₹{computedShipping} shipping)</p>
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

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
                  <span className={shippingCost === 0 ? "text-green-600 font-bold" : "text-black font-bold"}>
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between text-base md:text-lg font-bold uppercase tracking-wide pt-3 border-t border-gray-200 mt-3">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full bg-black text-white py-3 md:py-4 font-oswald font-bold uppercase tracking-widest text-sm md:text-lg hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING...' : (paymentMethod === 'cod' ? `PAY ₹${shippingCost} (SHIPPING)` : `PAY ₹${finalTotal}`)}
              </button>

              <div className="mt-6 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400">
                  By placing this order you agree to our terms
                </p>
                {/* No Returns Policy Notice */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-left">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#e60000]">
                          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-xs uppercase tracking-widest">No Returns</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest border border-gray-300 text-gray-500 px-2 py-1 rounded-sm">
                        T&C Apply
                      </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed text-left">
                      All sales are final — <strong className="text-black">no returns</strong>. Exchange is applicable only if a <strong className="text-black">damaged or incorrect product</strong> is received. <Link to="/policy" className="text-black underline underline-offset-2 cursor-pointer hover:text-gray-700 transition-colors">Read full policy</Link>
                    </p>
                  </div>
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
