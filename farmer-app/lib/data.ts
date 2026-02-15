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
  const basePrices: MarketPrice[] = [
    { id: "m1", commodity: "Rice (Basmati)", symbol: "ZR", price: 4200, unit: "q", change: 0.50, trend: "up", exchange: "NCDEX", chartData: [4150, 4160, 4180, 4190, 4200] },
    { id: "m2", commodity: "Wheat", symbol: "ZW", price: 2125, unit: "q", change: -0.25, trend: "down", exchange: "NCDEX", chartData: [2140, 2135, 2130, 2128, 2125] },
    { id: "m3", commodity: "Cotton", symbol: "CT", price: 6500, unit: "q", change: 1.20, trend: "up", exchange: "MCX", chartData: [6300, 6350, 6420, 6460, 6500] },
    { id: "m4", commodity: "Sugarcane", symbol: "SUG", price: 315, unit: "q", change: 0.00, trend: "neutral", exchange: "State Mandi", chartData: [315, 315, 315, 315, 315] },
    { id: "m5", commodity: "Turmeric", symbol: "TMC", price: 8450, unit: "q", change: 2.10, trend: "up", exchange: "NCDEX", chartData: [8100, 8200, 8350, 8400, 8450] },
    { id: "m6", commodity: "Coffee (Robusta)", symbol: "KC", price: 165, unit: "kg", change: -1.15, trend: "down", exchange: "ICE/Local", chartData: [170, 168, 167, 166, 165] },
    { id: "m7", commodity: "Soybean", symbol: "ZS", price: 4800, unit: "q", change: 0.45, trend: "up", exchange: "NCDEX", chartData: [4700, 4720, 4750, 4780, 4800] },
  ];
  return basePrices.map(p => {
    const jitter = (Math.random() - 0.5) * 0.05;
    return { ...p, price: Number((p.price * (1 + jitter)).toFixed(2)), change: Number((p.change + jitter * 10).toFixed(2)) };
  });
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
  return getCollectionData<MarketplaceItem>("marketplace_items", userId);
}

export async function getRentalEquipment(userId?: string): Promise<RentalEquipment[]> {
  return getCollectionData<RentalEquipment>("rental_equipment", userId);
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
