'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="px-6 py-5 flex items-center justify-between shrink-0">
      <Link href="/profile" className="group">
        <p className="text-gray-400 text-xs font-medium group-hover:text-primary transition-colors">Good Morning,</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{session?.user?.name || "Farmer"}</h1>
      </Link>
      <div className="flex items-center gap-2">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer md:hidden"
        >
          <span className="material-icons text-[20px]">logout</span>
        </button>
        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
          <span className="material-icons text-[20px]">notifications_none</span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
        </button>
        <Link href="/profile" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700">
           <Image 
             src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session?.user?.name || 'Farmer')}`} 
             alt="Profile" 
             width={32} 
             height={32}
             className="object-cover"
             unoptimized
           />
        </Link>
      </div>
    </header>
  );
}
