'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

interface InventoryPageClientProps {
    initialItems: InventoryItem[];
}

export default function InventoryPageClient({ initialItems }: InventoryPageClientProps) {
    const { data: session } = useSession();
    const [items, setItems] = useState(initialItems);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        category: 'Seeds',
        quantity: 0,
        minThreshold: 10,
    });

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) return;

        const itemData = {
            name: newItem.name || 'New Item',
            category: newItem.category as any,
            quantity: Number(newItem.quantity) || 0,
            unit: newItem.unit || 'units',
            minThreshold: Number(newItem.minThreshold) || 0,
            userId: session.user.email || 'anonymous',
        };

        try {
            const docRef = await addDoc(collection(db, 'inventory'), itemData);
            setItems([{ id: docRef.id, ...itemData }, ...items]);
            setIsAddModalOpen(false);
            setNewItem({ category: 'Seeds', quantity: 0, minThreshold: 10 });
        } catch (error) {
            console.error("Error adding inventory:", error);
        }
    };

    const handleUpdateQuantity = async (id: string, newQty: number) => {
        try {
            await updateDoc(doc(db, 'inventory', id), { quantity: newQty });
            setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory & Warehouse</h1>
                    <p className="text-sm text-gray-400">Track your supplies and stock levels</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2"
                >
                    <span className="material-icons">add</span> Add Item
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{item.category}</span>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
                            </div>
                            {item.quantity <= item.minThreshold && (
                                <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                    <span className="material-icons text-xs">warning</span> LOW STOCK
                                </span>
                            )}
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.quantity} <span className="text-sm font-normal text-gray-400">{item.unit}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
                                >-</button>
                                <button 
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400"
                                >+</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal Placeholder */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add Inventory Item</h2>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none" 
                                placeholder="Item Name" 
                                onChange={e => setNewItem({...newItem, name: e.target.value})} 
                            />
                            <select 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none"
                                onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                            >
                                <option value="Seeds">Seeds</option>
                                <option value="Fertilizers">Fertilizers</option>
                                <option value="Fuel">Fuel</option>
                                <option value="Chemicals">Chemicals</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number" 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none" 
                                    placeholder="Initial Qty" 
                                    onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                                />
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none" 
                                    placeholder="Unit (e.g. bags)" 
                                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold">Save Item</button>
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full text-gray-400 py-2">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
