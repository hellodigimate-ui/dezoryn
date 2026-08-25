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
}
