import Header from '@/components/Header';
import YieldSummaryCard from '@/components/YieldSummaryCard';
import WeatherWidget from '@/components/WeatherWidget';
import QuickActions from '@/components/QuickActions';
import ActiveFieldsList from '@/components/ActiveFieldsList';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer";

  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 md:pb-6 no-scrollbar">
        {/* Summary & Weather & Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="overflow-hidden">
            <YieldSummaryCard userId={userId} />
          </div>
          <div className="overflow-hidden">
            <WeatherWidget />
          </div>
          <div className="overflow-hidden">
            <QuickActions />
          </div>
        </div>

        <ActiveFieldsList userId={userId} />
      </main>
    </div>
  );
}
