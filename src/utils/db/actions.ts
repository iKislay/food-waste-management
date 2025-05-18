'use server'

import { promises as fs } from 'fs';
import path from 'path';

// Define interfaces for our data structures
interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

interface Report {
  id: number;
  userId: number;
  location: string;
  wasteType: string;
  amount: string;
  imageUrl?: string;
  verificationResult?: any;
  status: string;
  createdAt: string;
  collectorId?: number;
}

interface Reward {
  id: number;
  userId: number;
  name: string;
  collectionInfo: string;
  points: number;
  level: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  cost?: number;
}

interface Notification {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Transaction {
  id: number;
  userId: number;
  type: 'earned_report' | 'earned_collect' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

interface CollectedWaste {
  id: number;
  reportId: number;
  collectorId: number;
  collectionDate: string;
  status?: string;
  notes?: string;
  verificationResult?: any;
}

interface DatabaseSchema {
  users: User[];
  reports: Report[];
  rewards: Reward[];
  notifications: Notification[];
  transactions: Transaction[];
  collectedWastes: CollectedWaste[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'data.json'); 

// Helper functions for reading and writing JSON
async function readDB(): Promise<DatabaseSchema | null> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    console.error("Error reading database:", error);
    return null;
  }
}

async function writeDB(data: any) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing database:", error);
    return false;
  }
}

// User functions
export async function createUser(email: string, name: string): Promise<User | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newUser = {
      id: db.users.length + 1,
      email,
      name,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    return db.users.find(user => user.email === email) || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function createReport(
  userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any
): Promise<Report | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newReport = {
      id: db.reports.length + 1,
      userId,
      location,
      wasteType,
      amount,
      imageUrl,
      verificationResult,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.reports.push(newReport);

    // Add rewards
    const pointsEarned = 10;
    await updateRewardPoints(userId, pointsEarned);
    
    // Add transaction
    await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

    // Add notification
    await createNotification(
      userId,
      `You've earned ${pointsEarned} points for reporting waste!`,
      'reward'
    );

    await writeDB(db);
    return newReport;
  } catch (error) {
    console.error("Error creating report:", error);
    return null;
  }
}

export async function getReportsByUserId(userId: number): Promise<Report[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.reports.filter(report => report.userId === userId);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

export async function getOrCreateReward(userId: number): Promise<Reward | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    if (!db.rewards) {
      db.rewards = [];
    }

    let reward = db.rewards.find(r => r.userId === userId);
    
    if (!reward) {
      reward = {
        id: db.rewards.length + 1,
        userId,
        name: 'Default Reward',
        collectionInfo: 'Default Collection Info',
        points: 0,
        level: 1,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.rewards.push(reward);
      await writeDB(db);
    }

    return reward;
  } catch (error) {
    console.error("Error getting or creating reward:", error);
    return null;
  }
}

export async function updateRewardPoints(userId: number, pointsToAdd: number): Promise<Reward | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const reward = await getOrCreateReward(userId);
    if (!reward) return null;

    reward.points += pointsToAdd;
    reward.updatedAt = new Date().toISOString();

    await writeDB(db);
    return reward;
  } catch (error) {
    console.error("Error updating reward points:", error);
    return null;
  }
}

export async function createCollectedWaste(
  reportId: number, 
  collectorId: number, 
  notes?: string
): Promise<CollectedWaste | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newCollectedWaste = {
      id: db.collectedWastes.length + 1,
      reportId,
      collectorId,
      collectionDate: new Date().toISOString(),
      notes
    };

    db.collectedWastes.push(newCollectedWaste);
    await writeDB(db);
    return newCollectedWaste;
  } catch (error) {
    console.error("Error creating collected waste:", error);
    return null;
  }
}

export async function getCollectedWastesByCollector(collectorId: number): Promise<CollectedWaste[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.collectedWastes.filter(waste => waste.collectorId === collectorId);
  } catch (error) {
    console.error("Error fetching collected wastes:", error);
    return [];
  }
}

export async function createNotification(
  userId: number, 
  message: string, 
  type: string
): Promise<Notification | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newNotification = {
      id: db.notifications.length + 1,
      userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    db.notifications.push(newNotification);
    await writeDB(db);
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.notifications.filter(notification => notification.userId === userId && !notification.isRead);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return;

    const notification = db.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      await writeDB(db);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

export async function getPendingReports(): Promise<Report[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.reports.filter(report => report.status === "pending");
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return [];
  }
}

export async function updateReportStatus(reportId: number, status: string): Promise<Report | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const report = db.reports.find(r => r.id === reportId);
    if (!report) return null;
    
    report.status = status;
    await writeDB(db);
    return report;
  } catch (error) {
    console.error("Error updating report status:", error);
    return null;
  }
}

export async function getRecentReports(limit: number = 10): Promise<Report[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent reports:", error);
    return [];
  }
}

export async function getWasteCollectionTasks(limit: number = 20): Promise<(Report & { date: string })[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.reports
      .slice(0, limit)
      .map(task => ({
        ...task,
        date: task.createdAt.split('T')[0], // Format date as YYYY-MM-DD
      }));
  } catch (error) {
    console.error("Error fetching waste collection tasks:", error);
    return [];
  }
}

