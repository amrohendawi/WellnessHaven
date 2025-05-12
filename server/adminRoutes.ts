import { Router, Request, Response } from 'express';
import { storage } from './storage';

const router = Router();

// Get all bookings
router.get('/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await storage.getAllBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get booking by ID
router.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const booking = await storage.getBookingById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
});

// Update booking
router.put('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await storage.updateBooking(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Blocked time slots management
router.get('/blocked-slots', async (_req: Request, res: Response) => {
  try {
    const slots = await storage.getBlockedTimeSlots();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blocked slots' });
  }
});

router.post('/blocked-slots', async (req: Request, res: Response) => {
  try {
    const { date, time } = req.body;
    const newSlot = await storage.createBlockedTimeSlot({ date, time });
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create blocked slot' });
  }
});

router.delete('/blocked-slots/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteBlockedTimeSlot(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blocked slot' });
  }
});

// Services list management
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const services = await storage.getServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Create a new service
router.post('/services', async (req: Request, res: Response) => {
  try {
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// Update an existing service
router.put('/services/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await storage.updateService(id, req.body);
    if (!updated) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// Delete a service
router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteService(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

// Dashboard summary
router.get('/dashboard-summary', async (_req: Request, res: Response) => {
  try {
    const bookings = await storage.getAllBookings();
    const services = await storage.getServices();
    const blockedSlots = await storage.getBlockedTimeSlots();
    const totalBookings = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;

    res.status(200).json({
      totalBookings,
      confirmed,
      pending,
      servicesCount: services.length,
      blockedSlotsCount: blockedSlots.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});

export default router;
