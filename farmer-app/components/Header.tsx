'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="px-6 py-5 flex items-center justify-between shrink-0">
      <div>
        <p className="text-gray-400 text-xs font-medium">Good Morning,</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{session?.user?.name || "Farmer"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => signOut()}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer md:hidden"
        >
          <span className="material-icons text-[20px]">logout</span>
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
          <span className="material-icons text-[20px]">notifications_none</span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
