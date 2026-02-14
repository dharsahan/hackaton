'use client';

import React, { useState } from 'react';
import { RentalEquipment } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import { compressImage } from '@/lib/imageUtils';

interface RentalsPageClientProps {
    equipment: RentalEquipment[];
}

const typeIcons: Record<string, string> = {
    Tractor: 'agriculture',
    Harvester: 'content_cut',
    Tiller: 'gradient',
    Sprayer: 'water',
    Seeder: 'eco',
};

export default function RentalsPageClient({ equipment: initialEquipment }: RentalsPageClientProps) {
    const { data: session } = useSession();
    const [equipment, setEquipment] = useState(initialEquipment);
    const [activeType, setActiveType] = useState('All');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [newEquipment, setNewEquipment] = useState<Partial<RentalEquipment>>({
        type: 'Tractor',
        available: true,
        specs: '',
        location: ''
    });

    const types = ['All', 'Tractor', 'Harvester', 'Tiller', 'Sprayer', 'Seeder'];

    const filtered = equipment.filter(eq => {
        const matchesType = activeType === 'All' || eq.type === activeType;
        const matchesAvailability = !showAvailableOnly || eq.available;
        return matchesType && matchesAvailability;
    });

    const availableCount = equipment.filter(e => e.available).length;

    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) {
            alert("Please sign in to list equipment.");
            return;
        }

        try {
            let finalImageUrl = imagePreview || "https://upload.wikimedia.org/wikipedia/commons/2/20/Mahindra_tractor_model2.jpg";

            if (imageFile) {
                finalImageUrl = await compressImage(imageFile);
            }

            const equipmentData = {
                name: newEquipment.name || 'Unknown Equipment',
                type: newEquipment.type as any,
                pricePerDay: Number(newEquipment.pricePerDay) || 0,
                available: true,
                rating: 0,
                location: newEquipment.location || 'Unknown Location',
                specs: newEquipment.specs || 'Standard Specs',
                owner: session.user.name || 'Anonymous',
                userId: session.user.email || 'anonymous',
                imageUrl: finalImageUrl
            };

            const docRef = await addDoc(collection(db, 'rental_equipment'), equipmentData);
            const item: RentalEquipment = {
                id: docRef.id,
                ...equipmentData
            };
            setEquipment([item, ...equipment]);
            setIsAddModalOpen(false);
            setNewEquipment({ type: 'Tractor', available: true });
            setImagePreview(null);
            setImageFile(null);
        } catch (error) {
            console.error("Error adding equipment:", error);
            alert("Failed to add equipment. Image might still be too large.");
        }
    };

    const handleDeleteEquipment = async (id: string, ownerUserId: string) => {
        if (!session?.user || (session.user.email !== ownerUserId)) {
            alert("You can only delete your own listings.");
            return;
        }

        if (confirm('Are you sure you want to delete this listing?')) {
            try {
                await deleteDoc(doc(db, 'rental_equipment', id));
                setEquipment(equipment.filter(e => e.id !== id));
            } catch (error) {
                console.error("Error deleting equipment:", error);
                alert("Failed to delete equipment.");
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

    const handleBookNow = async (id: string, name: string) => {
        if (confirm(`Do you want to book ${name}?`)) {
            try {
                // Update Firestore
                const equipmentRef = doc(db, 'rental_equipment', id);
                await updateDoc(equipmentRef, {
                    available: false
                });

                // Update local state to reflect booking
                setEquipment(equipment.map(e => 
                    e.id === id ? { ...e, available: false } : e
                ));
                alert(`${name} booked successfully!`);
            } catch (error) {
                console.error("Error booking equipment:", error);
                alert("Failed to book equipment. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="px-6 pt-6 pb-4 shrink-0 md:pt-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Equipment Rentals</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{availableCount} of {equipment.length} available</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <span className="material-icons text-sm">add</span>
                        List Rental
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    {/* Type Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {types.map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${activeType === type
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                {type !== 'All' && <span className="material-icons text-[12px]">{typeIcons[type]}</span>}
                                {type}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${showAvailableOnly
                            ? 'bg-primary/10 text-primary'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500'
                            }`}
                    >
                        <span className="material-icons text-sm">check_circle</span>
                        Available Only
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 md:px-8 md:pb-8 no-scrollbar">
                {/* Equipment List */}
                <div className="space-y-3 max-w-3xl mx-auto md:mx-0">
                    {filtered.map(eq => (
                        <div key={eq.id} className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 hover:border-gray-200 dark:hover:border-gray-700 transition-colors ${!eq.available ? 'opacity-60' : ''}`}>
                            <div className="flex gap-3 h-28">
                                {/* Image */}
                                <div className="w-28 h-full rounded-lg shrink-0 overflow-hidden relative group">
                                    <img
                                        src={eq.imageUrl}
                                        alt={eq.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-md flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm`}>
                                        <span className="material-icons text-sm text-gray-600 dark:text-gray-300">{typeIcons[eq.type]}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{eq.name}</h3>
                                                    {session?.user?.email === eq.userId && (
                                                        <button
                                                            onClick={() => handleDeleteEquipment(eq.id, eq.userId)}
                                                            className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                            title="Delete Listing"
                                                        >
                                                            <span className="material-icons text-sm">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{eq.type} · {eq.owner}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${eq.available
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {eq.available ? 'Available' : 'Booked'}
                                            </span>
                                        </div>

                                        {/* Specs */}
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1 line-clamp-1">
                                            <span className="material-icons text-[12px] text-gray-300">settings</span>
                                            {eq.specs}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/50 mt-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-bold text-gray-900 dark:text-white">₹{eq.pricePerDay.toLocaleString()}<span className="text-[10px] text-gray-400 font-normal">/day</span></span>
                                            <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                                                <span className="material-icons text-amber-400 text-[10px]">star</span>
                                                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">{eq.rating}</span>
                                            </div>
                                        </div>

                                        {eq.available && (
                                            <button 
                                                onClick={() => handleBookNow(eq.id, eq.name)}
                                                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
                                            >
                                                Book Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <span className="material-icons text-4xl text-gray-200 dark:text-gray-700 mb-2">search_off</span>
                        <p className="text-sm text-gray-400">No equipment matches your filters</p>
                    </div>
                )}
            </main>

            {/* List Rental Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">List Equipment</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <span className="material-icons text-gray-500">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddEquipment} className="space-y-4">
                            {/* Image Upload */}
                            <div className="w-full">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Equipment Photo</label>
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipment Name</label>
                                <input
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. John Deere 5310"
                                    value={newEquipment.name || ''}
                                    onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        value={newEquipment.type}
                                        onChange={e => setNewEquipment({ ...newEquipment, type: e.target.value as any })}
                                    >
                                        {types.filter(t => t !== 'All').map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rate (₹/Day)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                        placeholder="0"
                                        value={newEquipment.pricePerDay || ''}
                                        onChange={e => setNewEquipment({ ...newEquipment, pricePerDay: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specs</label>
                                <input
                                    required
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/30"
                                    placeholder="e.g. 50 HP, 4WD"
                                    value={newEquipment.specs || ''}
                                    onChange={e => setNewEquipment({ ...newEquipment, specs: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] mt-2"
                            >
                                List for Rent
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
