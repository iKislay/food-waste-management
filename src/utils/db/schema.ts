export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface Report {
  id: number;
  userId: number;
  location: string;
  foodType: string;
  quantity: string;
  imageUrl?: string;
  verificationResult?: any;
  status: string;
  expiryTime: string;
  createdAt: string;
  collectorId?: number;
}

export interface Reward {
  id: number;
  userId: number;
  points: number;
  level: number;
  createdAt: string;
  updatedAt: string;
  isAvailable: boolean;
  description?: string;
  name: string;
  collectionInfo: string;
}

export interface CollectedWaste {
  id: number;
  reportId: number;
  collectorId: number;
  collectionDate: string;
  status: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}