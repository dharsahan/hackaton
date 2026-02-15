'use client';

import React, { useState, useMemo } from 'react';
import { MarketPrice } from '@/lib/types';
import Link from 'next/link';

interface MarketOverviewCardClientProps {
    initialPrices: MarketPrice[];
}

type Category = 'Watchlist' | 'Grains' | 'Livestock' | 'Energy' | 'Softs';

export default function MarketOverviewCardClient({ initialPrices }: MarketOverviewCardClientProps) {
    const [activeCategory, setActiveCategory] = useState<Category>('Watchlist');

    const filteredPrices = useMemo(() => {
        if (activeCategory === 'Watchlist') {
            // For Watchlist, show top gainers across all categories
            return [...initialPrices].sort((a, b) => b.change - a.change);
        }
        return initialPrices
            .filter(p => p.category === activeCategory)
            .sort((a, b) => b.change - a.change);
    }, [initialPrices, activeCategory]);

    const topGainer = filteredPrices.length > 0 ? filteredPrices[0] : null;
    const others = filteredPrices.length > 1 ? filteredPrices.slice(1, 4) : [];

    const categories: Category[] = ['Watchlist', 'Grains', 'Livestock', 'Energy', 'Softs'];

    return (
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between h-full min-h-[160px] group hover:border-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <span className="material-icons">trending_up</span>
                </div>
                <Link href="/market" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1">
                    Market <span className="material-icons text-[10px]">arrow_forward</span>
                </Link>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeCategory === cat
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {activeCategory === 'Watchlist' ? 'Top Performer' : `Top ${activeCategory}`}
                </p>

                {topGainer ? (
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{topGainer.commodity}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{topGainer.symbol}</p>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-gray-900 dark:text-white">₹{topGainer.price.toLocaleString()}</span>
                            <span className={`text-[10px] font-bold flex items-center justify-end ${topGainer.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                {topGainer.change > 0 ? '+' : ''}{topGainer.change}%
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic mb-3">No data available</div>
                )}

                {/* Mini list of others */}
                <div className="space-y-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                    {others.length > 0 ? (
                        others.slice(0, 2).map(p => (
                            <div key={p.id} className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">{p.commodity}</span>
                                <span className={`font-bold ${p.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                    {p.change > 0 ? '+' : ''}{p.change}%
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-[10px] text-gray-300 text-center py-1">No other items</div>
                    )}
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-3 text-[9px] text-gray-300 dark:text-gray-600 text-center">
                Source: Agmarknet.gov.in
            </div>
        </div>
    );
}
