import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart, getTaxAmount, getDeliveryFee, getFinalTotal } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        paymentMethod: 'whatsapp'
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locating, setLocating] = useState(false);
    const fetchController = useRef(null);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (e.target.name === 'address') {
            setShowSuggestions(true);
        }
    };

    // Simple debounce for address autocomplete
    useEffect(() => {
        const q = formData.address?.trim();
        if (!q || q.length < 3) {
            setSuggestions([]);
            return;
        }

        const id = setTimeout(async () => {
            try {
                if (fetchController.current) fetchController.current.abort();
                fetchController.current = new AbortController();
                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
                const res = await fetch(url, { signal: fetchController.current.signal, headers: { 'Accept-Language': 'en' } });
                if (!res.ok) return;
                const data = await res.json();
                setSuggestions(data || []);
            } catch (err) {
                if (err.name !== 'AbortError') console.warn('Address autocomplete error', err);
            }
        }, 400);

        return () => {
            clearTimeout(id);
            if (fetchController.current) {
                fetchController.current.abort();
                fetchController.current = null;
            }
        };
    }, [formData.address]);

    const handleSelectSuggestion = (place) => {
        const display = place.display_name || '';
        setFormData(f => ({ ...f, address: display }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
                const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
                if (!res.ok) throw new Error('Reverse geocode failed');
                const data = await res.json();
                const display = data.display_name || '';
                setFormData(f => ({ ...f, address: display }));
                setSuggestions([]);
                setShowSuggestions(false);
                localStorage.setItem('lastDeliveryAddress', display);
            } catch (err) {
                console.warn(err);
                alert('Unable to determine address from your location');
            } finally {
                setLocating(false);
            }
        }, (err) => {
            console.warn(err);
            alert('Unable to access your location');
            setLocating(false);
        }, { enableHighAccuracy: true, timeout: 10000 });
    };

    const handleWhatsAppOrder = (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Construct the Order Message
        const itemsList = cartItems.map(item => `- ${item.name} x ${item.quantity} (₹${item.price * item.quantity})`).join('%0a');
        const subtotal = getCartTotal();
        const tax = getTaxAmount();
        const delivery = getDeliveryFee();
        const total = getFinalTotal();

        const message = `New Order from Website 🍔%0a%0a` +
            `Customer Details:%0a` +
            `Name: ${formData.name}%0a` +
            `Phone: ${formData.phone}%0a` +
            `Address: ${formData.address}%0a%0a` +
            `Order Summary:%0a${itemsList}%0a%0a` +
            `--------------------------------%0a` +
            `Subtotal: ₹${subtotal}%0a` +
            `Tax: ₹${typeof tax === 'number' ? tax.toFixed(2) : tax}%0a` +
            `Delivery: ${delivery === 0 ? 'Free' : '₹' + delivery}%0a` +
            `Total Amount: ₹${typeof total === 'number' ? total.toFixed(2) : total} 💸%0a` +
            `--------------------------------%0a` +
            `Payment Method: ${formData.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}%0a` +
            `%0aPlease confirm this order!`;

        // 2. Your WhatsApp Number
        const phoneNumber = "919353350845"; // Country code + Number

        // 3. Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);

        // 4. Save order to orders history and current order tracking
        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            status: 'waiting',
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            total: getFinalTotal(),
            paymentMethod: formData.paymentMethod,
            customerName: formData.name,
            customerPhone: formData.phone,
            deliveryAddress: formData.address
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        localStorage.setItem('lastDeliveryAddress', formData.address);

        // Try to persist the order to a backend server if available
        try {
            fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            }).catch(err => {
                // ignore network errors; server is optional
                console.warn('Could not POST order to server', err);
            });
        } catch (err) {
            console.warn('Order POST failed', err);
        }

        // 5. Navigate to success page and pass whatsapp details
        navigate('/order-success', {
            state: {
                orderId: orderId,
                whatsappUrl: whatsappUrl
            }
        });
    };

    if (cartItems.length === 0) {
        return <Navigate to="/menu" />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold text-primary mb-8 font-serif">Checkout</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-dark-lighter p-6 rounded-lg shadow-lg border border-white/10 h-fit">
                    <h3 className="text-xl font-bold text-light mb-4">Order Summary</h3>
                    <div className="space-y-4 mb-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-gray-300">
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Tax (5%)</span>
                            <span>₹{getTaxAmount()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Delivery Fee</span>
                            <span>{getDeliveryFee() === 0 ? 'Free' : `₹${getDeliveryFee()}`}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between items-center text-xl font-bold text-primary">
                            <span>Total</span>
                            <span>₹{getFinalTotal()}</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-dark-lighter p-6 rounded-lg shadow-lg border border-white/10">
                    <h3 className="text-xl font-bold text-light mb-6">Delivery Details</h3>
                    <p className="text-gray-400 mb-6 text-sm">
                        Fill in your details and click below to send your order directly to our WhatsApp!
                    </p>
                    <form onSubmit={handleWhatsAppOrder} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                                placeholder="Your Phone Number"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Delivery Address</label>
                            <div className="relative">
                                <textarea
                                    name="address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                                    placeholder="Flat No, Building, Street, Area"
                                ></textarea>

                                <div className="flex gap-2 mt-2">
                                    <button type="button" onClick={useCurrentLocation} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600">
                                        {locating ? 'Locating...' : 'Use current location'}
                                    </button>
                                    <button type="button" onClick={() => { setFormData(f => ({ ...f, address: '' })); setSuggestions([]); }} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600">
                                        Clear
                                    </button>
                                </div>

                                {showSuggestions && suggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-20 left-0 right-0 mt-2 bg-dark border border-gray-700 rounded-md max-h-56 overflow-auto text-sm">
                                        {suggestions.map((s) => (
                                            <li key={s.place_id} onClick={() => handleSelectSuggestion(s)} className="px-3 py-2 hover:bg-gray-800 cursor-pointer text-gray-200">
                                                {s.display_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? 'Opening WhatsApp...' : (
                                    <>
                                        <span>Place Order</span>
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                This will open WhatsApp with your order details pre-filled.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
