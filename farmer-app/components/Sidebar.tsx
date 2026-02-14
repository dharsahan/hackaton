'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import ThemeToggle from "./ThemeToggle";

import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', href: '/' },
    { name: 'Map', icon: 'map', href: '/fields' },
    { name: 'Cattle', icon: 'pets', href: '/cattle' },
    { name: 'Rentals', icon: 'agriculture', href: '/rentals' },
    { name: 'Inventory', icon: 'inventory_2', href: '/inventory' },
    { name: 'Finance', icon: 'account_balance_wallet', href: '/finance' },
    { name: 'Marketplace', icon: 'store', href: '/marketplace' },
    { name: 'Community', icon: 'people', href: '/community' },
    { name: 'Analytics', icon: 'bar_chart', href: '/analytics' },
    { name: 'Commodities', icon: 'trending_up', href: '/market' },
    { name: 'Profile', icon: 'account_circle', href: '/profile' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-screen sticky top-0 shrink-0">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="material-icons text-primary text-xl">eco</span>
          Farmertopia
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span className={`material-icons text-[20px] ${isActive ? 'text-primary' : ''}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <ThemeToggle />

        <Link
          href="/harvest-log"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors justify-center"
        >
          <span className="material-icons text-[18px]">add</span>
          Log Harvest
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-gray-50 hover:text-red-500 dark:hover:bg-gray-800 transition-colors justify-center text-sm cursor-pointer"
        >
          <span className="material-icons text-[16px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
