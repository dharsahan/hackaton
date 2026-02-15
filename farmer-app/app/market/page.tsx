import React from 'react';
import { getMarketPrices } from '@/lib/data';

export const dynamic = 'force-dynamic';

const commodityImages: Record<string, string> = {
  'ZW': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=200&auto=format&fit=crop', // Wheat
  'ZS': 'https://images.unsplash.com/photo-1600747476236-76579658b1b1?q=80&w=200&auto=format&fit=crop', // Soybeans
  'ZC': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=200&auto=format&fit=crop', // Corn
  'ZR': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop', // Rice
  'KC': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&auto=format&fit=crop', // Coffee
  'SUG': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=200&auto=format&fit=crop', // Sugarcane
  'CT': 'https://images.unsplash.com/photo-1502395809857-fd80069897d0?q=80&w=200&auto=format&fit=crop', // Cotton
  'TMC': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=200&auto=format&fit=crop', // Turmeric
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

export default async function MarketPage() {
  const prices = await getMarketPrices();
  // Find Rice for featured card as per design
  const featuredPrice = prices.find(p => p.symbol === 'ZR') || prices[0];
  const otherPrices = prices.filter(p => p.id !== featuredPrice.id);

  const featuredPath = generateSmoothSparkline(featuredPrice.chartData, 300, 100); // Higher res for featured

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white">
      {/* Header */}
      <header className="px-6 pb-6 pt-8 flex justify-between items-center shrink-0 max-w-7xl mx-auto w-full">
        <div>
          <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-widest">Global Markets</p>
          <h1 className="text-3xl font-bold tracking-tight">Commodity Prices</h1>
        </div>
        <button className="p-3 rounded-2xl bg-[#1e293b] text-gray-400 hover:text-primary transition-all shadow-lg border border-gray-800 cursor-pointer">
          <span className="material-icons text-[20px]">tune</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 md:px-8 md:pb-8 no-scrollbar bg-[#0f172a]">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Featured Card */}
          <div className="w-full rounded-3xl bg-[#1e293b] border border-gray-800 shadow-2xl relative overflow-hidden group">
            {/* Background Chart Fill */}
            <div className="absolute bottom-0 left-0 right-0 h-48 opacity-20 pointer-events-none">
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
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
                  <img src={commodityImages[featuredPrice.symbol] || ""} alt={featuredPrice.commodity} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-bold text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-3 py-1 rounded-full mb-2">Top Performer</span>
                  <h2 className="text-2xl font-bold text-white leading-tight">{featuredPrice.commodity} ({featuredPrice.symbol})</h2>
                  <p className="text-sm text-gray-400 font-medium mt-1">{featuredPrice.exchange} · Future Contract</p>
                </div>
              </div>

              <div className="bg-[#0f172a]/80 backdrop-blur-xl p-5 rounded-2xl border border-gray-700 shadow-xl min-w-[200px] text-right">
                <p className="text-3xl font-black text-white tracking-tight">₹{featuredPrice.price.toLocaleString()}<span className="text-sm text-gray-500 ml-1 font-medium">/ {featuredPrice.unit}</span></p>
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
            <button className="px-6 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold whitespace-nowrap shadow-lg shadow-primary/5 active:scale-95 cursor-pointer">Watchlist</button>
            {['Grains', 'Livestock', 'Energy', 'Softs'].map(filter => (
              <button key={filter} className="px-6 py-2.5 rounded-xl bg-[#1e293b] border border-gray-800 text-gray-400 text-xs font-bold whitespace-nowrap hover:text-white hover:border-gray-600 transition-all active:scale-95 cursor-pointer">{filter}</button>
            ))}
          </div>

          {/* Commodity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {otherPrices.map((price) => {
              const path = generateSmoothSparkline(price.chartData, 100, 40);
              return (
                <div key={price.id} className="bg-[#1e293b] p-5 rounded-3xl border border-gray-800 flex items-center justify-between hover:border-gray-600 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-700 shrink-0">
                      <img src={commodityImages[price.symbol] || ""} alt={price.commodity} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white leading-tight">{price.commodity}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{price.symbol} · {price.exchange}</p>
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
                      <div className="font-black text-sm text-white tabular-nums">₹{price.price.toLocaleString()}</div>
                      <div className={`text-[10px] font-bold tabular-nums flex items-center justify-end ${price.change >= 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                        {Math.abs(price.change)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
