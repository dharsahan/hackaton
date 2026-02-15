import React from 'react';
import { getInventory } from '@/lib/data';
import InventoryPageClient from './InventoryPageClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer";
  const items = await getInventory(userId);

  return <InventoryPageClient initialItems={items} />;
}
