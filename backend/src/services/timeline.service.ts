import { prisma } from '../config/prisma.config';

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
    year: '2020',
    title: 'Founded',
    description: 'Started with a vision to unify ERP, CRM, and AI operations into a single intelligent platform.',
    icon: 'Sparkles',
    orderIndex: 0,
    enabled: true,
  },
  {
    year: '2023',
    title: 'Product Suite Expansion',
    description: 'Launched SchoolyCore ERP and Hospitality HMS modules serving 200+ clients.',
    icon: 'Building2',
    orderIndex: 1,
    enabled: true,
  },
  {
    year: '2025',
    title: 'AI Platform Launch',
    description: 'Unveiled DezoAI Predictive Sales Engine with autonomous copilot workflows.',
    icon: 'Zap',
    orderIndex: 2,
    enabled: true,
  },
  {
    year: '2026',
    title: 'Global Expansion',
    description: 'Scaled to 10M+ active workflows across global enterprise fleets.',
    icon: 'Globe',
    orderIndex: 3,
    enabled: true,
  },
];

export class TimelineService {
  /**
   * GET ALL TIMELINE MILESTONES
   * PostgreSQL is the only source of truth.
   */
  static async getAll() {
    try {
      const items = await prisma.companyTimeline.findMany({
        orderBy: { orderIndex: 'asc' },
      });
      return items;
    } catch (error) {
      console.error('GET TIMELINE ERROR:', error);
      throw error;
    }
  }

  static async create(payload: TimelineMilestonePayload) {
    try {
      const count = await prisma.companyTimeline.count();
      const newItem = await prisma.companyTimeline.create({
        data: {
          year: payload.year || '2026',
          title: payload.title || 'New Milestone',
          description: payload.description || 'Milestone description',
          icon: payload.icon || 'Rocket',
          orderIndex: payload.orderIndex ?? count,
          enabled: payload.enabled ?? true,
        },
      });

      return newItem;
    } catch (error) {
      console.error('CREATE TIMELINE MILESTONE ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, payload: Partial<TimelineMilestonePayload>) {
    try {
      const updateData: any = { ...payload };
      delete updateData.id;

      const updated = await prisma.companyTimeline.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error) {
      console.error(`UPDATE TIMELINE MILESTONE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.companyTimeline.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error(`DELETE TIMELINE MILESTONE ${id} ERROR:`, error);
      throw error;
    }
  }

  static async saveAll(items: TimelineMilestonePayload[]) {
    try {
      await prisma.companyTimeline.deleteMany({});
      const formattedItems = items.map((item, idx) => ({
        year: item.year || '2026',
        title: item.title || 'New Milestone',
        description: item.description || '',
        icon: item.icon || 'Rocket',
        orderIndex: idx,
        enabled: item.enabled ?? true,
      }));

      await prisma.companyTimeline.createMany({
        data: formattedItems,
      });

      return await prisma.companyTimeline.findMany({ orderBy: { orderIndex: 'asc' } });
    } catch (error) {
      console.error('SAVE ALL TIMELINE MILESTONES ERROR:', error);
      throw error;
    }
  }
}
