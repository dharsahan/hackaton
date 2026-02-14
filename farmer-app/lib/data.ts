import { CattleListing, CommunityPost, Field, HarvestRecord, Insight, MarketplaceItem, MarketPrice, RentalEquipment, Task, Weather, YieldData } from "./types";
import { CATTLE, COMMUNITY_POSTS, FIELDS, HARVEST_RECORDS, INSIGHTS, MARKET_PRICES, MARKETPLACE_ITEMS, RENTAL_EQUIPMENT, TASKS, USER, WEATHER, YIELD_HISTORY } from "./mockData";

// Simulate async fetching
export async function getUser() {
  return USER;
}

export async function getFields(): Promise<Field[]> {
  return FIELDS;
}

export async function getTasks(): Promise<Task[]> {
  return TASKS;
}

export async function getWeather(): Promise<Weather> {
  return WEATHER;
}

export async function getMarketPrices(): Promise<MarketPrice[]> {
  return MARKET_PRICES;
}

export async function getYieldHistory(): Promise<YieldData[]> {
  return YIELD_HISTORY;
}

export async function getInsights(): Promise<Insight[]> {
  return INSIGHTS;
}

export async function getCattle(): Promise<CattleListing[]> {
  return CATTLE;
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return COMMUNITY_POSTS;
}

export async function getMarketplaceItems(): Promise<MarketplaceItem[]> {
  return MARKETPLACE_ITEMS;
}

export async function getRentalEquipment(): Promise<RentalEquipment[]> {
  return RENTAL_EQUIPMENT;
}

export async function getHarvestRecords(): Promise<HarvestRecord[]> {
  return HARVEST_RECORDS;
}
