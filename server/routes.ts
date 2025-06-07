import type { Express } from 'express';
// import { createServer, type Server } from "http";
import { storage } from './storage';

export async function registerRoutes(app: Express): Promise<void> {
  // API routes for Dubai Rose beauty center

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;

      if (!name || !email || !phone || !message) {
        return res.status(400).json({
          message: 'All fields are required',
        });
      }

      // In a production environment, we would send an email here
      // For now, we'll just log and return success
      console.log('Contact form submission:', { name, email, phone, message });

      res.status(200).json({
        success: true,
        message: 'Message received! We will contact you soon.',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({
        message: 'Failed to process your request. Please try again later.',
      });
    }
  });

  // Booking appointment
  app.post('/api/booking', async (req, res) => {
    try {
      const { name, email, phone, service, date, time, vipNumber } = req.body;

      if (!name || !email || !phone || !service || !date || !time) {
        return res.status(400).json({
          message: 'Required booking information is missing',
        });
      }

      // Save booking to storage
      const booking = await storage.createBooking({
        name,
        email,
        phone,
        service,
        date,
        time,
        vipNumber: vipNumber || null,
        status: 'pending',
      });

      res.status(200).json({
        success: true,
        message: 'Your appointment has been booked successfully!',
        bookingId: booking.id,
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({
        message: 'Failed to process your booking. Please try again later.',
      });
    }
  });

  // Get available time slots for a specific date
  app.get('/api/booking/slots', (req, res) => {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: 'Date parameter is required',
      });
    }

    // In a real application, we would check the database for available slots
    // For now, we'll return mock available slots
    const availableSlots = [
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    res.status(200).json({ availableSlots });
  });

  // Verify VIP membership
  app.post('/api/membership/verify', async (req, res) => {
    try {
      const { membershipNumber } = req.body;

      if (!membershipNumber) {
        return res.status(400).json({
          message: 'Membership number is required',
        });
      }

      // Check if membership exists
      const membership = await storage.getMembershipByNumber(membershipNumber);

      if (!membership) {
        return res.status(404).json({
          valid: false,
          message: 'Membership not found',
        });
      }

      res.status(200).json({
        valid: true,
        type: membership.type, // 'gold' or 'silver'
        discount: membership.type === 'gold' ? 40 : 20,
        name: membership.name,
      });
    } catch (error) {
      console.error('Error verifying membership:', error);
      res.status(500).json({
        message: 'Failed to verify membership. Please try again later.',
      });
    }
  });

  // Get services list
  app.get('/api/services', async (req, res) => {
    try {
      // Get language from query parameter, default to English

      // Get services from storage
      const services = await storage.getServices();

      // Transform database records to ServiceDisplay format for frontend
      const formattedServices = services.map(service => ({
        id: service.id,
        slug: service.slug,
        category: service.category,
        name: {
          en: service.nameEn,
          ar: service.nameAr,
          de: service.nameDe,
          tr: service.nameTr,
        },
        description: {
          en: service.descriptionEn,
          ar: service.descriptionAr,
          de: service.descriptionDe,
          tr: service.descriptionTr,
        },
        longDescription: service.longDescriptionEn
          ? {
              en: service.longDescriptionEn,
              ar: service.longDescriptionAr || '',
              de: service.longDescriptionDe || '',
              tr: service.longDescriptionTr || '',
            }
          : undefined,
        duration: service.duration,
        price: service.price,
        imageUrl: service.imageUrl,
        imageLarge: service.imageLarge || undefined,
      }));

      res.status(200).json(formattedServices);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({
        message: 'Failed to fetch services. Please try again later.',
      });
    }
  });

  // Get service groups list
  app.get('/api/service-groups', async (req, res) => {
    try {
      // Get language from query parameter, default to English

      // Get service groups from storage
      const groups = await storage.getServiceGroups();

      // Transform database records to ServiceGroupDisplay format for frontend
      const formattedGroups = groups.map(group => ({
        id: group.id,
        slug: group.slug,
        name: {
          en: group.nameEn,
          ar: group.nameAr,
          de: group.nameDe,
          tr: group.nameTr,
        },
        description: group.descriptionEn
          ? {
              en: group.descriptionEn,
              ar: group.descriptionAr || '',
              de: group.descriptionDe || '',
              tr: group.descriptionTr || '',
            }
          : undefined,
        imageUrl: group.imageUrl || undefined,
        displayOrder: group.displayOrder || 0,
      }));

      res.status(200).json(formattedGroups);
    } catch (error) {
      console.error('Error getting service groups:', error);
      res.status(500).json({
        message: 'Failed to fetch service groups. Please try again later.',
      });
    }
  });

  // Get single service by slug
  app.get('/api/services/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      // Get service from storage
      const service = await storage.getServiceBySlug(slug);

      if (!service) {
        return res.status(404).json({
          message: 'Service not found',
        });
      }

      // Transform database record to ServiceDisplay format for frontend
      const formattedService = {
        id: service.id,
        slug: service.slug,
        category: service.category,
        name: {
          en: service.nameEn,
          ar: service.nameAr,
          de: service.nameDe,
          tr: service.nameTr,
        },
        description: {
          en: service.descriptionEn,
          ar: service.descriptionAr,
          de: service.descriptionDe,
          tr: service.descriptionTr,
        },
        longDescription: service.longDescriptionEn
          ? {
              en: service.longDescriptionEn,
              ar: service.longDescriptionAr || '',
              de: service.longDescriptionDe || '',
              tr: service.longDescriptionTr || '',
            }
          : undefined,
        duration: service.duration,
        price: service.price,
        imageUrl: service.imageUrl,
        imageLarge: service.imageLarge || undefined,
        // For demo purposes, we'll add static benefits and includes
        benefits: [
          {
            en: 'Professional service',
            ar: 'خدمة احترافية',
            de: 'Professioneller Service',
            tr: 'Profesyonel hizmet',
          },
          {
            en: 'Premium products',
            ar: 'منتجات متميزة',
            de: 'Premium-Produkte',
            tr: 'Premium ürünler',
          },
        ],
        includes: [
          { en: 'Consultation', ar: 'استشارة', de: 'Beratung', tr: 'Danışma' },
          {
            en: 'Aftercare advice',
            ar: 'نصائح العناية اللاحقة',
            de: 'Nachsorgeberatung',
            tr: 'Bakım tavsiyeleri',
          },
        ],
      };

      res.status(200).json(formattedService);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({
        message: 'Failed to fetch service details. Please try again later.',
      });
    }
  });

  // No return value; routes registered directly on `app`
}
