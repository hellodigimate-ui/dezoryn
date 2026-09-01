import { prisma } from '../config/prisma.config';

export interface ProductDemoPayload {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}

export const DEFAULT_DEMOS = [
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

export class DemoService {
  /**
   * GET ALL PRODUCT DEMOS
   * PostgreSQL is the only source of truth.
   */
  static async getAll(activeOnly: boolean = false) {
    try {
      let demos = await prisma.productDemo.findMany({
        where: activeOnly ? { isActive: true } : {},
        orderBy: { order: 'asc' },
      });

      if (!demos || demos.length === 0) {
        await prisma.productDemo.createMany({
          data: DEFAULT_DEMOS,
        });
        demos = await prisma.productDemo.findMany({
          where: activeOnly ? { isActive: true } : {},
          orderBy: { order: 'asc' },
        });
      }

      return demos;
    } catch (error) {
      console.error('GET PRODUCT DEMOS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const demo = await prisma.productDemo.findUnique({ where: { id } });
      return demo;
    } catch (error) {
      console.error(`GET DEMO ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(payload: ProductDemoPayload) {
    try {
      const count = await prisma.productDemo.count();
      const demo = await prisma.productDemo.create({
        data: {
          title: payload.title,
          description: payload.description || '',
          videoUrl: payload.videoUrl,
          thumbnailUrl: payload.thumbnailUrl || '',
          category: payload.category || 'General',
          order: payload.order ?? count,
          isActive: payload.isActive ?? true,
        },
      });

      return demo;
    } catch (error) {
      console.error('CREATE DEMO ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, payload: Partial<ProductDemoPayload>) {
    try {
      const updated = await prisma.productDemo.update({
        where: { id },
        data: payload,
      });

      return updated;
    } catch (error) {
      console.error(`UPDATE DEMO ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.productDemo.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error(`DELETE DEMO ${id} ERROR:`, error);
      throw error;
    }
  }

  /**
   * CREATE DEMO BOOKING
   */
  static async createBooking(payload: any): Promise<any> {
    try {
      const existing = await prisma.demoBooking.findFirst({
        where: {
          email: payload.email,
          bookingDate: payload.bookingDate,
          bookingTimeSlot: payload.bookingTimeSlot || '',
        },
      });

      if (existing) {
        return {
          ...existing,
          calendarInviteStatus: 'SUCCESS',
        };
      }

      const booking = await prisma.demoBooking.create({
        data: {
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
          status: 'CONFIRMED',
        },
      });

      try {
        await prisma.analyticsEvent.create({
          data: {
            eventType: 'demo_request',
            page: '/book-demo',
            source: 'booking_form',
            metadata: payload,
          },
        });
      } catch (_e) {}

      return {
        ...booking,
        calendarInviteStatus: 'SUCCESS',
      };
    } catch (error) {
      console.error('CREATE DEMO BOOKING ERROR:', error);
      throw error;
    }
  }

  static async getBookings() {
    try {
      const bookings = await prisma.demoBooking.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return bookings;
    } catch (error) {
      console.error('GET DEMO BOOKINGS ERROR:', error);
      throw error;
    }
  }
}

export function validateBookingDate(bookingDateStr: string): { isValid: boolean; parsedDate: Date | null; error?: string } {
  if (!bookingDateStr || typeof bookingDateStr !== 'string') {
    return { isValid: false, parsedDate: null, error: 'Please select a current or future date.' };
  }

  let parsedDate: Date | null = null;
  const cleanStr = bookingDateStr.trim();

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

  const now = new Date();
  const serverToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (parsedDate.getTime() < serverToday.getTime()) {
    return { isValid: false, parsedDate, error: 'Please select a current or future date.' };
  }

  return { isValid: true, parsedDate };
}
