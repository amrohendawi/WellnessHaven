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

// Service Groups management
// Get all service groups
router.get('/service-groups', async (_req: Request, res: Response) => {
  try {
    const groups = await storage.getServiceGroups();
    const transformedGroups = groups.map(group => ({
      id: group.id,
      slug: group.slug,
      name: {
        en: group.nameEn,
        ar: group.nameAr || '',
        de: group.nameDe || '',
        tr: group.nameTr || '',
      },
      description: {
        en: group.descriptionEn || '',
        ar: group.descriptionAr || '',
        de: group.descriptionDe || '',
        tr: group.descriptionTr || '',
      },
      displayOrder: group.displayOrder || 0,
    }));
    res.status(200).json(transformedGroups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch service groups' });
  }
});

// Get a specific service group
router.get('/service-groups/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const group = await storage.getServiceGroupById(id);
    if (!group) return res.status(404).json({ message: 'Service group not found' });
    
    const transformedGroup = {
      id: group.id,
      slug: group.slug,
      name: {
        en: group.nameEn,
        ar: group.nameAr || '',
        de: group.nameDe || '',
        tr: group.nameTr || '',
      },
      description: {
        en: group.descriptionEn || '',
        ar: group.descriptionAr || '',
        de: group.descriptionDe || '',
        tr: group.descriptionTr || '',
      },
      displayOrder: group.displayOrder || 0,
    };
    res.status(200).json(transformedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch service group' });
  }
});

// Create a new service group
router.post('/service-groups', async (req: Request, res: Response) => {
  try {
    const { slug, name, description, displayOrder } = req.body;
    
    const serviceGroup = {
      slug,
      nameEn: name?.en || '',
      nameAr: name?.ar || '',
      nameDe: name?.de || '',
      nameTr: name?.tr || '',
      descriptionEn: description?.en || '',
      descriptionAr: description?.ar || '',
      descriptionDe: description?.de || '',
      descriptionTr: description?.tr || '',
      displayOrder: displayOrder || 0,
    };
    
    const newGroup = await storage.createServiceGroup(serviceGroup);
    
    const transformedGroup = {
      id: newGroup.id,
      slug: newGroup.slug,
      name: {
        en: newGroup.nameEn,
        ar: newGroup.nameAr || '',
        de: newGroup.nameDe || '',
        tr: newGroup.nameTr || '',
      },
      description: {
        en: newGroup.descriptionEn || '',
        ar: newGroup.descriptionAr || '',
        de: newGroup.descriptionDe || '',
        tr: newGroup.descriptionTr || '',
      },
      displayOrder: newGroup.displayOrder || 0,
    };
    
    res.status(201).json(transformedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create service group' });
  }
});

// Update an existing service group
router.put('/service-groups/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { slug, name, description, displayOrder } = req.body;
    
    const serviceGroup: any = {};
    if (slug) serviceGroup.slug = slug;
    if (name?.en) serviceGroup.nameEn = name.en;
    if (name?.ar) serviceGroup.nameAr = name.ar;
    if (name?.de) serviceGroup.nameDe = name.de;
    if (name?.tr) serviceGroup.nameTr = name.tr;
    if (description?.en) serviceGroup.descriptionEn = description.en;
    if (description?.ar) serviceGroup.descriptionAr = description.ar;
    if (description?.de) serviceGroup.descriptionDe = description.de;
    if (description?.tr) serviceGroup.descriptionTr = description.tr;
    if (displayOrder !== undefined) serviceGroup.displayOrder = displayOrder;
    
    const updated = await storage.updateServiceGroup(id, serviceGroup);
    if (!updated) return res.status(404).json({ message: 'Service group not found' });
    
    const transformedGroup = {
      id: updated.id,
      slug: updated.slug,
      name: {
        en: updated.nameEn,
        ar: updated.nameAr || '',
        de: updated.nameDe || '',
        tr: updated.nameTr || '',
      },
      description: {
        en: updated.descriptionEn || '',
        ar: updated.descriptionAr || '',
        de: updated.descriptionDe || '',
        tr: updated.descriptionTr || '',
      },
      displayOrder: updated.displayOrder || 0,
    };
    
    res.status(200).json(transformedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service group' });
  }
});

// Delete a service group
router.delete('/service-groups/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteServiceGroup(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete service group' });
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
      blockedSlotsCount: blockedSlots.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});

export default router;
