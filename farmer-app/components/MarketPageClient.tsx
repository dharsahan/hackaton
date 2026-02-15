'use client';

import React, { useState, useMemo } from 'react';
import { MarketPrice } from '@/lib/types';
import Link from 'next/link';

interface MarketPageClientProps {
    prices: MarketPrice[];
}

const commodityImages: Record<string, string> = {
    'WHEAT': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&auto=format&fit=crop', // Wheat
    'SOY': 'https://images.unsplash.com/photo-1600747476236-76579658b1b1?q=80&w=200&auto=format&fit=crop', // Soybeans
    'ZC': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=200&auto=format&fit=crop', // Corn
    'RICE': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop', // Rice
    'KC': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&auto=format&fit=crop', // Coffee
    'SUG': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=200&auto=format&fit=crop', // Sugarcane
    'COTTON': 'https://images.unsplash.com/photo-1502395809857-fd80069897d0?q=80&w=200&auto=format&fit=crop', // Cotton
    'TMC': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=200&auto=format&fit=crop', // Turmeric
    'MILK': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=200&auto=format&fit=crop', // Milk
    'CATTLE': 'https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?q=80&w=200&auto=format&fit=crop', // Cattle
    'DSL': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=200&auto=format&fit=crop', // Diesel
    'SUN': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200&auto=format&fit=crop', // Solar
};

// Helper for smooth bezier curves
const getControlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

const generateSmoothSparkline = (data: number[], width: number = 100, height: number = 40) => {
    if (data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1); // Add padding
        return [x, y];
    });

    const path = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`;

        const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);

        return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    }, "");

    return path;
};

type Category = 'Watchlist' | 'Grains' | 'Livestock' | 'Energy' | 'Softs';

export default function MarketPageClient({ prices }: MarketPageClientProps) {
    const [activeCategory, setActiveCategory] = useState<Category>('Watchlist');

    // Find Featured Price (Rice - RICE) - constant regardless of filter, or should it change? 
    // Design usually keeps Featured distinct. I'll keep it as RICE (Basmati).
    const featuredPrice = prices.find(p => p.symbol === 'RICE') || prices[0];
    const featuredPath = generateSmoothSparkline(featuredPrice.chartData, 300, 100);

    const filteredPrices = useMemo(() => {
        let filtered = prices.filter(p => p.id !== featuredPrice.id);
        if (activeCategory !== 'Watchlist') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }
        return filtered;
    }, [prices, activeCategory, featuredPrice.id]);

    const categories: Category[] = ['Watchlist', 'Grains', 'Livestock', 'Energy', 'Softs'];

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pb-6 pt-8 flex justify-between items-center shrink-0 max-w-7xl mx-auto w-full">
                <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-widest">Global Markets</p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Commodity Prices</h1>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium mt-1 flex items-center gap-1">
                        <span className="material-icons text-[10px]">verified</span> Source: Agmarknet.gov.in
                    </p>
                </div>
                <button className="p-3 rounded-2xl bg-white dark:bg-[#1e293b] text-gray-500 dark:text-gray-400 hover:text-primary transition-all shadow-sm dark:shadow-lg border border-gray-200 dark:border-gray-800 cursor-pointer">
                    <span className="material-icons text-[20px]">tune</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 md:px-8 md:pb-8 no-scrollbar bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Featured Card */}
                    <div className="w-full rounded-3xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-2xl relative overflow-hidden group">
                        {/* Background Chart Fill */}
                        <div className="absolute bottom-0 left-0 right-0 h-48 opacity-10 dark:opacity-20 pointer-events-none">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 100">
                                <defs>
                                    <linearGradient id="featuredGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`${featuredPath} V 100 H 0 Z`} fill="url(#featuredGrad)" />
                                <path d={featuredPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="flex items-start gap-6">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
                                    <img src={commodityImages[featuredPrice.symbol] || "https://images.unsplash.com/photo-1595246140625-573b715e11d3?q=80&w=200&auto=format&fit=crop"} alt={featuredPrice.commodity} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <span className="inline-block text-[10px] font-bold text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full mb-2">Top Performer</span>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{featuredPrice.commodity} ({featuredPrice.symbol})</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{featuredPrice.exchange} · Future Contract</p>
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg min-w-[200px] text-right">
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">₹{featuredPrice.price.toLocaleString()}<span className="text-sm text-gray-500 ml-1 font-medium">/ {featuredPrice.unit}</span></p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className={`text-sm font-bold flex items-center ${featuredPrice.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                        <span className="material-icons text-sm mr-1">{featuredPrice.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                        {featuredPrice.change > 0 ? '+' : ''}{featuredPrice.change}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Spacer for chart */}
                        <div className="h-12 w-full"></div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer border ${activeCategory === category
                                    ? 'bg-white text-gray-900 border-gray-200 shadow-md dark:shadow-primary/5 dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Commodity Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                        {filteredPrices.length > 0 ? (
                            filteredPrices.map((price) => {
                                const path = generateSmoothSparkline(price.chartData, 100, 40);
                                return (
                                    <div key={price.id} className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-gray-200 dark:border-gray-800 flex items-center justify-between hover:border-primary/30 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                                                <img src={commodityImages[price.symbol] || "https://images.unsplash.com/photo-1595246140625-573b715e11d3?q=80&w=200&auto=format&fit=crop"} alt={price.commodity} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{price.commodity}</h3>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{price.symbol} · {price.exchange}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            {/* Mini Sparkline */}
                                            <div className="w-20 h-8">
                                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                                                    <path d={path} fill="none" stroke={price.change >= 0 ? "#10b981" : "#ef4444"} strokeWidth="2.5" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-sm text-gray-900 dark:text-white tabular-nums">₹{price.price.toLocaleString()}</div>
                                                <div className={`text-[10px] font-bold tabular-nums flex items-center justify-end ${price.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                                    {Math.abs(price.change)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-gray-400 dark:text-gray-500">search_off</span>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No commodities found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
