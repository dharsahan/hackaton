import Header from '@/components/Header';
import YieldSummaryCard from '@/components/YieldSummaryCard';
import WeatherWidget from '@/components/WeatherWidget';
import QuickActions from '@/components/QuickActions';
import ActiveFieldsList from '@/components/ActiveFieldsList';
import MarketOverviewCard from '@/components/MarketOverviewCard';
import UpcomingTasks from '@/components/UpcomingTasks';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer@farmertopia.com";

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 md:pb-8 no-scrollbar max-w-7xl mx-auto w-full">

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <YieldSummaryCard userId={userId} />
          <WeatherWidget />
          <MarketOverviewCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <ActiveFieldsList userId={userId} />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <QuickActions />
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-1 border border-gray-100 dark:border-gray-800 shadow-sm">
              <UpcomingTasks userId={userId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
