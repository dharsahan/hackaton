'use client';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/harvest-log' || pathname === '/login') return null;

  const tabs = [
    { name: 'Home', icon: 'dashboard', href: '/' },
    { name: 'Fields', icon: 'map', href: '/fields' },
    { name: 'Tasks', icon: 'assignment', href: '/tasks' },
    { name: 'Market', icon: 'trending_up', href: '/market' },
    { name: 'Analytics', icon: 'bar_chart', href: '/analytics' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-6 pt-2 px-4 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]">
              <span className={`material-icons text-[22px] ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>{tab.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>{tab.name}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
