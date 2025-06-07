-- Migration: Remove VIP number column from bookings table
-- This migration removes the vip_number column from the bookings table
-- as the system no longer uses VIP numbers and instead relies on customer full names

ALTER TABLE bookings DROP COLUMN IF EXISTS vip_number;
