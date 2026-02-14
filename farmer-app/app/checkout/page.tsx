'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CheckoutPage() {
    const { cart, cartTotal, clearCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'cod'
    });

    if (cart.length === 0 && !isProcessing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-light dark:bg-background-dark">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <span className="material-icons text-4xl text-gray-400">shopping_cart</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Add some items from the marketplace to continue.</p>
                <button 
                    onClick={() => router.push('/marketplace')}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    Return to Marketplace
                </button>
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert('Order placed successfully! Thank you for shopping with Farmertopia.');
        clearCart();
        router.push('/marketplace');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 md:pb-8">
            <header className="px-6 pt-8 pb-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <span className="material-icons text-gray-600 dark:text-gray-400">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h1>
                        <p className="text-xs text-gray-500">Complete your order</p>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-icons text-primary text-xl">person_outline</span>
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                    <input
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-icons text-primary text-xl">local_shipping</span>
                                Delivery Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                                    <textarea
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30 min-h-[80px]"
                                        placeholder="123 Farm Road, Green Valley"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                                    <input
                                        required
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30"
                                        placeholder="Bangalore"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Zip Code</label>
                                    <input
                                        required
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 border border-transparent focus:border-primary/30"
                                        placeholder="560001"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-icons text-primary text-xl">payments</span>
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <span className={`material-icons ${formData.paymentMethod === 'cod' ? 'text-primary' : 'text-gray-400'}`}>
                                        {formData.paymentMethod === 'cod' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Cash on Delivery</p>
                                        <p className="text-xs text-gray-500">Pay when you receive</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-gray-800'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={formData.paymentMethod === 'online'}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />
                                    <span className={`material-icons ${formData.paymentMethod === 'online' ? 'text-primary' : 'text-gray-400'}`}>
                                        {formData.paymentMethod === 'online' ? 'radio_button_checked' : 'radio_button_unchecked'}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Online Payment</p>
                                        <p className="text-xs text-gray-500">UPI, Card, or Netbanking</p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </form>
                </div>

                {/* Summary Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden sticky top-32">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>
                        </div>
                        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-3 items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 shrink-0">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 dark:text-white font-medium">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span className="text-green-500 font-medium">FREE</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                                    <p className="text-2xl font-bold text-primary">₹{cartTotal.toLocaleString()}</p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isProcessing}
                                className={`w-full mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Place Order</span>
                                        <span className="material-icons text-sm">check_circle</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
