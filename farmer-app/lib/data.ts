import { collection, getDocs, query, orderBy, limit, doc, getDoc, where, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import {
  User,
  CattleListing,
  CommunityPost,
  Field,
  HarvestRecord,
  Insight,
  MarketplaceItem,
  MarketPrice,
  RentalEquipment,
  Task,
  Weather,
  YieldData,
  InventoryItem,
  FinancialRecord
} from "./types";

// User data - fetching from Firestore users collection
export async function getUser(userId: string = "farmer@farmertopia.com"): Promise<User | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        name: data.name || "Farmer",
        avatarUrl: data.image || data.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCk4wl1QwR6U0Trv1hTG7QralNDkeZ7b6BxmOOu4N03SvWdezUz6Aim8ASl_-11KNwaod6UsiD7Nkx_gJSzrLWglADEnpIps7LW4CUR_aEGHGp23teU3sF2LDpaem0kAzfbq8ADqcsoGtCEhVOHTHyw2Vbw0SsrEQKR0wjA8KRK4ybMmXvxVF4Jo_nqrTis1prbFwnr0HBaX3HAjNxAiJAGA0RzllagDsME4e1o-8gd4JSGfcer9VNmiDxAEqGcs7N-EEO573p67Vl",
        role: data.role || "owner",
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

async function getCollectionData<T>(collectionName: string, userId?: string, extraConstraints: QueryConstraint[] = []): Promise<T[]> {
  try {
    let q;
    const baseCollection = collection(db, collectionName);

    if (userId) {
      // Try fetching with the provided userId (usually email)
      const constraints = [where("userId", "==", userId), ...extraConstraints];
      q = query(baseCollection, ...constraints);
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      }

      // Fallback: If it's a demo account or specific email, try the legacy 'farmer' ID
      if (userId.includes("farmer")) {
        const fallbackQ = query(baseCollection, where("userId", "==", "farmer"), ...extraConstraints);
        const fallbackSnapshot = await getDocs(fallbackQ);
        if (!fallbackSnapshot.empty) {
          return fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        }
      }
    }

    // Final Fallback: Just get the first few items from the collection so the UI isn't empty
    const finalQ = query(baseCollection, limit(10), ...extraConstraints);
    const finalSnapshot = await getDocs(finalQ);
    return finalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));

  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

export async function getFields(userId: string): Promise<Field[]> {
  return getCollectionData<Field>("fields", userId);
}

export async function getTasks(userId: string): Promise<Task[]> {
  return getCollectionData<Task>("tasks", userId);
}

export async function getWeather(): Promise<Weather> {
  return {
    temp: 72,
    condition: "Partly Cloudy",
    humidity: 12,
    windSpeed: 8,
    alert: {
      type: "High Wind",
      message: "High Wind Warning",
    },
  };
}

export async function getMarketPrices(): Promise<MarketPrice[]> {
  // Exact data from reference image
  // Data source: Agmarknet.gov.in (As of Feb 14, 2026)
  return [
    {
      id: "1",
      commodity: "Wheat (Sona)",
      symbol: "WHEAT",
      price: 2489, // ₹24.89/kg -> ₹2489/qtl
      unit: "q",
      change: +2.4,
      trend: "up",
      exchange: "AGMARKNET",
      chartData: [2400, 2420, 2450, 2460, 2489],
      category: "Grains",
      location: "Bijapur Mandi",
      lastUpdated: "2026-02-14"
    },
    {
      id: "2",
      commodity: "Cotton (Unginned)",
      symbol: "COTTON",
      price: 7298, // ₹72.98/kg -> ₹7298/qtl
      unit: "q",
      change: -1.2,
      trend: "down",
      exchange: "AGMARKNET",
      chartData: [7400, 7350, 7320, 7300, 7298],
      category: "Fibers",
      location: "Adilabad Mandi",
      lastUpdated: "2026-02-14"
    },
    {
      id: "3",
      commodity: "Rice (Basmati)",
      symbol: "RICE",
      price: 3850, // Estimated based on trends
      unit: "q",
      change: +0.8,
      trend: "up",
      exchange: "AGMARKNET",
      chartData: [3800, 3810, 3820, 3840, 3850],
      category: "Grains",
      location: "Karnal Mandi",
      lastUpdated: "2026-02-14"
    },
    {
      id: "4",
      commodity: "Soybean",
      symbol: "SOY",
      price: 4450,
      unit: "q",
      change: +1.5,
      trend: "up",
      exchange: "AGMARKNET",
      chartData: [4300, 4350, 4400, 4420, 4450],
      category: "Oilseeds",
      location: "Indore Mandi",
      lastUpdated: "2026-02-14"
    },
    {
      id: "5",
      commodity: "Live Cattle",
      symbol: "CATTLE",
      price: 8500, // Per head estimate
      unit: "head",
      change: +3.2,
      trend: "up",
      exchange: "LOCAL",
      chartData: [8200, 8300, 8400, 8450, 8500],
      category: "Livestock",
      location: "Local Market",
      lastUpdated: "2026-02-14"
    },
    {
      id: "6",
      commodity: "Diesel",
      symbol: "DSL",
      price: 98.4, // Per Liter
      unit: "L",
      change: -0.5,
      trend: "down",
      exchange: "FUEL",
      chartData: [99, 98.8, 98.6, 98.5, 98.4],
      category: "Energy",
      location: "City Pump",
      lastUpdated: "2026-02-14"
    }
  ];
}

