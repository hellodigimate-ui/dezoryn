import { prisma } from '../config/prisma.config';

export interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
  displayOrder: number;
  enabled: boolean;
  route?: string;
}

export interface HomepageStatsPayload {
  statsEnabled?: boolean;
  aiAssistantEnabled?: boolean;
  aiAssistantTitle?: string;
  aiAssistantGreeting?: string;
  aiAssistantButtonLabel?: string;
  aiAssistantButtonLink?: string;
  stats?: StatItem[];
}

export const DEFAULT_HOMEPAGE_STATS = {
  id: 'default',
  statsEnabled: true,
  aiAssistantEnabled: true,
  aiAssistantTitle: 'AI Assistant',
  aiAssistantGreeting: 'Hello! How can I help you today?',
  aiAssistantButtonLabel: 'Chat Now',
  aiAssistantButtonLink: '/chat',
  stats: [
    { id: 'stat-1', label: 'Year Established', value: '2023', icon: 'Calendar', displayOrder: 0, enabled: true, route: '/about' },
    { id: 'stat-2', label: 'Happy Users', value: '10,000+', icon: 'Users', displayOrder: 1, enabled: true, route: '/about' },
    { id: 'stat-3', label: 'Clients', value: '100+', icon: 'Building2', displayOrder: 2, enabled: true, route: '/about' },
    { id: 'stat-4', label: 'Products', value: '15+', icon: 'Layers', displayOrder: 3, enabled: true, route: '/marketplace' },
    { id: 'stat-5', label: 'Support', value: '24/7', icon: 'Headphones', displayOrder: 4, enabled: true, route: '/contact-sales' },
    { id: 'stat-6', label: 'Uptime', value: '99.9%', icon: 'ShieldCheck', displayOrder: 5, enabled: true, route: '/about' },
  ],
};

export class HomepageStatsService {
  /**
   * GET HOMEPAGE STATS
   * PostgreSQL is the only source of truth.
   */
  static async get() {
    try {
      let record = await prisma.homepageStats.findUnique({
        where: { id: 'default' },
      });

      if (!record) {
        record = await prisma.homepageStats.create({
          data: DEFAULT_HOMEPAGE_STATS,
        });
      }

      return record;
    } catch (error) {
      console.error('GET HOMEPAGE STATS ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE HOMEPAGE STATS
   */
  static async update(payload: HomepageStatsPayload) {
    try {
      const existing: any = await HomepageStatsService.get();

      const merged = {
        id: 'default',
        statsEnabled: payload.statsEnabled ?? existing.statsEnabled ?? DEFAULT_HOMEPAGE_STATS.statsEnabled,
        aiAssistantEnabled: payload.aiAssistantEnabled ?? existing.aiAssistantEnabled ?? DEFAULT_HOMEPAGE_STATS.aiAssistantEnabled,
        aiAssistantTitle: payload.aiAssistantTitle ?? existing.aiAssistantTitle ?? DEFAULT_HOMEPAGE_STATS.aiAssistantTitle,
        aiAssistantGreeting: payload.aiAssistantGreeting ?? existing.aiAssistantGreeting ?? DEFAULT_HOMEPAGE_STATS.aiAssistantGreeting,
        aiAssistantButtonLabel: payload.aiAssistantButtonLabel ?? existing.aiAssistantButtonLabel ?? DEFAULT_HOMEPAGE_STATS.aiAssistantButtonLabel,
        aiAssistantButtonLink: payload.aiAssistantButtonLink ?? existing.aiAssistantButtonLink ?? DEFAULT_HOMEPAGE_STATS.aiAssistantButtonLink,
        stats: payload.stats ?? existing.stats ?? DEFAULT_HOMEPAGE_STATS.stats,
      };

      const updated = await prisma.homepageStats.upsert({
        where: { id: 'default' },
        create: merged,
        update: merged,
      });

      return updated;
    } catch (error) {
      console.error('UPDATE HOMEPAGE STATS ERROR:', error);
      throw error;
    }
  }

  /**
   * RESET HOMEPAGE STATS
   */
  static async reset() {
    try {
      const resetRecord = await prisma.homepageStats.upsert({
        where: { id: 'default' },
        create: DEFAULT_HOMEPAGE_STATS,
        update: DEFAULT_HOMEPAGE_STATS,
      });

      return resetRecord;
    } catch (error) {
      console.error('RESET HOMEPAGE STATS ERROR:', error);
      throw error;
    }
  }
}
