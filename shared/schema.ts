import { pgTable, text, serial, integer, boolean, timestamp, date, time, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  howDoYouFeel: text("how_do_you_feel"),
  achievements: text("achievements"),
  learnings: text("learnings"),
  gratefulFor: text("grateful_for"),
  challenges: text("challenges"),
  somethingFunny: text("something_funny"),
  generalNotes: text("general_notes"),
  moodRating: integer("mood_rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userDateIdx: uniqueIndex("user_date_idx").on(table.userId, table.entryDate),
}));

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  theme: text("theme").default("light").notNull(),
  notificationEnabled: boolean("notification_enabled").default(false).notNull(),
  notificationTime: time("notification_time").default("20:00:00"),
  timezone: text("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userEndpointIdx: uniqueIndex("user_endpoint_idx").on(table.userId, table.endpoint),
}));

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertJournalEntrySchema = createInsertSchema(journalEntries, {
  userId: z.number(),
  entryDate: z.string(),
  moodRating: z.number().min(1).max(5).nullable().optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserSettingsSchema = createInsertSchema(userSettings, {
  userId: z.number(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions, {
  userId: z.number(),
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type User = typeof users.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
