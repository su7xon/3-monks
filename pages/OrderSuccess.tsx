
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const { order, paymentMethod } = location.state || {};

    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-black pt-20 pb-12 px-4">
            <div className="max-w-md w-full text-center space-y-8">

                {}
                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-oswald font-bold uppercase tracking-tighter">
                        Order Confirmed
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">
                        Thank you for your purchase
                    </p>
                </div>

                <div className="py-8 border-y border-gray-100 space-y-4">
                    <p className="text-gray-600 font-medium">
                        {paymentMethod === 'whatsapp'
                            ? 'Please complete your order on WhatsApp.'
                            : 'We have received your order request.'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Order ID: <span className="text-black font-bold font-mono">{order?.id}</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/shop"
                        className="block w-full bg-black text-white py-4 font-oswald font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        to="/"
                        className="block w-full py-4 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
                    >
                        Back to Home
                    </Link>
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
