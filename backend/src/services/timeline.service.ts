import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

export interface TimelineMilestonePayload {
  id?: string;
  year: string;
  title: string;
  description: string;
  icon?: string;
  orderIndex?: number;
  enabled?: boolean;
}

export const DEFAULT_TIMELINE = [
  {
    id: 't-1',
    year: '2020',
    title: 'Founded',
    description: 'Started with a vision to unify ERP, CRM, and AI operations into a single intelligent platform.',
    icon: 'Sparkles',
    orderIndex: 0,
    enabled: true,
  },
  {
    id: 't-2',
    year: '2023',
    title: 'Product Suite Expansion',
    description: 'Launched SchoolyCore ERP and Hospitality HMS modules serving 200+ clients.',
    icon: 'Building2',
    orderIndex: 1,
    enabled: true,
  },
  {
    id: 't-3',
    year: '2025',
    title: 'AI Platform Launch',
    description: 'Unveiled DezoAI Predictive Sales Engine with autonomous copilot workflows.',
    icon: 'Zap',
    orderIndex: 2,
    enabled: true,
  },
  {
    id: 't-4',
    year: '2026',
    title: 'Global Expansion',
    description: 'Scaled to 10M+ active workflows across global enterprise fleets.',
    icon: 'Globe',
    orderIndex: 3,
    enabled: true,
  },
];

let memoryTimeline = [...DEFAULT_TIMELINE];

export class TimelineService {
  static async getAll() {
    try {
      if (db.companyTimeline) {
        const items = await db.companyTimeline.findMany({
          orderBy: { orderIndex: 'asc' },
        });
        if (items && items.length > 0) return items;
        // Seed default if empty
        for (const item of DEFAULT_TIMELINE) {
          await db.companyTimeline.create({ data: item });
        }
        return await db.companyTimeline.findMany({ orderBy: { orderIndex: 'asc' } });
      }
    } catch {
      // Fall through
    }
    return memoryTimeline;
  }

  static async create(payload: TimelineMilestonePayload) {
    const newItem = {
      id: payload.id || `t-${Date.now()}`,
      year: payload.year || '2026',
      title: payload.title || 'New Milestone',
      description: payload.description || 'Milestone description',
      icon: payload.icon || 'Rocket',
      orderIndex: payload.orderIndex ?? memoryTimeline.length,
      enabled: payload.enabled ?? true,
    };

    memoryTimeline.push(newItem);

    try {
      if (db.companyTimeline) {
        return await db.companyTimeline.create({ data: newItem });
      }
    } catch {
      // Fall through
    }
    return newItem;
  }

  static async update(id: string, payload: Partial<TimelineMilestonePayload>) {
    const idx = memoryTimeline.findIndex((i) => i.id === id);
    if (idx !== -1) {
      memoryTimeline[idx] = { ...memoryTimeline[idx], ...payload };
    }

    try {
      if (db.companyTimeline) {
        return await db.companyTimeline.update({
          where: { id },
          data: payload,
        });
      }
    } catch {
      // Fall through
    }
    return memoryTimeline.find((i) => i.id === id) || payload;
  }

  static async delete(id: string) {
    memoryTimeline = memoryTimeline.filter((i) => i.id !== id);
    try {
      if (db.companyTimeline) {
        await db.companyTimeline.delete({ where: { id } });
      }
    } catch {
      // Fall through
    }
    return { success: true };
  }

  static async saveAll(items: TimelineMilestonePayload[]) {
    memoryTimeline = items.map((item, idx) => ({
      id: item.id || `t-${Date.now()}-${idx}`,
      year: item.year || '2026',
      title: item.title || 'New Milestone',
      description: item.description || '',
      icon: item.icon || 'Rocket',
      orderIndex: idx,
      enabled: item.enabled ?? true,
    }));

    try {
      if (db.companyTimeline) {
        await db.companyTimeline.deleteMany({});
        for (const item of memoryTimeline) {
          await db.companyTimeline.create({ data: item });
        }
        return await db.companyTimeline.findMany({ orderBy: { orderIndex: 'asc' } });
      }
    } catch {
      // Fall through
    }
    return memoryTimeline;
  }
}
