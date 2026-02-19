import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../store';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useShop();
    const state = location.state || {};
    const order = state.order;
    const paymentMethod = state.paymentMethod || order?.paymentMethod;

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    let actionUrl = '';
    const isManualPayment = paymentMethod === 'whatsapp' || paymentMethod === 'instagram';

    if (order && paymentMethod === 'whatsapp') {
        const itemsList = order.items.map((item: any) =>
            `• ${item.name} (${item.selectedSize}) x${item.quantity} - ₹${(item.salePrice || item.price) * item.quantity}`
        ).join('\n');
        const text = `Hyyy! 👋 I would like to make a purchase from the store.\n\n` +
            `*Order ID:* ${order.id}\n\n` +
            `*Customer Details:*\n` +
            `Name: ${order.customer.name}\n` +
            `Phone: ${order.customer.phone}\n` +
            `Email: ${order.customer.email}\n` +
            `Address: ${order.customer.address}\n\n` +
            `*Order Summary:*\n${itemsList}\n\n` +
            `*Total Amount:* ₹${order.total}\n\n` +
            `--------------------------------\n` +
            `Please confirm my order! ✨`;
        actionUrl = `https://wa.me/919045848613?text=${encodeURIComponent(text)}`;
    } else if (paymentMethod === 'instagram') {
        actionUrl = `https://www.instagram.com/the_3monks_clo/?utm_source=ig_web_copy_link`;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-black pt-20 pb-12 px-4">
            <div className="max-w-md w-full text-center space-y-8">

                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-oswald font-bold uppercase tracking-tighter">
                        {isManualPayment ? 'Almost There!' : 'Order Confirmed'}
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                        {isManualPayment ? 'Complete your payment to finalize the order' : 'Thank you for your purchase'}
                    </p>
                </div>

                <div className="py-8 border-y border-gray-100 space-y-4">
                    <p className="text-gray-600 font-medium">
                        {isManualPayment
                            ? `Please complete your payment via ${paymentMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'}.`
                            : 'We have received your order request.'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Order ID: <span className="text-black font-bold font-mono">{order?.id}</span>
                    </p>

                    {actionUrl && (
                        <div className="mt-4">
                            <a
                                href={actionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block w-full py-4 text-white font-oswald font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 ${paymentMethod === 'instagram'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                                    : 'bg-[#25D366] hover:bg-[#20bd5a]'
                                    }`}
                            >
                                <span>{paymentMethod === 'instagram' ? 'DM TO CONFIRM ORDER ON INSTAGRAM' : 'Complete Order on WhatsApp'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/shop')}
                        className="block w-full border border-black text-black py-4 font-oswald font-bold uppercase tracking-widest text-sm hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="block w-full py-4 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                <div className="pt-8">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        Need help? Contact Support
                    </p>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
