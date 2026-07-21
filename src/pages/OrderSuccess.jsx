import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Home, MessageCircle, Clock, ChefHat, Truck } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const orderId = location.state?.orderId || 'N/A';
    const whatsappUrl = location.state?.whatsappUrl;

    // States: 'redirecting', 'waiting', 'preparing', 'delivering'
    const [status, setStatus] = useState('redirecting');
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (!whatsappUrl) return;

        let timer;
        
        // 1. Redirecting to WhatsApp (5 seconds countdown)
        if (status === 'redirecting') {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Open WhatsApp
                        window.open(whatsappUrl, '_blank');
                        // Change status to waiting for admin
                        setStatus('waiting');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        // 2. Waiting for Admin Response (simulated 10 seconds)
        else if (status === 'waiting') {
            timer = setTimeout(() => {
                setStatus('preparing');
            }, 10000);
        }
        
        // 3. Preparing Food (10-15 mins)
        else if (status === 'preparing') {
            timer = setTimeout(() => {
                setStatus('delivering');
            }, 10 * 60 * 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
                clearTimeout(timer);
            }
        };
    }, [status, whatsappUrl]);

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const renderContent = () => {
        switch (status) {
            case 'redirecting':
                return (
                    <motion.div
                        key="redirecting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
                        <MessageCircle size={80} className="text-green-500 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-3xl font-bold text-gray-100 mb-3">Order Confirmed!</h1>
                        <p className="text-gray-400 mb-6">
                            We are redirecting you to WhatsApp in <span className="font-bold text-primary">{countdown}</span> seconds to send your order details to the admin.
                        </p>
                        <button
                            onClick={() => {
                                window.open(whatsappUrl, '_blank');
                                setStatus('waiting');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                            <MessageCircle size={20} /> Open WhatsApp Now
                        </button>
                    </motion.div>
                );
            case 'waiting':
                return (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                    >
                        <Clock size={80} className="text-yellow-500 mx-auto mb-6 animate-spin-slow" style={{ animationDuration: '3s' }} />
                        <h1 className="text-3xl font-bold text-gray-100 mb-3">Waiting for Admin</h1>
                        <p className="text-gray-400 mb-6">
                            Please wait while the restaurant confirms your order. (Simulating admin response...)
                        </p>
                        <button onClick={() => setStatus('preparing')} className="mt-2 px-3 py-1 bg-gray-800 text-xs text-gray-400 hover:text-white rounded-md transition-colors">Skip Admin Wait (Dev Mode)</button>
                    </motion.div>
                );
            case 'preparing':
                return (
                    <motion.div
                        key="preparing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ChefHat size={80} className="text-orange-500 mx-auto mb-6" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-3">Food is Preparing!</h1>
                        <p className="text-gray-400 mb-6">
                            The admin accepted your order. Our chefs are cooking your delicious food.
                            Wait time: 10-15 minutes.
                        </p>
                        <button onClick={() => setStatus('delivering')} className="mt-2 px-3 py-1 bg-gray-800 text-xs text-gray-400 hover:text-white rounded-md transition-colors">Skip Cooking Time (Dev Mode)</button>
                    </motion.div>
                );
            case 'delivering':
                return (
                    <motion.div
                        key="delivering"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ x: -100 }}
                            animate={{ x: 0 }}
                            transition={{ type: "spring", stiffness: 100 }}
                        >
                            <Truck size={80} className="text-primary mx-auto mb-6" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-3">Order is out for Delivery!</h1>
                        <p className="text-gray-400 mb-6">
                            Your food is on its way. Track your order in real-time.
                        </p>
                        
                        <div className="bg-dark p-6 rounded-xl mb-8 border border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Order ID:</span>
                                <span className="font-bold text-gray-100">{orderId}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Status:</span>
                                <span className="px-3 py-1 bg-green-900/50 text-green-400 border border-green-800 rounded-full text-sm font-semibold">
                                    Delivering
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Link
                                to="/track"
                                className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-primary/30"
                            >
                                <Package size={20} />
                                Track Order Live
                            </Link>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 w-full bg-dark hover:bg-gray-800 text-gray-300 font-semibold py-3 rounded-lg transition-colors border border-gray-700"
                            >
                                <Home size={20} />
                                Back to Home
                            </Link>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-dark-lighter rounded-2xl shadow-2xl p-8 border border-gray-800 min-h-[450px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderSuccess;
