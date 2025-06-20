import { type Request, type Response, Router } from 'express';
import { storage } from './storage';

const router = Router();

// Get all bookings
router.get('/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await storage.getAllBookings();
    res.status(200).json(bookings);
  } catch {
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
  } catch {
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
  } catch {
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Blocked time slots management
router.get('/blocked-slots', async (_req: Request, res: Response) => {
  try {
    const slots = await storage.getBlockedTimeSlots();
    res.status(200).json(slots);
  } catch {
    res.status(500).json({ message: 'Failed to fetch blocked slots' });
  }
});

router.post('/blocked-slots', async (req: Request, res: Response) => {
  try {
    const { date, time } = req.body;
    const newSlot = await storage.createBlockedTimeSlot({ date, time });
    res.status(201).json(newSlot);
  } catch {
    res.status(500).json({ message: 'Failed to create blocked slot' });
  }
});

router.delete('/blocked-slots/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteBlockedTimeSlot(id);
    res.status(204).end();
  } catch {
    res.status(500).json({ message: 'Failed to delete blocked slot' });
  }
});

// Services list management
router.get('/services', async (_req: Request, res: Response) => {
  try {
    const services = await storage.getServices();
    res.status(200).json(services);
  } catch {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Create a new service
router.post('/services', async (req: Request, res: Response) => {
  try {
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  } catch {
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
  } catch {
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// Delete a service
router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteService(id);
    res.status(204).end();
  } catch {
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

// Service Groups management
// Get all service groups
router.get('/service-groups', async (_req: Request, res: Response) => {
  try {
    const groups = await storage.getServiceGroups();
    // Return the groups directly without transforming the structure
    res.status(200).json(groups);
  } catch {
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
  } catch {
    res.status(500).json({ message: 'Failed to fetch service group' });
  }
});

// Create a new service group
router.post('/service-groups', async (req: Request, res: Response) => {
  try {
    // Directly use the flat structure from the client
    const {
      slug,
      nameEn,
      nameAr,
      nameDe,
      nameTr,
      descriptionEn,
      descriptionAr,
      descriptionDe,
      descriptionTr,
      displayOrder,
      isActive,
    } = req.body;

    const serviceGroup = {
      slug,
      nameEn: nameEn || '',
      nameAr: nameAr || '',
      nameDe: nameDe || '',
      nameTr: nameTr || '',
      descriptionEn: descriptionEn || '',
      descriptionAr: descriptionAr || '',
      descriptionDe: descriptionDe || '',
      descriptionTr: descriptionTr || '',
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    };

    const newGroup = await storage.createServiceGroup(serviceGroup);

    // Return the new group directly without transforming
    res.status(201).json(newGroup);
  } catch {
    res.status(500).json({ message: 'Failed to create service group' });
  }
});

// Update an existing service group
router.put('/service-groups/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      slug,
      nameEn,
      nameAr,
      nameDe,
      nameTr,
      descriptionEn,
      descriptionAr,
      descriptionDe,
      descriptionTr,
      displayOrder,
      isActive,
    } = req.body;

    const serviceGroup: any = {};
    if (slug) serviceGroup.slug = slug;
    if (nameEn !== undefined) serviceGroup.nameEn = nameEn;
    if (nameAr !== undefined) serviceGroup.nameAr = nameAr;
    if (nameDe !== undefined) serviceGroup.nameDe = nameDe;
    if (nameTr !== undefined) serviceGroup.nameTr = nameTr;
    if (descriptionEn !== undefined) serviceGroup.descriptionEn = descriptionEn;
    if (descriptionAr !== undefined) serviceGroup.descriptionAr = descriptionAr;
    if (descriptionDe !== undefined) serviceGroup.descriptionDe = descriptionDe;
    if (descriptionTr !== undefined) serviceGroup.descriptionTr = descriptionTr;
    if (displayOrder !== undefined) serviceGroup.displayOrder = displayOrder;
    if (isActive !== undefined) serviceGroup.isActive = isActive;

    const updated = await storage.updateServiceGroup(id, serviceGroup);
    if (!updated) return res.status(404).json({ message: 'Service group not found' });

    // Return the updated group directly without transforming
    res.status(200).json(updated);
  } catch {
    res.status(500).json({ message: 'Failed to update service group' });
  }
});

// Delete a service group
router.delete('/service-groups/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await storage.deleteServiceGroup(id);
    res.status(204).end();
  } catch {
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
  } catch {
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
});

export default router;
