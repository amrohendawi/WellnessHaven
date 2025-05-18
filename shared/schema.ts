import { pgTable, text, serial, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Service groups/categories
export const serviceGroups = pgTable('service_groups', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  nameDe: text('name_de').notNull(),
  nameTr: text('name_tr').notNull(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  descriptionDe: text('description_de'),
  descriptionTr: text('description_tr'),
  imageUrl: text('image_url'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// User accounts (for admin access)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Services offered by Dubai Rose
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // This is the slug of the service group
  groupId: integer('group_id').references(() => serviceGroups.id),
  nameEn: text('name_en').notNull(),
  nameAr: text('name_ar').notNull(),
  nameDe: text('name_de').notNull(),
  nameTr: text('name_tr').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionAr: text('description_ar').notNull(),
  descriptionDe: text('description_de').notNull(),
  descriptionTr: text('description_tr').notNull(),
  longDescriptionEn: text('long_description_en'),
  longDescriptionAr: text('long_description_ar'),
  longDescriptionDe: text('long_description_de'),
  longDescriptionTr: text('long_description_tr'),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url').notNull(),
  imageLarge: text('image_large'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// VIP Memberships
export const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  membershipNumber: text('membership_number').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  type: text('type').notNull(), // 'gold' or 'silver'
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

// Bookings/Appointments
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  service: integer('service').notNull(), // Using service column name as in the database
  date: text('date').notNull(),
  time: text('time').notNull(),
  vipNumber: text('vip_number'),
  status: text('status').notNull().default('pending'), // pending, confirmed, completed, cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

// Contact form submissions
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Blocked time slots for availability management
export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Insert schemas
export const insertServiceGroupSchema = createInsertSchema(serviceGroups).pick({
  slug: true,
  nameEn: true,
  nameAr: true,
  nameDe: true,
  nameTr: true,
  descriptionEn: true,
  descriptionAr: true,
  descriptionDe: true,
  descriptionTr: true,
  imageUrl: true,
  displayOrder: true,
  isActive: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  slug: true,
  category: true,
  nameEn: true,
  nameAr: true,
  nameDe: true,
  nameTr: true,
  descriptionEn: true,
  descriptionAr: true,
  descriptionDe: true,
  descriptionTr: true,
  longDescriptionEn: true,
  longDescriptionAr: true,
  longDescriptionDe: true,
  longDescriptionTr: true,
  duration: true,
  price: true,
  imageUrl: true,
  imageLarge: true,
  isActive: true,
});

export const insertMembershipSchema = createInsertSchema(memberships).pick({
  membershipNumber: true,
  name: true,
  email: true,
  phone: true,
  type: true,
  expiresAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  name: true,
  email: true,
  phone: true,
  service: true,
  date: true,
  time: true,
  vipNumber: true,
  status: true,
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  email: true,
  phone: true,
  message: true,
});

export const insertBlockedTimeSlotSchema = createInsertSchema(blockedTimeSlots).pick({
  date: true,
  time: true,
});

// Types
export type InsertServiceGroup = z.infer<typeof insertServiceGroupSchema>;
export type ServiceGroup = typeof serviceGroups.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertBlockedTimeSlot = z.infer<typeof insertBlockedTimeSlotSchema>;
export type BlockedTimeSlot = typeof blockedTimeSlots.$inferSelect;

// Admin Service Management Types and Schemas
// Interface for service data as used in the admin panel forms and API responses
export interface AdminService {
  id: number;
  slug: string;
  category: string; // This is the slug of the service group
  groupId: number | null;
  nameEn: string;
  nameAr: string;
  nameDe: string;
  nameTr: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionDe: string;
  descriptionTr: string;
  longDescriptionEn: string | null;
  longDescriptionAr: string | null;
  longDescriptionDe: string | null;
  longDescriptionTr: string | null;
  duration: number;
  price: number;
  imageUrl: string;
  imageLarge: string | null;
  isActive: boolean;
  createdAt: string; // Assuming API returns it as a string for admin display
}

// Zod schema for validating the admin service form
export const AdminServiceFormSchema = z.object({
  slug: z.string().min(2, 'Slug must be at least 2 characters').toLowerCase(),
  category: z.string().min(1, 'Category is required'),
  nameEn: z.string().min(2, 'Name (English) is required'),
  nameAr: z.string().min(2, 'Name (Arabic) is required'),
  nameDe: z.string().min(2, 'Name (German) is required'),
  nameTr: z.string().min(2, 'Name (Turkish) is required'),
  descriptionEn: z.string().min(10, 'Description (English) must be at least 10 characters'),
  descriptionAr: z.string().min(10, 'Description (Arabic) must be at least 10 characters'),
  descriptionDe: z.string().min(10, 'Description (German) must be at least 10 characters'),
  descriptionTr: z.string().min(10, 'Description (Turkish) must be at least 10 characters'),
  longDescriptionEn: z.string().optional(),
  longDescriptionAr: z.string().optional(),
  longDescriptionDe: z.string().optional(),
  longDescriptionTr: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price must be a positive number'),
  imageUrl: z.string().url('Please enter a valid URL'),
  imageLarge: z.string().url('Please enter a valid URL').optional().or(z.literal('')).nullable(), // Allow empty string or null
  isActive: z.boolean().default(true),
  groupId: z.number().optional().nullable(),
});

// Type inferred from the AdminServiceFormSchema
export type AdminServiceFormValues = z.infer<typeof AdminServiceFormSchema>;

// Default values for the admin service form
export const defaultAdminServiceFormValues: Partial<AdminServiceFormValues> = {
  slug: '',
  category: '',
  nameEn: '',
  nameAr: '',
  nameDe: '',
  nameTr: '',
  descriptionEn: '',
  descriptionAr: '',
  descriptionDe: '',
  descriptionTr: '',
  longDescriptionEn: '',
  longDescriptionAr: '',
  longDescriptionDe: '',
  longDescriptionTr: '',
  duration: 30,
  price: 0,
  imageUrl: '',
  imageLarge: '',
  isActive: true,
  groupId: null,
};

// Service group representation for frontend
export interface ServiceGroupDisplay {
  id: number;
  slug: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  imageUrl?: string;
  displayOrder: number;
}

// Service representation for frontend
export interface ServiceDisplay {
  id: number;
  slug: string;
  category: string;
  groupId?: number;
  name: Record<string, string>;
  description: Record<string, string>;
  longDescription?: Record<string, string>;
  duration: number;
  price: number;
  imageUrl: string;
  imageLarge?: string;
  benefits?: Array<Record<string, string>>;
  includes?: Array<Record<string, string>>;
}
