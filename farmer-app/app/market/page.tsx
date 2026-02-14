import React from 'react';
import { getMarketPrices } from '@/lib/data';

const commodityImages: Record<string, string> = {
  'ZW': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&auto=format&fit=crop', // Wheat
  'ZS': 'https://www.scoular.com/wp-content/uploads/2020/10/dark-hilum-soybeans2_27952870.jpg.webp', // Soybeans
  'ZC': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=200&auto=format&fit=crop', // Corn
  'ZR': 'https://img.jagranjosh.com/images/2025/09/12/article/image/scientific-name-of-rice-1757656335124.webp', // Rice
  'KC': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop', // Coffee
  'SB': 'https://lirp.cdn-website.com/cbf48001/dms3rep/multi/opt/Different%2BTypes%2Bof%2BSugar-640w.jpg', // Sugar
  'CT': 'https://alnassaj.com/wp-content/uploads/2024/10/top-view-cotton-flower-decoration_23-2148446653.jpg', // Cotton
};

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
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-bold tracking-widest">Global Markets</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Commodity Prices</h1>
        </div>
        <button className="p-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-400 hover:text-primary transition-all shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer">
          <span className="material-icons text-[20px]">tune</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-6 md:px-8 md:pb-8 no-scrollbar">

        <div className="max-w-6xl mx-auto space-y-6">

          {/* Featured Card */}
          <div className="w-full p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-700 transform group-hover:scale-105 transition-transform duration-500">
                  <img src={commodityImages[featuredPrice.symbol] || ""} alt={featuredPrice.commodity} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">Top Performer</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1 leading-tight">{featuredPrice.commodity} ({featuredPrice.symbol})</h2>
                  <p className="text-xs text-gray-400 font-medium">{featuredPrice.exchange} · Future Contract</p>
                </div>
              </div>
              
              <div className="text-left md:text-right w-full md:w-auto bg-white/50 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-gray-700">
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{featuredPrice.price.toLocaleString()}<span className="text-sm text-gray-400 ml-1 font-medium">/ {featuredPrice.unit}</span></p>
                <div className={`flex items-center justify-start md:justify-end gap-1 mt-1 text-sm font-bold ${featuredPrice.change >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  <span className="material-icons text-base">{featuredPrice.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                  <span>{featuredPrice.change > 0 ? '+' : ''}{featuredPrice.change}%</span>
                </div>
              </div>
            </div>

            {/* Featured Sparkline */}
            <div className="mt-8 h-20 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d={`${generateSparkline(featuredPrice.chartData)} V 40 H 0 Z`} fill="url(#grad1)"></path>
                <path d={generateSparkline(featuredPrice.chartData)} fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            <button className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold whitespace-nowrap shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-95 cursor-pointer">Watchlist</button>
            {['Grains', 'Livestock', 'Energy', 'Softs'].map(filter => (
              <button key={filter} className="px-5 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 text-xs font-bold whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 cursor-pointer">{filter}</button>
            ))}
          </div>

          {/* Commodity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {otherPrices.map((price) => (
              <div key={price.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500 border border-gray-100 dark:border-gray-700">
                    <img src={commodityImages[price.symbol] || ""} alt={price.commodity} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{price.commodity}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{price.symbol} · {price.exchange}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="hidden sm:block w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 50 20">
                      <path d={generateSparkline(price.chartData)} fill="none" stroke={price.change >= 0 ? "#10b981" : "#ef4444"} strokeLinecap="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-gray-900 dark:text-white tabular-nums tracking-tight">₹{price.price.toLocaleString()}</div>
                    <div className={`text-[10px] font-black tabular-nums flex items-center justify-end ${price.change >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      <span className="material-icons text-[10px]">{price.change >= 0 ? 'expand_less' : 'expand_more'}</span>
                      {Math.abs(price.change)}%
                    </div>
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