export async function saveReward(userId: number, amount: number): Promise<Reward | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newReward = {
      id: db.rewards.length + 1,
      userId,
      name: 'Waste Collection Reward',
      collectionInfo: 'Points earned from waste collection',
      points: amount,
      level: 1,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.rewards.push(newReward);
    await writeDB(db);

    // Create a transaction for this reward
    await createTransaction(userId, 'earned_collect', amount, 'Points earned for collecting waste');

    return newReward;
  } catch (error) {
    console.error("Error saving reward:", error);
    throw error;
  }
}

export async function saveCollectedWaste(
  reportId: number, 
  collectorId: number, 
  verificationResult: any
): Promise<CollectedWaste | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newCollectedWaste = {
      id: db.collectedWastes.length + 1,
      reportId,
      collectorId,
      collectionDate: new Date().toISOString(),
      status: 'verified',
      verificationResult
    };

    db.collectedWastes.push(newCollectedWaste);
    await writeDB(db);
    return newCollectedWaste;
  } catch (error) {
    console.error("Error saving collected waste:", error);
    throw error;
  }
}

export async function updateTaskStatus(
  reportId: number, 
  newStatus: string, 
  collectorId?: number
): Promise<Report | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const report = db.reports.find(r => r.id === reportId);
    if (!report) return null;
    
    report.status = newStatus;
    if (collectorId !== undefined) {
      report.collectorId = collectorId;
    }
    await writeDB(db);
    return report;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function getAllRewards(): Promise<(Reward & { userName: string })[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    return db.rewards
      .sort((a, b) => b.points - a.points)
      .map(reward => ({
        ...reward,
        userName: db.users.find(user => user.id === reward.userId)?.name || 'Unknown'
      }));
  } catch (error) {
    console.error("Error fetching all rewards:", error);
    return [];
  }
}

export async function getRewardTransactions(userId: number): Promise<(Transaction & { date: string })[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    const transactions = db.transactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return transactions.map(t => ({
      ...t,
      date: t.date.split('T')[0], // Format date as YYYY-MM-DD
    }));
  } catch (error) {
    console.error("Error fetching reward transactions:", error);
    return [];
  }
}

export async function getAvailableRewards(userId: number): Promise<(Reward & { cost: number })[]> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return [];

    // Get user's total points
    const userTransactions = await getRewardTransactions(userId);
    const userPoints = userTransactions.reduce((total, transaction) => {
      return transaction.type.startsWith('earned') ? total + transaction.amount : total - transaction.amount;
    }, 0);

    // Get available rewards from the database
    const dbRewards = db.rewards.filter(reward => reward.isAvailable);

    // Combine user points and database rewards
    const allRewards = [
      {
        id: 0, // Use a special ID for user's points`
        userId: 0,
        name: "Your Points",
        cost: userPoints,
        points: userPoints,
        level: 1,
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: "redeem your earned points",
        collectionInfo: "Points earned from reporting and collecting waste"
      },
      ...dbRewards.map(reward => ({
        ...reward,
        cost: reward.cost || reward.points // Use existing cost or fallback to points
      }))
    ];

    return allRewards;
  } catch (error) {
    console.error("Error fetching available rewards:", error);
    return [];
  }
}

export async function createTransaction(
  userId: number, 
  type: 'earned_report' | 'earned_collect' | 'redeemed', 
  amount: number, 
  description: string
): Promise<Transaction | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const newTransaction = {
      id: db.transactions.length + 1,
      userId,
      type,
      amount,
      description,
      date: new Date().toISOString()
    };

    db.transactions.push(newTransaction);
    await writeDB(db);
    return newTransaction;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function redeemReward(userId: number, rewardId: number): Promise<Reward | null> {
  'use server'
  try {
    const db = await readDB();
    if (!db) return null;

    const userReward = await getOrCreateReward(userId) as any;
    
    if (rewardId === 0) {
      // redeem all points
      userReward.points = 0;
      userReward.updatedAt = new Date().toISOString();
      await writeDB(db);

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', userReward.points, `redeemed all points: ${userReward.points}`);

      return userReward;
    } else {
      // Existing logic for redeeming specific rewards
      const availableReward = db.rewards.find(r => r.id === rewardId);

      if (!userReward || !availableReward || userReward.points < availableReward.points) {
        throw new Error("Insufficient points or invalid reward");
      }

      userReward.points -= availableReward.points;
      userReward.updatedAt = new Date().toISOString();
      await writeDB(db);

      // Create a transaction for this redemption
      await createTransaction(userId, 'redeemed', availableReward.points, `redeemed: ${availableReward.name}`);

      return userReward;
    }
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function getUserBalance(userId: number): Promise<number> {
  'use server'
  const transactions = await getRewardTransactions(userId);
  const balance = transactions.reduce((acc, transaction) => {
    return transaction.type.startsWith('earned') ? acc + transaction.amount : acc - transaction.amount
  }, 0);
  return Math.max(balance, 0); // Ensure balance is never negative
}

