import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

export interface ContactSettingsPayload {
  phone?: string;
  email?: string;
  address?: string;
  googleMap?: string;
  socialLinks?: any;
  whatsApp?: string;
  businessHours?: string;
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

async function seedDefaultContactRaw() {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO contact_settings (id, phone, email, address, "googleMap", "socialLinks", "whatsApp", "businessHours", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      DEFAULT_CONTACT.id,
      DEFAULT_CONTACT.phone,
      DEFAULT_CONTACT.email,
      DEFAULT_CONTACT.address,
      DEFAULT_CONTACT.googleMap,
      JSON.stringify(DEFAULT_CONTACT.socialLinks),
      DEFAULT_CONTACT.whatsApp,
      DEFAULT_CONTACT.businessHours
    );
  } catch {
    // ignore seed error
  }
}

export class ContactService {
  static async get() {
    try {
      if (db.contactSettings) {
        let settings = await db.contactSettings.findUnique({ where: { id: 'default' } });
        if (!settings) {
          settings = await db.contactSettings.create({ data: DEFAULT_CONTACT });
        }
        return settings;
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM contact_settings WHERE id = $1', 'default');
      if (rows && rows.length > 0) {
        return rows[0];
      } else {
        await seedDefaultContactRaw();
        const seeded: any = await prisma.$queryRawUnsafe('SELECT * FROM contact_settings WHERE id = $1', 'default');
        return seeded[0] || DEFAULT_CONTACT;
      }
    } catch {
      return DEFAULT_CONTACT;
    }
  }

  static async update(payload: ContactSettingsPayload) {
    const existing = await ContactService.get();

    const updatedData = {
      phone: payload.phone ?? existing.phone ?? DEFAULT_CONTACT.phone,
      email: payload.email ?? existing.email ?? DEFAULT_CONTACT.email,
      address: payload.address ?? existing.address ?? DEFAULT_CONTACT.address,
      googleMap: payload.googleMap ?? existing.googleMap ?? DEFAULT_CONTACT.googleMap,
      socialLinks: payload.socialLinks ?? existing.socialLinks ?? DEFAULT_CONTACT.socialLinks,
      whatsApp: payload.whatsApp ?? existing.whatsApp ?? DEFAULT_CONTACT.whatsApp,
      businessHours: payload.businessHours ?? existing.businessHours ?? DEFAULT_CONTACT.businessHours,
    };

    try {
      if (db.contactSettings) {
        return await db.contactSettings.upsert({
          where: { id: 'default' },
          update: updatedData,
          create: { id: 'default', ...updatedData },
        });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO contact_settings (id, phone, email, address, "googleMap", "socialLinks", "whatsApp", "businessHours", "createdAt", "updatedAt")
         VALUES ('default', $1, $2, $3, $4, $5::jsonb, $6, $7, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           address = EXCLUDED.address,
           "googleMap" = EXCLUDED."googleMap",
           "socialLinks" = EXCLUDED."socialLinks",
           "whatsApp" = EXCLUDED."whatsApp",
           "businessHours" = EXCLUDED."businessHours",
           "updatedAt" = NOW()`,
        updatedData.phone,
        updatedData.email,
        updatedData.address,
        updatedData.googleMap,
        JSON.stringify(updatedData.socialLinks),
        updatedData.whatsApp,
        updatedData.businessHours
      );

      return { id: 'default', ...updatedData };
    } catch (err) {
      console.error('Error updating contact settings:', err);
      throw err;
    }
  }

  static async submitInquiry(payload: ContactSubmissionPayload) {
    await ensureSubmissionsTableRaw();

    const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();
    const submission = {
      id,
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
      createdAt: now,
      updatedAt: now,
    };

    memorySubmissions.unshift(submission);

    try {
      if (db.contactSubmission) {
        return await db.contactSubmission.create({ data: submission });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO contact_submissions (id, "fullName", email, phone, company, industry, employees, budget, "productInterest", message, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        submission.id,
        submission.fullName,
        submission.email,
        submission.phone,
        submission.company,
        submission.industry,
        submission.employees,
        submission.budget,
        submission.productInterest,
        submission.message,
        submission.status
      );
      return submission;
    } catch {
      return submission;
    }
  }

  static async getSubmissions(query?: string, statusFilter?: string) {
    await ensureSubmissionsTableRaw();

    let items: any[] = [];

    // 1. Fetch Contact Sales Submissions from PostgreSQL
    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM public."contact_submissions" ORDER BY "createdAt" DESC');
      if (rows && Array.isArray(rows) && rows.length > 0) {
        items = rows.map((i: any) => ({ ...i, source: i.source || 'Contact Form' }));
      }
    } catch (_e) {}

    if (!items || items.length === 0) {
      items = memorySubmissions.map((i) => ({ ...i, source: i.source || 'Contact Form' }));
    }

    // 2. Fetch Demo Booking Submissions from PostgreSQL
    let demoBookings: any[] = [];
    try {
      const demoRows: any = await prisma.$queryRawUnsafe('SELECT * FROM public."demo_bookings" ORDER BY "createdAt" DESC');
      if (demoRows && Array.isArray(demoRows)) {
        demoBookings = demoRows;
      }
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

    // 3. Fetch Newsletter Subscriptions from PostgreSQL
    let newsletterSubscribers: any[] = [];
    try {
      const newsRows: any = await prisma.$queryRawUnsafe('SELECT * FROM public."newsletter_subscribers" ORDER BY "createdAt" DESC');
      if (newsRows && Array.isArray(newsRows)) {
        newsletterSubscribers = newsRows;
      }
    } catch (_e) {}

    const mappedNewsletterSubscribers = newsletterSubscribers.map((n: any) => ({
      id: n.id || `sub_${n.email}`,
      fullName: 'Newsletter Subscriber',
      email: n.email || '',
      phone: '',
      company: '',
      industry: 'Newsletter Subscriber',
      employees: '',
      budget: '',
      productInterest: 'Newsletter Digest & Product Updates',
      message: 'Subscribed to Dezoryn Newsletter for product updates & enterprise insights.',
      status: (n.status || 'NEW').toUpperCase(),
      source: 'Newsletter Subscription',
      createdAt: n.createdAt || new Date(),
      updatedAt: n.createdAt || new Date(),
    }));

    // 4. Combine all 3 streams into unified leads collection
    const combinedMap = new Map<string, any>();
    mappedDemoBookings.forEach((item) => combinedMap.set(item.id, item));
    mappedNewsletterSubscribers.forEach((item) => combinedMap.set(item.id, item));
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
  }

  static async updateSubmissionStatus(id: string, status: string) {
    await ensureSubmissionsTableRaw();

    const memIdx = memorySubmissions.findIndex((i) => i.id === id);
    if (memIdx !== -1) {
      memorySubmissions[memIdx].status = status;
      memorySubmissions[memIdx].updatedAt = new Date();
    }

    try {
      await prisma.$executeRawUnsafe(
        'UPDATE public."contact_submissions" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
        status,
        id
      );
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe(
        'UPDATE public."demo_bookings" SET status = $1 WHERE id = $2',
        status,
        id
      );
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe(
        'UPDATE public."newsletter_subscribers" SET status = $1 WHERE id = $2',
        status,
        id
      );
    } catch (_e) {}

    return { id, status };
  }

  static async deleteSubmission(id: string) {
    memorySubmissions = memorySubmissions.filter((i) => i.id !== id);

    try {
      await prisma.$executeRawUnsafe('DELETE FROM public."contact_submissions" WHERE id = $1', id);
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe('DELETE FROM public."demo_bookings" WHERE id = $1', id);
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe('DELETE FROM public."newsletter_subscribers" WHERE id = $1', id);
    } catch (_e) {}

    return { success: true };
  }
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

let memorySubmissions: any[] = [];

async function ensureSubmissionsTableRaw() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public."contact_submissions" (
        id VARCHAR(255) PRIMARY KEY,
        "fullName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) DEFAULT '',
        company VARCHAR(255) DEFAULT '',
        industry VARCHAR(255) DEFAULT '',
        employees VARCHAR(255) DEFAULT '',
        budget VARCHAR(255) DEFAULT '',
        "productInterest" VARCHAR(255) DEFAULT '',
        message TEXT DEFAULT '',
        status VARCHAR(50) DEFAULT 'NEW',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch (_e) {}

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public."demo_bookings" ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NEW';
    `);
  } catch (_e) {}

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public."newsletter_subscribers" ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'NEW';
    `);
  } catch (_e) {}
}
