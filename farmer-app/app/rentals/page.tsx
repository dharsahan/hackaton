import React from 'react';
import { getRentalEquipment } from '@/lib/data';
import RentalsPageClient from '@/components/RentalsPageClient';

export const dynamic = 'force-dynamic';

export default async function RentalsPage() {
  const equipment = await getRentalEquipment();
  return <RentalsPageClient equipment={equipment} />;
}