export async function getYieldHistory(userId: string): Promise<YieldData[]> {
  try {
    const yieldRef = collection(db, "yield_history");
    let q = query(yieldRef, where("userId", "==", userId), orderBy("year", "asc"));
    let snapshot = await getDocs(q);

    if (snapshot.empty && userId.includes("farmer")) {
      q = query(yieldRef, where("userId", "==", "farmer"), orderBy("year", "asc"));
      snapshot = await getDocs(q);
    }

    if (snapshot.empty) {
      snapshot = await getDocs(query(yieldRef, orderBy("year", "asc"), limit(10)));
    }

    return snapshot.docs.map(doc => doc.data() as YieldData);
  } catch (error) {
    console.error("Error fetching yield history:", error);
    return [];
  }
}

export async function getInsights(userId: string): Promise<Insight[]> {
  return getCollectionData<Insight>("insights", userId);
}

export async function getCattle(userId?: string): Promise<CattleListing[]> {
  return getCollectionData<CattleListing>("cattle", userId);
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return getCollectionData<CommunityPost>("community_posts", undefined, [orderBy("timestamp", "desc")]);
}

export async function getMarketplaceItems(userId?: string): Promise<MarketplaceItem[]> {
  const items = await getCollectionData<MarketplaceItem>("marketplace_items", userId);
  if (items.length > 0) return items;

  // Mock Data if Firestore is empty
  const mockItems: MarketplaceItem[] = [
    {
      id: 'mock1',
      name: 'Organic Tomato Seeds',
      category: 'Seeds',
      price: 450,
      originalPrice: 500,
      description: 'High-yield organic tomato seeds, resistant to common pests. Suitable for all seasons.',
      imageUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f3c47ea?q=80&w=800&auto=format&fit=crop',
      seller: 'Green Earth Farms',
      userId: 'seller1',
      rating: 4.5,
      reviewCount: 12,
      inStock: true
    },
    {
      id: 'mock2',
      name: 'Heavy Duty Shovel',
      category: 'Tools',
      price: 850,
      description: 'Ergonomic stainless steel shovel for digging and planting. Durable and rust-resistant.',
      imageUrl: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?q=80&w=800&auto=format&fit=crop', // Tools
      seller: 'AgriTools Pro',
      userId: 'seller2',
      rating: 4.8,
      reviewCount: 45,
      inStock: true
    },
    {
      id: 'mock3',
      name: 'NPK Fertilizer 19-19-19',
      category: 'Fertilizers',
      price: 1200,
      originalPrice: 1400,
      description: 'Balanced water-soluble fertilizer for all crops. Promotes vigorous growth.',
      imageUrl: 'https://images.unsplash.com/photo-1627242163519-db4d663cf03d?q=80&w=800&auto=format&fit=crop', // Fertilizer
      seller: 'CropCare Solutions',
      userId: 'seller3',
      rating: 4.2,
      reviewCount: 8,
      inStock: true
    },
    {
      id: 'mock4',
      name: 'Natural Neem Pesticide',
      category: 'Pesticides',
      price: 350,
      description: 'Eco-friendly neem oil based pesticide. Safe for organic farming.',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1678344170545-53cb7c01478c?q=80&w=800&auto=format&fit=crop', // Pesticide/Spray
      seller: 'Organic Defenders',
      userId: 'seller4',
      rating: 4.6,
      reviewCount: 22,
      inStock: true
    },
    {
      id: 'mock5',
      name: 'Drip Irrigation Kit',
      category: 'Equipment',
      price: 2500,
      originalPrice: 3000,
      description: 'Complete drip irrigation kit for small farms (1 acre). Water efficient.',
      imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=800&auto=format&fit=crop', // Irrigation
      seller: 'HydroSystems',
      userId: 'seller5',
      rating: 4.9,
      reviewCount: 15,
      inStock: true
    },
    {
      id: 'mock6',
      name: 'Hybrid Corn Seeds',
      category: 'Seeds',
      price: 600,
      description: 'Drought-tolerant hybrid corn seeds. High sweetness and yield.',
      imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800&auto=format&fit=crop', // Corn
      seller: 'SeedMaster',
      userId: 'seller6',
      rating: 4.3,
      reviewCount: 18,
      inStock: false
    }
  ];
  return mockItems;
}

