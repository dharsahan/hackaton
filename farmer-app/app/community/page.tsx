import React from 'react';
import { getCommunityPosts } from '@/lib/data';
import CommunityPageClient from '@/components/CommunityPageClient';

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
  const posts = await getCommunityPosts();
  return <CommunityPageClient posts={posts} />;
}
