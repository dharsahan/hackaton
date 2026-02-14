import React from 'react';
import { getFarmDetails, getHarvestRecords } from '@/lib/data';
import ShopPageClient from '@/components/ShopPageClient';

export default async function ShopPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  const decodedFarmId = decodeURIComponent(farmId);
  const farm = await getFarmDetails(decodedFarmId);
  const records = await getHarvestRecords(decodedFarmId);

  if (!farm) {
    return <div className="p-20 text-center text-gray-500">Farm not found.</div>;
  }

  return <ShopPageClient farm={farm} records={records} />;
}
