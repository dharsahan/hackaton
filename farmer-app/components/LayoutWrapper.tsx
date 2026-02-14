'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import AICropAdvisor from "@/components/AICropAdvisor";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define paths where Sidebar/BottomNav should be hidden
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/shop') || pathname === '/checkout';

  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col relative w-full h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          {children}
        </div>
        <div className="md:hidden">
          <BottomNav />
        </div>
        <AICropAdvisor />
      </div>
    </div>
  );
}
