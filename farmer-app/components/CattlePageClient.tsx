'use client';

import React, { useState, useMemo } from 'react';
import { CattleListing } from '@/lib/types';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { compressImage } from '@/lib/imageUtils';

interface CattlePageClientProps {
    cattle: CattleListing[];
}

export default function CattlePageClient({ cattle: initialCattle }: CattlePageClientProps) {
    const { data: session } = useSession();
    const [cattle, setCattle] = useState(initialCattle);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newListing, setNewListing] = useState<Partial<CattleListing>>({
        category: 'Dairy',
        healthStatus: 'Healthy'
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [selectedCattle, setSelectedCattle] = useState<CattleListing | null>(null);

    const filters = ['All', 'Dairy', 'Beef', 'Dual Purpose'];

    const filteredCattle = useMemo(() => {
        return cattle.filter(item => {
            const matchesFilter = activeFilter === 'All' || item.category === activeFilter;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [cattle, activeFilter, searchQuery]);

    const totalHead = cattle.length;
    const avgPrice = Math.round(cattle.reduce((sum, c) => sum + c.price, 0) / (cattle.length || 1));
    const healthyCount = cattle.filter(c => c.healthStatus === 'Healthy' || c.healthStatus === 'Vaccinated').length;

    const healthColor = (status: string) => {
        if (status === 'Healthy') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (status === 'Vaccinated') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    };

    const handleAddListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            alert("Please sign in to add listings.");
            return;
        }

        try {
            let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2502&auto=format&fit=crop";

            if (imageFile) {
                // Compress and convert to Base64
                finalImageUrl = await compressImage(imageFile);
            }

            const listingData = {
                name: newListing.name || 'Unknown',
                breed: newListing.breed || 'Unknown',
                category: newListing.category as any,
                age: newListing.age || 'Unknown',
                weight: Number(newListing.weight) || 0,
                price: Number(newListing.price) || 0,
                healthStatus: newListing.healthStatus as any,
                seller: session.user.name || 'Anonymous',
                userId: session.user.email || 'anonymous',
                location: newListing.location || 'Salem, TN',
                imageUrl: finalImageUrl
            };

            const docRef = await addDoc(collection(db, 'cattle'), listingData);
            const listing: CattleListing = {
                id: docRef.id,
                ...listingData
            };
            setCattle([listing, ...cattle]);
            setIsAddModalOpen(false);
            setNewListing({ category: 'Dairy', healthStatus: 'Healthy' });
            setImagePreview(null);
            setImageFile(null);
        } catch (error) {
            console.error("Error adding listing:", error);
            alert("Failed to add listing. Image might still be too large.");
        }
    };

    const handleDeleteListing = async (id: string, listingUserId: string) => {
        if (!session?.user || (session.user.email !== listingUserId)) {
            alert("You can only delete your own listings.");
            return;
        }

        if (confirm('Are you sure you want to delete this listing?')) {
            try {
                await deleteDoc(doc(db, 'cattle', id));
                setCattle(cattle.filter(c => c.id !== id));
                setSelectedCattle(null);
            } catch (error) {
                console.error("Error deleting listing:", error);
                alert("Failed to delete listing.");
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

    const handleBuyNow = () => {
        alert(`Request sent to ${selectedCattle?.seller} for ${selectedCattle?.name}!`);
        setSelectedCattle(null);
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark relative">
            <header className="px-6 pt-6 pb-4 shrink-0 md:pt-8 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cattle Market</h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">Buy & sell livestock</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                >
                    <span className="material-icons text-sm">add</span>
                    Add Listing
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-6 md:px-8 md:pb-8 no-scrollbar">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-icons text-4xl transform rotate-12">pets</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHead}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Total Head</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-icons text-4xl transform rotate-12">payments</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(avgPrice / 1000).toFixed(1)}k</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Avg Price</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-icons text-4xl transform rotate-12">health_and_safety</span>
                        </div>
                        <p className="text-2xl font-bold text-green-500">{Math.round((healthyCount / (totalHead || 1)) * 100)}%</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">Healthy</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === f
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                    : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-2.5 material-icons text-gray-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search cattle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 rounded-xl border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                        />
                    </div>
                </div>

                {/* Listings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCattle.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                            <div className="h-40 bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer" onClick={() => setSelectedCattle(item)}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${healthColor(item.healthStatus)}`}>
                                        {item.healthStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.breed}</h3>
                                        <p className="text-xs text-primary font-medium">{item.category}</p>
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg text-sm">
                                        ₹{(item.price / 1000).toFixed(1)}k
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center">
                                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Age</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.age}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center">
                                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Weight</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.weight}kg</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl text-center">
                                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Loc</span>
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate px-1">{item.location.split(',')[0]}</span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                                            {item.seller.charAt(0)}
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{item.seller}</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCattle(item)}
                                        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredCattle.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            <span className="material-icons text-4xl mb-2 opacity-20">search_off</span>
                            <p className="text-sm">No cattle found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Listing Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Listing</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddListing} className="space-y-4">
                            {/* Image Upload */}
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cattle Photo</label>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                    <input
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="e.g. Bella"
                                        value={newListing.name || ''}
                                        onChange={e => setNewListing({ ...newListing, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Breed</label>
                                    <input
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="e.g. Jersey"
                                        value={newListing.breed || ''}
                                        onChange={e => setNewListing({ ...newListing, breed: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        value={newListing.category}
                                        onChange={e => setNewListing({ ...newListing, category: e.target.value as any })}
                                    >
                                        <option value="Dairy">Dairy</option>
                                        <option value="Beef">Beef</option>
                                        <option value="Dual Purpose">Dual Purpose</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        value={newListing.healthStatus}
                                        onChange={e => setNewListing({ ...newListing, healthStatus: e.target.value as any })}
                                    >
                                        <option value="Healthy">Healthy</option>
                                        <option value="Vaccinated">Vaccinated</option>
                                        <option value="Under Treatment">Under Treatment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="0"
                                        value={newListing.price || ''}
                                        onChange={e => setNewListing({ ...newListing, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="0"
                                        value={newListing.weight || ''}
                                        onChange={e => setNewListing({ ...newListing, weight: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                                <input
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. 3 years"
                                    value={newListing.age || ''}
                                    onChange={e => setNewListing({ ...newListing, age: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-4"
                            >
                                Post Listing
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedCattle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row">
                        <div className="md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800">
                            <img
                                src={selectedCattle.imageUrl}
                                alt={selectedCattle.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-md ${healthColor(selectedCattle.healthStatus)}`}>
                                    {selectedCattle.healthStatus}
                                </span>
                            </div>
                        </div>

                        <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCattle.name}</h2>
                                <button onClick={() => setSelectedCattle(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors -mr-2 -mt-2">
                                    <span className="material-icons text-gray-400">close</span>
                                </button>
                            </div>
                            <p className="text-primary font-medium text-sm mb-6">{selectedCattle.breed} · {selectedCattle.category}</p>

                            <div className="flex-1 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Price</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹{selectedCattle.price.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Location</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedCattle.location}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500">Age</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCattle.age}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500">Weight</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCattle.weight} kg</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-sm text-gray-500">Seller</span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCattle.seller}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBuyNow}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-8 flex items-center justify-center gap-2"
                            >
                                <span className="material-icons text-sm">shopping_cart</span>
                                Buy Now
                            </button>

                            {session?.user?.email === selectedCattle.userId && (
                                <button
                                    onClick={() => handleDeleteListing(selectedCattle.id, selectedCattle.userId)}
                                    className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl transition-all mt-3 flex items-center justify-center gap-2"
                                >
                                    <span className="material-icons text-sm">delete</span>
                                    Delete Listing
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
