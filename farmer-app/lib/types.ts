// Types.ts

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'owner' | 'worker';
}

export interface Field {
  id: string;
  name: string;
  crop: string;
  acres: number;
  status: 'Healthy' | 'Needs Attention' | 'Action Required' | 'Dry';
  growthStage: string;
  maturityPercentage: number;
  lastIrrigated: string; // ISO date
  moisturePercentage: number;
  coordinates: { lon: number; lat: number }[]; // Array of points for polygon
  imageUrl: string;
  userId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // e.g., "08:00"
  endTime?: string; // e.g., "10:00"
  duration: string; // e.g., "2 hrs"
  status: 'Completed' | 'In Progress' | 'Pending';
  type: 'Machinery' | 'Chemical' | 'Water' | 'Maintenance';
  priority?: 'High' | 'Medium' | 'Low';
  location?: string;
  workerAvatars?: string[];
  userId: string;
  assignedTo?: string; // worker email
}

export interface Weather {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number; // mph
  alert?: {
    type: 'High Wind' | 'Frost' | 'Heat';
    message: string;
  };
}

export interface MarketPrice {
  id: string;
  commodity: string;
  symbol: string;
  price: number;
  unit: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  exchange: string;
  chartData: number[]; // Simple array for sparkline
}

export interface YieldData {
  year: number;
  yield: number; // bushels per acre
  total: number; // total bushels
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  actionLabel?: string;
}

// Cattle
export interface CattleListing {
  id: string;
  name: string;
  breed: string;
  category: 'Dairy' | 'Beef' | 'Dual Purpose';
  age: string;
  weight: number; // kg
  price: number;
  healthStatus: 'Healthy' | 'Vaccinated' | 'Under Treatment';
  seller: string;
  userId: string;
  location: string;
  imageUrl: string;
}

// Community
export interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string; // ISO date
  likes: number;
  comments: number;
  tags: string[];
  userId: string;
}

// Marketplace
export interface MarketplaceItem {
  id: string;
  name: string;
  category: 'Seeds' | 'Tools' | 'Fertilizers' | 'Equipment' | 'Pesticides';
  price: number;
  originalPrice?: number;
  seller: string;
  userId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  description: string;
  imageUrl: string;
}

// Rentals
export interface RentalEquipment {
  id: string;
  name: string;
  type: 'Tractor' | 'Harvester' | 'Tiller' | 'Sprayer' | 'Seeder';
  pricePerDay: number;
  available: boolean;
  rating: number;
  location: string;
  specs: string;
  owner: string;
  userId: string;
  imageUrl: string;
}

export interface HarvestRecord {
  id: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  date: string; // ISO date
  time: string; // HH:mm
  weightTons: number;
  moisturePercent: number;
  qualityGrade: 'A' | 'B' | 'C';
  notes?: string;
  userId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizers' | 'Chemicals' | 'Fuel' | 'Tools';
  quantity: number;
  unit: string;
  minThreshold: number;
  userId: string;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  fieldId?: string;
  userId: string;
}
