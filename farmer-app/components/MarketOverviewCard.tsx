import React from 'react';
import { getMarketPrices } from '@/lib/data';
import Link from 'next/link';
import MarketOverviewCardClient from './MarketOverviewCardClient';

export default async function MarketOverviewCard() {
    const prices = await getMarketPrices();

    return (
        <MarketOverviewCardClient initialPrices={prices} />
    );
}
