'use client';

import React from 'react';
import { HarvestRecord, MarketplaceItem } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface ShopPageClientProps {
    farm: {
        name: string;
        farmName?: string;
        location?: string;
        image?: string;
    };
    records: HarvestRecord[];
}

export default function ShopPageClient({ farm, records }: ShopPageClientProps) {
    const { addToCart, itemCount } = useCart();
    const router = useRouter();

    const handleAddToBag = (record: HarvestRecord) => {
        // Use a stable price based on some record property instead of Math.random()
        const price = 100; // Fixed price for now to satisfy purity
        const item: MarketplaceItem = {
            id: record.id,
            name: record.crop,
            category: 'Seeds', 
            price: price,
            seller: farm.farmName || farm.name,
            userId: record.userId,
            rating: 5,
            reviewCount: 10,
            inStock: true,
            description: `Freshly harvested ${record.crop} from ${farm.farmName || farm.name}. Quality Grade: ${record.qualityGrade}`,
            imageUrl: record.crop === 'Corn' ? 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800' : 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800'
        };
        addToCart(item);
        alert(`${record.crop} added to bag!`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Hero */}
            <header className="bg-primary pt-20 pb-32 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920')] bg-cover"></div>
                <div className="relative z-10">
                    <button 
                        onClick={() => router.back()}
                        className="absolute top-8 left-6 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
                    >
                        <span className="material-icons text-white">arrow_back</span>
                    </button>

                    <div className="w-24 h-24 rounded-full border-4 border-white/20 mx-auto mb-4 overflow-hidden bg-white/10 backdrop-blur-md">
                        <img src={farm.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${farm.name}`} alt={farm.name} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">{farm.farmName || farm.name}</h1>
                    <p className="opacity-90 flex items-center justify-center gap-1">
                        <span className="material-icons text-sm">location_on</span> {farm.location || "Local Producer"}
                    </p>
                </div>
                
                {itemCount > 0 && (
                    <button 
                        onClick={() => router.push('/marketplace')}
                        className="fixed bottom-8 right-8 z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 animate-bounce"
                    >
                        <span className="material-icons text-primary">shopping_bag</span>
                        <span className="font-bold">{itemCount} items in bag</span>
                        <span className="material-icons text-sm">arrow_forward</span>
                    </button>
                )}
            </header>

            {/* Products */}
            <main className="max-w-6xl mx-auto px-6 -mt-16 relative z-20 pb-20">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold mb-8">Available Today</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {records.length > 0 ? records.map(record => (
                            <div key={record.id} className="group cursor-pointer">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-3xl mb-4 overflow-hidden relative">
                                    <img
                                        src={record.crop === 'Corn' ? 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800' : 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800'}
                                        alt={record.crop}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary">
                                        Fresh Harvest
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{record.crop}</h3>
                                <p className="text-sm text-gray-500 mb-3">{record.weightTons} tons available</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-primary">₹{(100).toFixed(0)}/kg</span>
                                    <button 
                                        onClick={() => handleAddToBag(record)}
                                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Add to Bag
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-gray-400 italic">
                                No items currently listed for direct sale.
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="py-10 text-center text-gray-400 text-xs">
                Powered by Farmertopia B2C
            </footer>
        </div>
    );
}
