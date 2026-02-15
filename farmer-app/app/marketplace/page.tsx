import React from 'react';
import { getMarketplaceItems } from '@/lib/data';
import MarketplacePageClient from '@/components/MarketplacePageClient';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const items = await getMarketplaceItems();
  return <MarketplacePageClient items={items} />;
}
