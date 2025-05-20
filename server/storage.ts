import {
  users,
  type User,
  type InsertUser,
  services,
  type Service,
  type InsertService,
  bookings,
  type Booking,
  type InsertBooking,
  memberships,
  type Membership,
  serviceGroups,
  type ServiceGroup,
  blockedTimeSlots,
  type BlockedTimeSlot,
  type InsertBlockedTimeSlot,
} from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

// modify the interface with any CRUD methods you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getServices(): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  getServiceGroups(): Promise<ServiceGroup[]>;
  getServiceGroupBySlug(slug: string): Promise<ServiceGroup | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getMembershipByNumber(membershipNumber: string): Promise<Membership | undefined>;
  // Booking retrieval for admin
  getAllBookings(): Promise<Booking[]>;
  // Blocked slots management
  getBlockedTimeSlots(): Promise<BlockedTimeSlot[]>;
  createBlockedTimeSlot(slot: InsertBlockedTimeSlot): Promise<BlockedTimeSlot>;
  deleteBlockedTimeSlot(id: number): Promise<void>;
  // Service management for admin
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;
  // Service group management for admin
  createServiceGroup(serviceGroup: Partial<ServiceGroup>): Promise<ServiceGroup>;
  updateServiceGroup(id: number, serviceGroup: Partial<ServiceGroup>): Promise<ServiceGroup | undefined>;
  deleteServiceGroup(id: number): Promise<void>;
  getServiceGroupById(id: number): Promise<ServiceGroup | undefined>;
  getBookingById(id: number): Promise<Booking | undefined>;
  updateBooking(
    id: number,
    update: Partial<InsertBooking> & { status?: string }
  ): Promise<Booking | undefined>;

}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
      })
      .returning();
    return user;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service || undefined;
  }

  async getServiceGroups(): Promise<ServiceGroup[]> {
    return await db.select().from(serviceGroups);
  }

  async getServiceGroupBySlug(slug: string): Promise<ServiceGroup | undefined> {
    const [group] = await db.select().from(serviceGroups).where(eq(serviceGroups.slug, slug));
    return group || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getMembershipByNumber(membershipNumber: string): Promise<Membership | undefined> {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(eq(memberships.membershipNumber, membershipNumber));
    return membership || undefined;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBlockedTimeSlots(): Promise<BlockedTimeSlot[]> {
    return await db.select().from(blockedTimeSlots);
  }

  async createBlockedTimeSlot(slot: InsertBlockedTimeSlot): Promise<BlockedTimeSlot> {
    const [newSlot] = await db.insert(blockedTimeSlots).values(slot).returning();
    return newSlot;
  }

  async deleteBlockedTimeSlot(id: number): Promise<void> {
    await db.delete(blockedTimeSlots).where(eq(blockedTimeSlots.id, id));
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async updateBooking(
    id: number,
    update: Partial<InsertBooking> & { status?: string }
  ): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings).set(update).where(eq(bookings.id, id)).returning();
    return booking;
  }

  async getServiceGroupById(id: number): Promise<ServiceGroup | undefined> {
    const [group] = await db.select().from(serviceGroups).where(eq(serviceGroups.id, id));
    return group || undefined;
  }

  async createServiceGroup(group: Partial<ServiceGroup>): Promise<ServiceGroup> {
    const [newGroup] = await db.insert(serviceGroups).values(group).returning();
    return newGroup;
  }

  async updateServiceGroup(id: number, group: Partial<ServiceGroup>): Promise<ServiceGroup | undefined> {
    const [updated] = await db.update(serviceGroups).set(group).where(eq(serviceGroups.id, id)).returning();
    return updated;
  }

  async deleteServiceGroup(id: number): Promise<void> {
    await db.delete(serviceGroups).where(eq(serviceGroups.id, id));
  }
}

export const storage = new DatabaseStorage();