export async function getRentalEquipment(userId?: string): Promise<RentalEquipment[]> {
  const equipment = await getCollectionData<RentalEquipment>("rental_equipment", userId);
  if (equipment.length > 0) return equipment;

  // Mock Data if Firestore is empty
  const mockEquipment: RentalEquipment[] = [
    {
      id: 'rent1',
      name: 'Mahindra 575 DI',
      type: 'Tractor',
      pricePerDay: 1200,
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1595829706594-c61f3225c8e1?q=80&w=800&auto=format&fit=crop', // Tractor
      location: 'Salem, TN',
      specs: '45 HP, 2WD',
      owner: 'Ramesh Kumaran',
      userId: 'owner1',
      rating: 4.8
    },
    {
      id: 'rent2',
      name: 'Kubota Harvester',
      type: 'Harvester',
      pricePerDay: 5000,
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=800&auto=format&fit=crop', // Harvester
      location: 'Erode, TN',
      specs: 'Combine Harvester, Rice/Wheat',
      owner: 'Siva Agro',
      userId: 'owner2',
      rating: 4.9
    },
    {
      id: 'rent3',
      name: 'Power Tiller',
      type: 'Tiller',
      pricePerDay: 800,
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c801e?q=80&w=800&auto=format&fit=crop', // Tiller (generic farm)
      location: 'Namakkal, TN',
      specs: '12 HP, Diesel',
      owner: 'Kumar Rentals',
      userId: 'owner3',
      rating: 4.5
    },
    {
      id: 'rent4',
      name: 'Drone Sprayer',
      type: 'Sprayer',
      pricePerDay: 2500,
      available: false,
      imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800&auto=format&fit=crop', // Drone
      location: 'Coimbatore, TN',
      specs: '10L Capacity, 15min flight',
      owner: 'TechFarm Solutions',
      userId: 'owner4',
      rating: 5.0
    }
  ];
  return mockEquipment;
}

export async function getHarvestRecords(userId: string): Promise<HarvestRecord[]> {
  return getCollectionData<HarvestRecord>("harvest_records", userId, [orderBy("date", "desc")]);
}

export async function getInventory(userId: string): Promise<InventoryItem[]> {
  return getCollectionData<InventoryItem>("inventory", userId);
}

export async function getFinanceRecords(userId: string): Promise<FinancialRecord[]> {
  return getCollectionData<FinancialRecord>("financial_records", userId, [orderBy("date", "desc")]);
}

export async function getFarmDetails(userId: string) {
  try {
    let userRef = doc(db, "users", userId);
    let userSnap = await getDoc(userRef);

    if (!userSnap.exists() && userId.includes("farmer")) {
      userRef = doc(db, "users", "farmer");
      userSnap = await getDoc(userRef);
    }

    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    return null;
  }
}
