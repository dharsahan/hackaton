import React from 'react';
import { getMarketPrices } from '@/lib/data';
import Link from 'next/link';

export default async function MarketOverviewCard() {
    const prices = await getMarketPrices();
    // Sort by change percentage descending
    const sorted = [...prices].sort((a, b) => b.change - a.change);
    const topGainer = sorted[0];
    const others = sorted.slice(1, 4);

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

            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Top Performer</p>
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

                {/* Mini list of others */}
                <div className="space-y-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                    {others.slice(0, 2).map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">{p.commodity}</span>
                            <span className={`font-bold ${p.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                                {p.change > 0 ? '+' : ''}{p.change}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
