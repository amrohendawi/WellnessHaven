import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for Dubai Rose beauty center
  
  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      
      if (!name || !email || !phone || !message) {
        return res.status(400).json({ 
          message: 'All fields are required' 
        });
      }
      
      // In a production environment, we would send an email here
      // For now, we'll just log and return success
      console.log('Contact form submission:', { name, email, phone, message });
      
      res.status(200).json({ 
        success: true, 
        message: 'Message received! We will contact you soon.' 
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ 
        message: 'Failed to process your request. Please try again later.' 
      });
    }
  });
  
  // Booking appointment
  app.post('/api/booking', async (req, res) => {
    try {
      const { 
        name, 
        email, 
        phone, 
        service, 
        date, 
        time,
        vipNumber 
      } = req.body;
      
      if (!name || !email || !phone || !service || !date || !time) {
        return res.status(400).json({ 
          message: 'Required booking information is missing' 
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
        createdAt: new Date().toISOString()
      });
      
      res.status(200).json({ 
        success: true, 
        message: 'Your appointment has been booked successfully!',
        bookingId: booking.id
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      res.status(500).json({ 
        message: 'Failed to process your booking. Please try again later.' 
      });
    }
  });
  
  // Get available time slots for a specific date
  app.get('/api/booking/slots', (req, res) => {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        message: 'Date parameter is required' 
      });
    }
    
    // In a real application, we would check the database for available slots
    // For now, we'll return mock available slots
    const availableSlots = [
      '10:00', '11:00', '12:00', '13:00', '14:00', 
      '15:00', '16:00', '17:00', '18:00', '19:00'
    ];
    
    res.status(200).json({ availableSlots });
  });
  
  // Verify VIP membership
  app.post('/api/membership/verify', async (req, res) => {
    try {
      const { membershipNumber } = req.body;
      
      if (!membershipNumber) {
        return res.status(400).json({ 
          message: 'Membership number is required' 
        });
      }
      
      // Check if membership exists
      const membership = await storage.getMembershipByNumber(membershipNumber);
      
      if (!membership) {
        return res.status(404).json({ 
          valid: false,
          message: 'Membership not found' 
        });
      }
      
      res.status(200).json({ 
        valid: true,
        type: membership.type, // 'gold' or 'silver'
        discount: membership.type === 'gold' ? 40 : 20,
        name: membership.name
      });
    } catch (error) {
      console.error('Error verifying membership:', error);
      res.status(500).json({ 
        message: 'Failed to verify membership. Please try again later.' 
      });
    }
  });
  
  // Get services list
  app.get('/api/services', (req, res) => {
    try {
      // Get language from query parameter, default to English
      const lang = (req.query.lang as string) || 'en';
      const validLangs = ['en', 'ar', 'de', 'tr'];
      const language = validLangs.includes(lang) ? lang : 'en';
      
      // Get services from storage
      const services = storage.getServices(language);
      
      res.status(200).json(services);
    } catch (error) {
      console.error('Error getting services:', error);
      res.status(500).json({ 
        message: 'Failed to fetch services. Please try again later.' 
      });
    }
  });
  
  // Get single service by slug
  app.get('/api/services/:slug', (req, res) => {
    try {
      const { slug } = req.params;
      const lang = (req.query.lang as string) || 'en';
      const validLangs = ['en', 'ar', 'de', 'tr'];
      const language = validLangs.includes(lang) ? lang : 'en';
      
      // Get service from storage
      const service = storage.getServiceBySlug(slug, language);
      
      if (!service) {
        return res.status(404).json({ 
          message: 'Service not found' 
        });
      }
      
      res.status(200).json(service);
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({ 
        message: 'Failed to fetch service details. Please try again later.' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
