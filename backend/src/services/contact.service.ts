import { prisma } from '../config/prisma.config';

export interface ContactSettingsPayload {
  phone?: string;
  email?: string;
  address?: string;
  googleMap?: string;
  socialLinks?: any;
  whatsApp?: string;
  businessHours?: string;
}

export interface ContactSubmissionPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  employees?: string;
  budget?: string;
  productInterest?: string;
  message?: string;
}

const DEFAULT_CONTACT = {
  id: 'default',
  phone: '+91 77778 04850',
  email: 'support@dezoryn.com',
  address: 'Indore, Madhya Pradesh, India',
  googleMap: 'https://maps.google.com/?q=Indore,Madhya+Pradesh,India',
  socialLinks: {
    twitter: 'https://twitter.com/dezoryn',
    linkedin: 'https://linkedin.com/company/dezoryn',
    github: 'https://github.com/dezoryn',
    facebook: 'https://facebook.com/dezoryn',
    instagram: 'https://instagram.com/dezoryn',
    youtube: 'https://youtube.com/@dezoryn',
  },
  whatsApp: '+917777804850',
  businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM IST | Sat - Sun: Closed',
};

export class ContactService {
  /**
   * GET CONTACT SETTINGS
   * PostgreSQL is the only source of truth.
   */
  static async get() {
    try {
      let settings = await prisma.contactSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        settings = await prisma.contactSettings.create({ data: DEFAULT_CONTACT });
      }
      return settings;
    } catch (error) {
      console.error('GET CONTACT SETTINGS ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE CONTACT SETTINGS
   */
  static async update(payload: ContactSettingsPayload) {
    try {
      const existing: any = await ContactService.get();

      const updatedData = {
        phone: payload.phone ?? existing.phone ?? DEFAULT_CONTACT.phone,
        email: payload.email ?? existing.email ?? DEFAULT_CONTACT.email,
        address: payload.address ?? existing.address ?? DEFAULT_CONTACT.address,
        googleMap: payload.googleMap ?? existing.googleMap ?? DEFAULT_CONTACT.googleMap,
        socialLinks: payload.socialLinks ?? existing.socialLinks ?? DEFAULT_CONTACT.socialLinks,
        whatsApp: payload.whatsApp ?? existing.whatsApp ?? DEFAULT_CONTACT.whatsApp,
        businessHours: payload.businessHours ?? existing.businessHours ?? DEFAULT_CONTACT.businessHours,
      };

      const updated = await prisma.contactSettings.upsert({
        where: { id: 'default' },
        update: updatedData,
        create: { id: 'default', ...updatedData },
      });

      return updated;
    } catch (error) {
      console.error('UPDATE CONTACT SETTINGS ERROR:', error);
      throw error;
    }
  }

  /**
   * SUBMIT CONTACT INQUIRY
   */
  static async submitInquiry(payload: ContactSubmissionPayload) {
    try {
      const submission = await prisma.contactSubmission.create({
        data: {
          fullName: payload.fullName || 'Anonymous Visitor',
          email: payload.email || '',
          phone: payload.phone || '',
          company: payload.company || '',
          industry: payload.industry || '',
          employees: payload.employees || '',
          budget: payload.budget || '',
          productInterest: payload.productInterest || '',
          message: payload.message || '',
          status: 'NEW',
        },
      });

      return submission;
    } catch (error) {
      console.error('SUBMIT INQUIRY ERROR:', error);
      throw error;
    }
  }

  /**
   * GET SUBMISSIONS (Contact, Demo Bookings, etc.)
   */
  static async getSubmissions(query?: string, statusFilter?: string) {
    try {
      let items: any[] = [];

      // 1. Fetch Contact Sales Submissions
      try {
        const dbSubmissions = await prisma.contactSubmission.findMany({
          orderBy: { createdAt: 'desc' },
        });
        items = dbSubmissions.map((i: any) => ({ ...i, source: i.source || 'Contact Form' }));
      } catch (_e) {}

      // 2. Fetch Demo Booking Submissions
      let demoBookings: any[] = [];
      try {
        demoBookings = await prisma.demoBooking.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch (_e) {}

      const mappedDemoBookings = demoBookings.map((b: any) => ({
        id: b.id,
        fullName: (b.fullName || 'Demo Applicant').trim(),
        email: b.email || '',
        phone: b.phone || '',
        company: b.company || '',
        industry: b.productSelected ? `Product: ${b.productSelected}` : 'Enterprise Client',
        employees: b.teamSize || b.expectedUsers || '',
        budget: '',
        productInterest: b.productSelected || 'Dezoryn Enterprise Demo',
        message: b.notes ? `[Demo Notes]: ${b.notes} | Scheduled: ${b.formattedBookingDate || b.bookingDate} ${b.bookingTimeSlot || ''}` : `Scheduled Demo: ${b.formattedBookingDate || b.bookingDate} ${b.bookingTimeSlot || ''}`,
        status: (b.status === 'CONFIRMED' ? 'NEW' : (b.status || 'NEW')).toUpperCase(),
        source: 'Demo Booking',
        createdAt: b.createdAt || new Date(),
        updatedAt: b.updatedAt || new Date(),
      }));

      // Combine streams
      const combinedMap = new Map<string, any>();
      mappedDemoBookings.forEach((item) => combinedMap.set(item.id, item));
      items.forEach((item) => combinedMap.set(item.id, item));

      const combined = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      let filtered = combined;
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter((i) => (i.status || 'NEW').toUpperCase() === statusFilter.toUpperCase());
      }

      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(
          (i) =>
            (i.fullName && String(i.fullName).toLowerCase().includes(q)) ||
            (i.email && String(i.email).toLowerCase().includes(q)) ||
            (i.company && String(i.company).toLowerCase().includes(q)) ||
            (i.phone && String(i.phone).toLowerCase().includes(q)) ||
            (i.message && String(i.message).toLowerCase().includes(q)) ||
            (i.industry && String(i.industry).toLowerCase().includes(q)) ||
            (i.productInterest && String(i.productInterest).toLowerCase().includes(q)) ||
            (i.source && String(i.source).toLowerCase().includes(q))
        );
      }

      return filtered;
    } catch (error) {
      console.error('GET SUBMISSIONS ERROR:', error);
      throw error;
    }
  }

  static async updateSubmissionStatus(id: string, status: string) {
    try {
      try {
        await prisma.contactSubmission.update({
          where: { id },
          data: { status, updatedAt: new Date() },
        });
      } catch (_e) {}

      try {
        await prisma.demoBooking.update({
          where: { id },
          data: { status },
        });
      } catch (_e) {}

      return { id, status };
    } catch (error) {
      console.error(`UPDATE SUBMISSION STATUS ${id} ERROR:`, error);
      throw error;
    }
  }

  static async deleteSubmission(id: string) {
    try {
      try {
        await prisma.contactSubmission.delete({ where: { id } });
      } catch (_e) {}

      try {
        await prisma.demoBooking.delete({ where: { id } });
      } catch (_e) {}

      return { success: true };
    } catch (error) {
      console.error(`DELETE SUBMISSION ${id} ERROR:`, error);
      throw error;
    }
  }
}
