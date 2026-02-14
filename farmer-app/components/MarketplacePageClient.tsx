'use client';

import React, { useState } from 'react';
import { MarketplaceItem } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { compressImage } from '@/lib/imageUtils';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface MarketplacePageClientProps {
    items: MarketplaceItem[];
}

const categoryIcons: Record<string, string> = {
    Seeds: 'grass',
    Tools: 'build',
    Fertilizers: 'science',
    Equipment: 'precision_manufacturing',
    Pesticides: 'bug_report',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`material-icons text-[12px] ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}>
                    star
                </span>
            ))}
        </div>
    );
}

export default function MarketplacePageClient({ items: initialItems }: MarketplacePageClientProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { cart, addToCart, removeFromCart, cartTotal, itemCount } = useCart();
    const [items, setItems] = useState(initialItems);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [newItem, setNewItem] = useState<Partial<MarketplaceItem>>({
        category: 'Seeds',
        inStock: true
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    const categories = ['All', 'Seeds', 'Tools', 'Fertilizers', 'Equipment', 'Pesticides'];

    const filtered = items.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            alert("Please sign in to list items.");
            return;
        }

        try {
            let finalImageUrl = imagePreview || "https://upload.wikimedia.org/wikipedia/commons/7/70/Wikibooks_planting-tomato_seed.JPG";

            if (imageFile) {
                finalImageUrl = await compressImage(imageFile);
            }

            const itemData = {
                name: newItem.name || 'Unknown',
                category: newItem.category as any,
                price: Number(newItem.price) || 0,
                seller: session.user.name || 'Anonymous',
                userId: session.user.email || 'anonymous',
                rating: 0,
                reviewCount: 0,
                inStock: true,
                description: newItem.description || 'No description provided.',
                imageUrl: finalImageUrl
            };

            const docRef = await addDoc(collection(db, 'marketplace_items'), itemData);
            const item: MarketplaceItem = {
                id: docRef.id,
                ...itemData
            };
            setItems([item, ...items]);
            setIsAddModalOpen(false);
            setNewItem({ category: 'Seeds', inStock: true });
            setImagePreview(null);
            setImageFile(null);
        } catch (error) {
            console.error("Error adding item:", error);
            alert("Failed to add item. Image might still be too large.");
        }
    };

    const handleDeleteItem = async (id: string, itemUserId: string) => {
        if (!session?.user || (session.user.email !== itemUserId)) {
            alert("You can only delete your own items.");
            return;
        }

        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteDoc(doc(db, 'marketplace_items', id));
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                console.error("Error deleting item:", error);
                alert("Failed to delete item.");
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push('/checkout');
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="px-6 pt-6 pb-4 shrink-0 md:pt-8 flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Marketplace</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Seeds, tools & supplies</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                <span className="material-icons text-xl">shopping_cart</span>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <span className="material-icons text-sm">add</span>
                                Sell Item
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:border-primary outline-none transition-colors"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 md:px-8 md:pb-8 no-scrollbar">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${activeCategory === cat
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {cat !== 'All' && <span className="material-icons text-[12px]">{categoryIcons[cat]}</span>}
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{filtered.length} products</p>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors overflow-hidden group">
                            {/* Image header */}
                            <div className="h-32 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {session?.user?.email === item.userId && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.userId); }}
                                        className="absolute top-2 left-2 p-1.5 rounded-lg bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors z-10"
                                        title="Delete Item"
                                    >
                                        <span className="material-icons text-sm">delete</span>
                                    </button>
                                )}
                                {!item.inStock && (
                                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">Out of Stock</span>
                                    </div>
                                )}
                                {item.originalPrice && item.inStock && (
                                    <span className="absolute top-2 right-2 text-[10px] font-medium bg-red-50 dark:bg-red-900/20 text-red-500 px-1.5 py-0.5 rounded">
                                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                    </span>
                                )}
                            </div>

                            <div className="p-3.5">
                                <div className="mb-2">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.category}</span>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 leading-snug">{item.name}</h3>
                                </div>

                                <p className="text-[11px] text-gray-400 leading-relaxed mb-2 line-clamp-2">{item.description}</p>

                                <div className="flex items-center gap-1.5 mb-3">
                                    <StarRating rating={item.rating} />
                                    <span className="text-[10px] text-gray-400">({item.reviewCount})</span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-base font-semibold text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</span>
                                        {item.originalPrice && (
                                            <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => addToCart(item)}
                                        disabled={!item.inStock}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${item.inStock
                                            ? 'bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {item.inStock ? 'Add' : 'Notify'}
                                    </button>
                                </div>

                                <p className="text-[10px] text-gray-400 mt-2">by {item.seller}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Sell Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sell Item</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddItem} className="space-y-4">
                            {/* Image Upload */}
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Product Photo</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 relative overflow-hidden group">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <span className="material-icons text-3xl text-gray-400 mb-2">add_a_photo</span>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG (MAX. 800x400px)</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        {imagePreview && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Change Photo</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                                <input
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. Organic Seeds"
                                    value={newItem.name || ''}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="0"
                                        value={newItem.price || ''}
                                        onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30 min-h-[80px]"
                                    placeholder="Brief description..."
                                    value={newItem.description || ''}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2"
                            >
                                List Item
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl animate-slide-in-right flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopping Cart ({cart.length})</h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                        <span className="material-icons text-3xl text-gray-400">shopping_cart</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">Your cart is empty</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Add items from the marketplace to get started.</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500">{item.seller} {item.quantity > 1 && <span className="text-primary font-bold">x{item.quantity}</span>}</p>
                                            <p className="text-sm font-semibold text-primary mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-icons text-xl">delete_outline</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-base font-medium text-gray-500">Total</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>Checkout</span>
                                    <span className="material-icons text-sm">arrow_forward</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
