import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import {
  users,
  journalEntries,
  userSettings,
  pushSubscriptions,
  type User,
  type InsertUser,
  type JournalEntry,
  type InsertJournalEntry,
  type UserSettings,
  type InsertUserSettings,
  type PushSubscription,
  type InsertPushSubscription,
} from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  getJournalEntry(userId: number, entryDate: string): Promise<JournalEntry | undefined>;
  getJournalEntries(userId: number, startDate?: string, endDate?: string): Promise<JournalEntry[]>;
  getEntriesWithDates(userId: number): Promise<{ entryDate: string; moodRating: number | null }[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<void>;

  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;

  getPushSubscription(userId: number, endpoint: string): Promise<PushSubscription | undefined>;
  getPushSubscriptionsByUserId(userId: number): Promise<PushSubscription[]>;
  getAllPushSubscriptions(): Promise<PushSubscription[]>;
  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  deletePushSubscription(userId: number, endpoint: string): Promise<void>;
  deleteUser(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getJournalEntry(userId: number, entryDate: string): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.userId, userId), eq(journalEntries.entryDate, entryDate)));
    return entry;
  }

  async getJournalEntries(userId: number, startDate?: string, endDate?: string): Promise<JournalEntry[]> {
    let query = db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
    
    if (startDate && endDate) {
      query = db.select().from(journalEntries).where(
        and(
          eq(journalEntries.userId, userId),
          gte(journalEntries.entryDate, startDate),
          lte(journalEntries.entryDate, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(journalEntries.entryDate));
  }

  async getEntriesWithDates(userId: number): Promise<{ entryDate: string; moodRating: number | null }[]> {
    const entries = await db
      .select({ entryDate: journalEntries.entryDate, moodRating: journalEntries.moodRating })
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId));
    return entries;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [newEntry] = await db.insert(journalEntries).values(entry).returning();
    return newEntry;
  }

  async updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updated] = await db
      .update(journalEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated;
  }

  async deleteJournalEntry(id: number): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db.insert(userSettings).values(settings).returning();
    return newSettings;
  }

  async updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined> {
    const [updated] = await db
      .update(userSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated;
  }

  async getPushSubscription(userId: number, endpoint: string): Promise<PushSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
    return subscription;
  }

  async getPushSubscriptionsByUserId(userId: number): Promise<PushSubscription[]> {
    return await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  }

  async getAllPushSubscriptions(): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions);
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const [newSubscription] = await db.insert(pushSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async deletePushSubscription(userId: number, endpoint: string): Promise<void> {
    await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
  }

  async deleteUser(userId: number): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
      await tx.delete(journalEntries).where(eq(journalEntries.userId, userId));
      await tx.delete(userSettings).where(eq(userSettings.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
  }
}

export const storage = new DatabaseStorage();
