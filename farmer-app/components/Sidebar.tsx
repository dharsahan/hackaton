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
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-gray-100 dark:border-gray-800 min-h-screen sticky top-0 shrink-0 transiton-colors duration-300">
      <div className="px-6 py-6 border-b border-gray-100 dark:border-gray-800/50">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-icons text-white text-lg">eco</span>
          </div>
          Farmertopia
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span className={`material-icons text-[20px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-current'}`}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800/50 space-y-3">
        <ThemeToggle />

        <Link
          href="/harvest-log"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10 transition-colors justify-center"
        >
          <span className="material-icons text-[18px]">add</span>
          Log Harvest
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 px-4 py-2 w-full rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10 transition-colors justify-center text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <span className="material-icons text-[16px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
