// A local copy of the schema file for serverless functions
import { pgTable, serial, varchar, text, boolean, date, time, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 100 }),
  groupId: integer("group_id").notNull(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  nameDe: varchar("name_de", { length: 100 }),
  nameTr: varchar("name_tr", { length: 100 }),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionDe: text("description_de"),
  descriptionTr: text("description_tr"),
  longDescriptionEn: text("long_description_en"),
  longDescriptionAr: text("long_description_ar"),
  longDescriptionDe: text("long_description_de"),
  longDescriptionTr: text("long_description_tr"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
  imageUrl: text("image_url"),
  imageLarge: text("image_large"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    groupIdIdx: index("service_group_id_idx").on(table.groupId),
    slugIdx: uniqueIndex("service_slug_idx").on(table.slug),
  };
});

// Service groups table
export const serviceGroups = pgTable("service_groups", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  nameDe: varchar("name_de", { length: 100 }),
  nameTr: varchar("name_tr", { length: 100 }),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  descriptionDe: text("description_de"),
  descriptionTr: text("description_tr"),
  icon: varchar("icon", { length: 50 }),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    slugIdx: uniqueIndex("service_group_slug_idx").on(table.slug),
  };
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  service: integer("service_id").notNull(),
  date: date("date").notNull(),
  time: time("time", { precision: 0 }).notNull(),
  vipNumber: varchar("vip_number", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => {
  return {
    serviceIdIdx: index("booking_service_id_idx").on(table.service),
    emailIdx: index("booking_email_idx").on(table.email),
  };
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: text("message").notNull(),
  isResponded: boolean("is_responded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Memberships table
export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  tier: varchar("tier", { length: 50 }).notNull().unique(), // bronze, silver, gold, platinum
  nameEn: varchar("name_en", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }),
  nameDe: varchar("name_de", { length: 100 }),
  nameTr: varchar("name_tr", { length: 100 }),
  descriptionEn: text("description_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionDe: text("description_de"),
  descriptionTr: text("description_tr"),
  benefitsEn: text("benefits_en"), // pipe-separated list of benefits
  benefitsAr: text("benefits_ar"),
  benefitsDe: text("benefits_de"),
  benefitsTr: text("benefits_tr"),
  price: integer("price").notNull(), // in cents
  discountPercentage: integer("discount_percentage").default(0), // percentage discount on services
  validity: integer("validity").notNull(), // validity in days
  color: varchar("color", { length: 20 }).default("#000000"), // hex color code for UI display
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// TypeScript types for frontend use
export interface ServiceDisplay {
  id: number;
  slug: string;
  category?: string;
  groupId: number;
  name: {
    en: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  description: {
    en: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  longDescription?: {
    en?: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  duration: number;
  price: number;
  imageUrl?: string;
  imageLarge?: string;
}

export interface ServiceGroupDisplay {
  id: number;
  slug: string;
  name: {
    en: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  description?: {
    en?: string;
    ar?: string;
    de?: string;
    tr?: string;
  };
  icon?: string;
  displayOrder: number;
}