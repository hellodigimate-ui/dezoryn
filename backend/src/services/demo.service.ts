import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;
const BOOKING_STORE: any[] = [];
const IDEMPOTENCY_STORE = new Map<string, any>();
const INFLIGHT_BOOKINGS = new Map<string, Promise<any>>();

export interface ProductDemoPayload {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

const DEFAULT_DEMOS = [
  {
    id: 'demo-1',
    title: 'SchoolyCore Demo',
    description: 'Complete Education Management & Student Lifecycle Suite.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop',
    category: 'Education',
    order: 1,
    isActive: true,
  },
  {
    id: 'demo-2',
    title: 'Hospital Management Demo',
    description: 'Next-Gen EHR, OPD Billing & Patient Workflow Platform.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
    category: 'Healthcare',
    order: 2,
    isActive: true,
  },
  {
    id: 'demo-3',
    title: 'HRMS Demo',
    description: 'AI Payroll, Attendance Tracking & Employee Performance Hub.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
    category: 'Enterprise',
    order: 3,
    isActive: true,
  },
  {
    id: 'demo-4',
    title: 'InventoryPro Demo',
    description: 'Real-Time Supply Chain & Multi-Warehouse Automation.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
    category: 'Logistics',
    order: 4,
    isActive: true,
  },
];

let hasAttemptedDemoInitialSeed = false;

async function seedInitialDemosRaw() {
  for (const item of DEFAULT_DEMOS) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO product_demos (id, title, description, "videoUrl", "thumbnailUrl", category, "order", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        item.id, item.title, item.description, item.videoUrl,
        item.thumbnailUrl, item.category, item.order, item.isActive
      );
    } catch {
      // ignore
    }
  }
}

