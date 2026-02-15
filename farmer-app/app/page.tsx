import Header from '@/components/Header';
import YieldSummaryCard from '@/components/YieldSummaryCard';
import WeatherWidget from '@/components/WeatherWidget';
import QuickActions from '@/components/QuickActions';
import ActiveFieldsList from '@/components/ActiveFieldsList';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer@farmertopia.com";

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 md:pb-8 no-scrollbar max-w-7xl mx-auto w-full">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <YieldSummaryCard userId={userId} />
          <WeatherWidget />
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <span className="material-icons">trending_up</span>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Status</p>
                   <p className="text-lg font-bold text-gray-900 dark:text-white">Active & Bullish</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <ActiveFieldsList userId={userId} />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <QuickActions />
            
            {/* Recent Activity Placeholder */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Upcoming Tasks</h2>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  { title: 'Irrigation Plot B', time: '09:00 AM', icon: 'water_drop' },
                  { title: 'Pest Control', time: '11:30 AM', icon: 'bug_report' },
                  { title: 'Soil Sample', time: '02:00 PM', icon: 'science' },
                ].map((task, i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <span className="material-icons text-lg">{task.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{task.title}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{task.time}</p>
                    </div>
                    <span className="material-icons text-gray-300 text-sm">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
