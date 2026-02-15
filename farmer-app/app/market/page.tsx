import React from 'react';
import { getMarketPrices } from '@/lib/data';
import MarketPageClient from '@/components/MarketPageClient';

export const dynamic = 'force-dynamic';

export default async function MarketPage() {
  const prices = await getMarketPrices();

  return (
    <MarketPageClient prices={prices} />
  );
}