export class DemoService {
  static async getAll(activeOnly: boolean = false) {
    if (!hasAttemptedDemoInitialSeed) {
      hasAttemptedDemoInitialSeed = true;
      try {
        const countRes: any = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM product_demos');
        if (countRes[0]?.count === 0) {
          await seedInitialDemosRaw();
        }
      } catch {
        // ignore
      }
    }

    try {
      if (db.productDemo) {
        const where = activeOnly ? { isActive: true } : {};
        return await db.productDemo.findMany({
          where,
          orderBy: { order: 'asc' },
        });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      let sql = 'SELECT * FROM product_demos';
      if (activeOnly) {
        sql += ' WHERE "isActive" = true';
      }
      sql += ' ORDER BY "order" ASC';

      return await prisma.$queryRawUnsafe(sql);
    } catch {
      return DEFAULT_DEMOS;
    }
  }

  static async getById(id: string) {
    try {
      if (db.productDemo) {
        return await db.productDemo.findUnique({ where: { id } });
      }
    } catch {
      // Fall through
    }

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM product_demos WHERE id = $1', id);
    return rows ? rows[0] : null;
  }

  static async create(payload: ProductDemoPayload) {
    const data = {
      title: payload.title,
      description: payload.description || '',
      videoUrl: payload.videoUrl,
      thumbnailUrl: payload.thumbnailUrl || '',
      category: payload.category || 'General',
      order: payload.order ?? 0,
      isActive: payload.isActive ?? true,
    };

    try {
      if (db.productDemo) {
        return await db.productDemo.create({ data });
      }
    } catch {
      // Fall through to raw SQL
    }

    const id = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO product_demos (id, title, description, "videoUrl", "thumbnailUrl", category, "order", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      id, data.title, data.description, data.videoUrl,
      data.thumbnailUrl, data.category, data.order, data.isActive
    );

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM product_demos WHERE id = $1', id);
    return rows[0] || { id, ...data };
  }

  static async update(id: string, payload: Partial<ProductDemoPayload>) {
    try {
      if (db.productDemo) {
        return await db.productDemo.update({
          where: { id },
          data: payload,
        });
      }
    } catch {
      // Fall through to raw SQL
    }

    const existing = await DemoService.getById(id);
    if (!existing) throw new Error('Product demo not found');

    const updatedData = {
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      videoUrl: payload.videoUrl ?? existing.videoUrl,
      thumbnailUrl: payload.thumbnailUrl ?? existing.thumbnailUrl,
      category: payload.category ?? existing.category,
      order: payload.order ?? existing.order,
      isActive: payload.isActive ?? existing.isActive,
    };

    await prisma.$executeRawUnsafe(
      `UPDATE product_demos SET
        title = $1, description = $2, "videoUrl" = $3, "thumbnailUrl" = $4,
        category = $5, "order" = $6, "isActive" = $7, "updatedAt" = NOW()
       WHERE id = $8`,
      updatedData.title, updatedData.description, updatedData.videoUrl,
      updatedData.thumbnailUrl, updatedData.category, updatedData.order,
      updatedData.isActive, id
    );

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM product_demos WHERE id = $1', id);
    return rows[0];
  }

  static async delete(id: string) {
    try {
      if (db.productDemo) {
        await db.productDemo.delete({ where: { id } });
        return { success: true };
      }
    } catch {
      // Fall through
    }

    await prisma.$executeRawUnsafe('DELETE FROM product_demos WHERE id = $1', id);
    return { success: true };
  }

  static async createBooking(payload: any) {
    const idempotencyKey = payload.idempotencyKey || payload.id || `${payload.email}_${payload.bookingDate}_${payload.bookingTimeSlot}`;

    if (idempotencyKey && IDEMPOTENCY_STORE.has(idempotencyKey)) {
      return IDEMPOTENCY_STORE.get(idempotencyKey);
    }

    if (idempotencyKey && INFLIGHT_BOOKINGS.has(idempotencyKey)) {
      return await INFLIGHT_BOOKINGS.get(idempotencyKey);
    }

    const executionPromise = (async () => {
      // Check duplicate by email + bookingDate + bookingTimeSlot in memory
      const duplicateInStore = BOOKING_STORE.find(
        (b) =>
          b.email === payload.email &&
          b.bookingDate === payload.bookingDate &&
          b.bookingTimeSlot === payload.bookingTimeSlot
      );
      if (duplicateInStore) {
        if (idempotencyKey) IDEMPOTENCY_STORE.set(idempotencyKey, duplicateInStore);
        return duplicateInStore;
      }

      // Check database for existing booking by email + bookingDate + bookingTimeSlot
      try {
        const dbDuplicates: any = await prisma.$queryRawUnsafe(
          'SELECT * FROM demo_bookings WHERE email = $1 AND "bookingDate" = $2 AND "bookingTimeSlot" = $3 LIMIT 1',
          payload.email,
          payload.bookingDate,
          payload.bookingTimeSlot
        );
        if (dbDuplicates && Array.isArray(dbDuplicates) && dbDuplicates.length > 0) {
          const existingRecord = dbDuplicates[0];
          if (idempotencyKey) IDEMPOTENCY_STORE.set(idempotencyKey, existingRecord);
          return existingRecord;
        }
      } catch (_e) {}

      const meetingRoomId = `dezoryn-demo-${Math.random().toString(36).substring(2, 8)}`;
      const defaultMeetingLink = `https://meet.dezoryn.com/${meetingRoomId}`;

      const booking = {
        id: payload.id || `demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone || '',
        company: payload.company || '',
        productSelected: payload.productSelected || '',
        teamSize: payload.teamSize || '',
        expectedUsers: payload.expectedUsers || '',
        notes: payload.notes || '',
        bookingDate: payload.bookingDate,
        formattedBookingDate: payload.formattedBookingDate || payload.bookingDate,
        bookingTimeSlot: payload.bookingTimeSlot || '',
        timeZone: payload.timeZone || '',
        meetingLink: payload.meetingLink || defaultMeetingLink,
        calendarInviteStatus: payload.calendarInviteStatus || 'SUCCESS',
        createdAt: new Date().toISOString()
      };

      // 1. Persist using Prisma db.demoBooking if client has model
      try {
        if (db.demoBooking) {
          const record = await db.demoBooking.create({
            data: {
              fullName: booking.fullName,
              email: booking.email,
              phone: booking.phone,
              company: booking.company,
              productSelected: booking.productSelected,
              teamSize: booking.teamSize,
              expectedUsers: booking.expectedUsers,
              notes: booking.notes,
              bookingDate: booking.bookingDate,
              formattedBookingDate: booking.formattedBookingDate,
              bookingTimeSlot: booking.bookingTimeSlot,
              timeZone: booking.timeZone,
            }
          });
          const fullRecord = { ...record, meetingLink: booking.meetingLink, calendarInviteStatus: booking.calendarInviteStatus };
          BOOKING_STORE.unshift(fullRecord);
          if (idempotencyKey) IDEMPOTENCY_STORE.set(idempotencyKey, fullRecord);
          return fullRecord;
        }
      } catch (_e) {
        // Fall through
      }

      // 2. Log event in Prisma AnalyticsEvent if model exists
      try {
        if (db.analyticsEvent) {
          await db.analyticsEvent.create({
            data: {
              eventType: 'demo_request',
              page: '/book-demo',
              source: 'booking_form',
              metadata: booking
            }
          });
        }
      } catch (_e) {
        // Ignore fallback
      }

      // 3. Persist to PostgreSQL table demo_bookings via Raw SQL
      try {
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS demo_bookings (
            id TEXT PRIMARY KEY,
            "fullName" TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            "productSelected" TEXT,
            "teamSize" TEXT,
            "expectedUsers" TEXT,
            notes TEXT,
            "bookingDate" TEXT,
            "formattedBookingDate" TEXT,
            "bookingTimeSlot" TEXT,
            "timeZone" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW()
          )`
        );
        await prisma.$executeRawUnsafe(
          `INSERT INTO demo_bookings (id, "fullName", email, phone, company, "productSelected", "teamSize", "expectedUsers", notes, "bookingDate", "formattedBookingDate", "bookingTimeSlot", "timeZone")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          booking.id, booking.fullName, booking.email, booking.phone, booking.company,
          booking.productSelected, booking.teamSize, booking.expectedUsers, booking.notes,
          booking.bookingDate, booking.formattedBookingDate, booking.bookingTimeSlot, booking.timeZone
        );
      } catch (_e) {
        // Fallback
      }

      BOOKING_STORE.unshift(booking);
      if (idempotencyKey) IDEMPOTENCY_STORE.set(idempotencyKey, booking);
      return booking;
    })();

    if (idempotencyKey) {
      INFLIGHT_BOOKINGS.set(idempotencyKey, executionPromise);
    }
    try {
      return await executionPromise;
    } finally {
      if (idempotencyKey) INFLIGHT_BOOKINGS.delete(idempotencyKey);
    }
  }

  static async getBookings() {
    try {
      if (db.demoBooking) {
        const items = await db.demoBooking.findMany({ orderBy: { createdAt: 'desc' } });
        if (items && items.length > 0) return items;
      }
    } catch (_e) {}

    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM demo_bookings ORDER BY "createdAt" DESC');
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows;
      }
    } catch (_e) {}
    return BOOKING_STORE;
  }
}

export function validateBookingDate(bookingDateStr: string): { isValid: boolean; parsedDate: Date | null; error?: string } {
  if (!bookingDateStr || typeof bookingDateStr !== 'string') {
    return { isValid: false, parsedDate: null, error: 'Please select a current or future date.' };
  }

  let parsedDate: Date | null = null;
  const cleanStr = bookingDateStr.trim();

  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [y, m, d] = cleanStr.split('-').map(Number);
    parsedDate = new Date(y, m - 1, d, 0, 0, 0, 0);
  } else {
    const timestamp = Date.parse(cleanStr);
    if (!isNaN(timestamp)) {
      const d = new Date(timestamp);
      parsedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    return { isValid: false, parsedDate: null, error: 'Please select a current or future date.' };
  }

  // Server current date at midnight (00:00:00)
  const now = new Date();
  const serverToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (parsedDate.getTime() < serverToday.getTime()) {
    return { isValid: false, parsedDate, error: 'Please select a current or future date.' };
  }

  return { isValid: true, parsedDate };
}

