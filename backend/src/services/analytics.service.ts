import { prisma } from '../config/prisma.config';

export type EventType = 'visitor' | 'lead' | 'demo_request' | 'contact_form' | 'page_view' | 'conversion';
export type TrafficSource = 'direct' | 'google' | 'linkedin' | 'twitter' | 'referral' | 'email';

export interface TrackEventPayload {
  eventType: EventType;
  page?: string;
  source?: TrafficSource;
  sessionId?: string;
  userAgent?: string;
  country?: string;
  metadata?: Record<string, unknown>;
}

// Seed 60 days of realistic historical mock analytics on first run
let seedAttempted = false;

async function seedMockAnalytics() {
  if (seedAttempted) return;
  seedAttempted = true;
  try {
    const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM analytics_events`);
    const existing = parseInt((count as any)[0].c, 10);
    if (existing > 50) return; // already seeded

    const eventTypes: EventType[] = ['visitor', 'lead', 'demo_request', 'contact_form', 'page_view', 'conversion'];
    const sources: TrafficSource[] = ['direct', 'google', 'linkedin', 'twitter', 'referral', 'email'];
    const pages = ['/', '/products', '/pricing', '/about', '/careers', '/contact-sales', '/book-demo'];

    const records: string[] = [];
    const now = new Date();

    for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
      const day = new Date(now);
      day.setDate(day.getDate() - dayOffset);

      // Visitors (8-50 per day)
      const visitorCount = Math.floor(Math.random() * 43) + 8;
      for (let i = 0; i < visitorCount; i++) {
        const hr = Math.floor(Math.random() * 23);
        const evDate = new Date(day);
        evDate.setHours(hr, Math.floor(Math.random() * 59), 0, 0);
        records.push(`('${genId()}', 'visitor', '${pages[Math.floor(Math.random() * pages.length)]}', '${sources[Math.floor(Math.random() * sources.length)]}', NULL, NULL, NULL, '{}', '${evDate.toISOString()}')`);
      }

      // Leads (1-8 per day)
      const leadCount = Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < leadCount; i++) {
        const hr = Math.floor(Math.random() * 23);
        const evDate = new Date(day);
        evDate.setHours(hr, 0, 0, 0);
        records.push(`('${genId()}', 'lead', '/', '${sources[Math.floor(Math.random() * sources.length)]}', NULL, NULL, NULL, '{}', '${evDate.toISOString()}')`);
      }

      // Demo requests (0-4 per day)
      const demoCount = Math.floor(Math.random() * 5);
      for (let i = 0; i < demoCount; i++) {
        const hr = Math.floor(Math.random() * 22);
        const evDate = new Date(day);
        evDate.setHours(hr, 0, 0, 0);
        records.push(`('${genId()}', 'demo_request', '/book-demo', '${sources[Math.floor(Math.random() * sources.length)]}', NULL, NULL, NULL, '{}', '${evDate.toISOString()}')`);
      }

      // Contact forms (0-3 per day)
      const contactCount = Math.floor(Math.random() * 4);
      for (let i = 0; i < contactCount; i++) {
        const hr = Math.floor(Math.random() * 22);
        const evDate = new Date(day);
        evDate.setHours(hr, 0, 0, 0);
        records.push(`('${genId()}', 'contact_form', '/contact-sales', 'direct', NULL, NULL, NULL, '{}', '${evDate.toISOString()}')`);
      }

      // Conversions (0-2 per day)
      const convCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < convCount; i++) {
        const evDate = new Date(day);
        evDate.setHours(10 + i, 0, 0, 0);
        records.push(`('${genId()}', 'conversion', '/book-demo', 'google', NULL, NULL, NULL, '{}', '${evDate.toISOString()}')`);
      }
    }

    // Batch insert in chunks of 200
    const chunkSize = 200;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize).join(',');
      await prisma.$executeRawUnsafe(
        `INSERT INTO analytics_events (id, "eventType", page, source, "sessionId", "userAgent", country, metadata, "createdAt") VALUES ${chunk} ON CONFLICT (id) DO NOTHING`
      );
    }
  } catch (err) {
    console.error('Analytics seed error:', err);
  }
}

function genId(): string {
  return Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
}

export class AnalyticsService {
  static async trackEvent(payload: TrackEventPayload) {
    await seedMockAnalytics();
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO analytics_events (id, "eventType", page, source, "sessionId", "userAgent", country, metadata, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        genId(),
        payload.eventType,
        payload.page || '/',
        payload.source || 'direct',
        payload.sessionId || null,
        payload.userAgent || null,
        payload.country || null,
        JSON.stringify(payload.metadata || {})
      );
      return { success: true };
    } catch (err) {
      console.error('Track event error:', err);
      return { success: false };
    }
  }

  static async getStats(dateFrom: string, dateTo: string) {
    await seedMockAnalytics();
    try {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);

      const events: any[] = await prisma.$queryRawUnsafe(
        `SELECT "eventType", page, source, "createdAt"::text as "createdAt"
         FROM analytics_events
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
         ORDER BY "createdAt" ASC`,
        fromDate,
        toDate
      );

      // Aggregate totals
      const visitors = events.filter(e => e.eventType === 'visitor').length;
      const leads = events.filter(e => e.eventType === 'lead').length;
      const demoRequests = events.filter(e => e.eventType === 'demo_request').length;
      const contactForms = events.filter(e => e.eventType === 'contact_form').length;
      const conversions = events.filter(e => e.eventType === 'conversion').length;
      const conversionRate = visitors > 0 ? parseFloat(((conversions / visitors) * 100).toFixed(1)) : 0;

      // Top pages
      const pageCounts: Record<string, number> = {};
      events.filter(e => ['visitor', 'page_view'].includes(e.eventType)).forEach(e => {
        pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([page, visits]) => ({ page, visits }));

      // Traffic sources
      const sourceCounts: Record<string, number> = {};
      events.forEach(e => {
        sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1;
      });
      const trafficSources = Object.entries(sourceCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([source, count]) => ({
          source,
          count,
          percentage: events.length > 0 ? parseFloat(((count / events.length) * 100).toFixed(1)) : 0
        }));

      // Daily breakdown for chart (group by date)
      const dailyMap: Record<string, Record<string, number>> = {};
      events.forEach(e => {
        const day = e.createdAt.substring(0, 10);
        if (!dailyMap[day]) {
          dailyMap[day] = { visitors: 0, leads: 0, demo_requests: 0, contact_forms: 0, conversions: 0 };
        }
        if (e.eventType === 'visitor') dailyMap[day].visitors++;
        if (e.eventType === 'lead') dailyMap[day].leads++;
        if (e.eventType === 'demo_request') dailyMap[day].demo_requests++;
        if (e.eventType === 'contact_form') dailyMap[day].contact_forms++;
        if (e.eventType === 'conversion') dailyMap[day].conversions++;
      });

      const chartData = Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, counts]) => ({ date, ...counts }));

      return {
        totals: { visitors, leads, demoRequests, contactForms, conversions, conversionRate },
        topPages,
        trafficSources,
        chartData,
      };
    } catch (err) {
      console.error('Analytics stats error:', err);
      throw err;
    }
  }

  static async getOverviewDashboardStats() {
    try {
      const [
        totalProducts,
        activeProducts,
        contactSubmissions,
        demoBookings,
        newsletterSubscribers,
        totalMedia,
        mediaAgg,
        totalTestimonials,
        totalFaqs,
        totalDemos,
        totalJobs,
        totalServices,
        recentContacts,
        recentBookings,
        recentProducts
      ] = await Promise.all([
        prisma.product.count().catch(() => 0),
        prisma.product.count({ where: { status: 'active' } }).catch(() => 0),
        prisma.contactSubmission.count().catch(() => 0),
        prisma.demoBooking.count().catch(() => 0),
        prisma.$queryRawUnsafe('SELECT COUNT(*)::int as c FROM newsletter_subscribers').then((r: any) => r[0]?.c || 0).catch(() => 0),
        prisma.media.count().catch(() => 0),
        prisma.media.aggregate({ _sum: { size: true } }).catch(() => ({ _sum: { size: 0 } })),
        prisma.testimonial.count().catch(() => 0),
        prisma.faq.count().catch(() => 0),
        prisma.productDemo.count().catch(() => 0),
        prisma.job.count().catch(() => 0),
        prisma.service.count().catch(() => 0),
        prisma.contactSubmission.findMany({
          take: 4,
          orderBy: { createdAt: 'desc' },
          select: { id: true, fullName: true, company: true, productInterest: true, createdAt: true }
        }).catch(() => []),
        prisma.demoBooking.findMany({
          take: 4,
          orderBy: { createdAt: 'desc' },
          select: { id: true, fullName: true, company: true, productSelected: true, createdAt: true }
        }).catch(() => []),
        prisma.product.findMany({
          take: 4,
          orderBy: { updatedAt: 'desc' },
          select: { id: true, title: true, category: true, updatedAt: true }
        }).catch(() => [])
      ]);

      const totalSizeBytes = (mediaAgg as any)?._sum?.size || 0;
      let storageFormatted = '0 MB';
      if (totalSizeBytes > 1024 * 1024 * 1024) {
        storageFormatted = `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB Storage Used`;
      } else if (totalSizeBytes > 1024 * 1024) {
        storageFormatted = `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB Storage Used`;
      } else if (totalSizeBytes > 0) {
        storageFormatted = `${(totalSizeBytes / 1024).toFixed(0)} KB Storage Used`;
      } else {
        storageFormatted = '0 MB Storage Used';
      }

      // Build recent live activity
      const activityList: Array<{ id: string; action: string; detail: string; time: string; user: string; timestamp: number }> = [];

      (recentContacts as any[]).forEach((c: any) => {
        activityList.push({
          id: `contact-${c.id}`,
          action: 'New Contact Inquiry',
          detail: `${c.fullName || 'Visitor'}${c.company ? ` (${c.company})` : ''} inquired about ${c.productInterest || 'Enterprise Solutions'}`,
          time: formatTimeAgo(c.createdAt),
          user: 'Customer',
          timestamp: new Date(c.createdAt).getTime()
        });
      });

      (recentBookings as any[]).forEach((b: any) => {
        activityList.push({
          id: `booking-${b.id}`,
          action: 'Product Demo Scheduled',
          detail: `${b.fullName}${b.company ? ` (${b.company})` : ''} requested live walkthrough for ${b.productSelected || 'Software Suite'}`,
          time: formatTimeAgo(b.createdAt),
          user: 'Prospect',
          timestamp: new Date(b.createdAt).getTime()
        });
      });

      (recentProducts as any[]).forEach((p: any) => {
        activityList.push({
          id: `product-${p.id}`,
          action: 'Product Catalog Updated',
          detail: `${p.title} (${p.category || 'SaaS'}) updated in database`,
          time: formatTimeAgo(p.updatedAt),
          user: 'Admin',
          timestamp: new Date(p.updatedAt).getTime()
        });
      });

      activityList.sort((a, b) => b.timestamp - a.timestamp);

      // If no activity yet, provide a clean starter item
      if (activityList.length === 0) {
        activityList.push({
          id: 'initial',
          action: 'CMS Ready',
          detail: 'Centralized CMS system active and receiving live events',
          time: 'Active',
          user: 'System',
          timestamp: Date.now()
        });
      }

      return {
        publishedSections: {
          count: 9,
          names: 'Hero, Products, FAQs, Testimonials, Solutions, Pricing, Careers, Footer, Demos'
        },
        products: {
          total: totalProducts,
          active: activeProducts
        },
        leads: {
          total: contactSubmissions + demoBookings + newsletterSubscribers,
          contacts: contactSubmissions,
          bookings: demoBookings,
          newsletter: newsletterSubscribers
        },
        media: {
          total: totalMedia,
          storage: storageFormatted,
          totalBytes: totalSizeBytes
        },
        counts: {
          testimonials: totalTestimonials,
          faqs: totalFaqs,
          demos: totalDemos,
          jobs: totalJobs,
          services: totalServices
        },
        recentActivity: activityList.slice(0, 5)
      };
    } catch (error) {
      console.error('getOverviewDashboardStats error:', error);
      throw error;
    }
  }
}

function formatTimeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

