import React from 'react';
import { getMarketPrices } from '@/lib/data';

export default async function MarketPage() {
  const prices = await getMarketPrices();
  const featuredPrice = prices.find(p => p.symbol === 'ZC') || prices[0];
  const otherPrices = prices.filter(p => p.id !== featuredPrice.id);

  const generateSparkline = (data: number[]) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 40 - ((val - min) / range) * 35;
      return `${x},${y}`;
    }).join(' L');

    return `M${points}`;
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="px-6 pb-4 pt-6 flex justify-between items-center shrink-0 md:pt-8">
        <div>
          <p className="text-[10px] text-gray-400 mb-0.5">Oct 24, 2023</p>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Market Prices</h1>
        </div>
        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <span className="material-icons text-[20px]">tune</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-5 md:px-8 md:pb-8 no-scrollbar">

        <div className="max-w-6xl mx-auto space-y-5">

          {/* Featured Card */}
          <div className="w-full p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Primary Crop</span>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{featuredPrice.commodity} ({featuredPrice.symbol})</h2>
                <p className="text-[10px] text-gray-400">{featuredPrice.exchange}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">₹{featuredPrice.price.toLocaleString()}<span className="text-xs text-gray-400 ml-1">/ {featuredPrice.unit}</span></p>
                <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${featuredPrice.change >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  <span className="material-icons text-[12px]">{featuredPrice.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                  <span>{featuredPrice.change > 0 ? '+' : ''}{featuredPrice.change}%</span>
                </div>
              </div>
            </div>
            {/* Sparkline */}
            <div className="mt-4 h-12 w-full">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.12 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d={`${generateSparkline(featuredPrice.chartData)} V 40 H 0 Z`} fill="url(#grad1)"></path>
                <path d={generateSparkline(featuredPrice.chartData)} fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button className="px-3 py-1 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium whitespace-nowrap cursor-pointer">Watchlist</button>
            <button className="px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-medium whitespace-nowrap cursor-pointer hover:border-gray-300 transition-colors">Grains</button>
            <button className="px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-medium whitespace-nowrap cursor-pointer hover:border-gray-300 transition-colors">Livestock</button>
            <button className="px-3 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-medium whitespace-nowrap cursor-pointer hover:border-gray-300 transition-colors">Energy</button>
          </div>

          {/* Commodity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            {otherPrices.map((price) => (
              <div key={price.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${price.trend === 'up' ? 'bg-primary/10 text-primary' :
                    price.trend === 'down' ? 'bg-red-50 text-red-400 dark:bg-red-900/20' :
                      'bg-amber-50 text-amber-500 dark:bg-amber-900/20'
                    }`}>
                    <span className="material-icons text-base">{
                      price.commodity === 'Wheat' ? 'grass' :
                        price.commodity === 'Soybeans' ? 'eco' :
                          price.commodity === 'Canola' ? 'local_florist' : 'grain'
                    }</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white">{price.commodity}</h3>
                    <p className="text-[10px] text-gray-400">{price.exchange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-6">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 50 20">
                      <path d={generateSparkline(price.chartData)} fill="none" stroke={price.change >= 0 ? "#10b981" : "#ef4444"} strokeLinecap="round" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                  <div className="text-right w-16">
                    <div className="font-medium text-sm text-gray-900 dark:text-white tabular-nums">₹{price.price.toLocaleString()}</div>
                    <div className={`text-[10px] font-medium tabular-nums ${price.change >= 0 ? 'text-primary' : 'text-red-500'
                      }`}>{price.change > 0 ? '+' : ''}{price.change}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
