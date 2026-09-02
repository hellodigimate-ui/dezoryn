import { prisma } from '../config/prisma.config';

export const DEFAULT_MARKETPLACE_HERO = {
  id: 'default',
  tagline: 'DEZORYN SOFTWARE ECOSYSTEM',
  title1: 'Discover, Deploy & Scale',
  titleGradient: 'Next-Gen SaaS Products',
  description:
    'Dezoryn Technologies builds intelligent digital solutions that connect people, processes and data—helping organizations simplify complex operations, automate workflows and scale with confidence. From enterprise ERP and CRM to industry-focused platforms and automation, we turn complex business requirements into practical, scalable technology.',
  popularTags: ['SchoolyCore', 'HMS Health', 'HRMS Pulse', 'Sales AI', 'InventoryPro'],
  statProducts: '50+',
  statIndustries: '15+',
  statClients: '1000+',
  statUptime: '99.9%',
  statSupport: '24x7',
  hubActiveProducts: '48 / 50',
  hubApiSla: '99.98%',
  hubLatency: 'Avg Latency: 18ms',
  badge1Title: 'SchoolyCore ERP',
  badge1Sub: '★ 4.9 (12k Students)',
  badge2Title: 'HMS Care',
  badge2Sub: 'NABH Ready',
  badge3Title: 'DezoAI Sales Copilot',
  badge3Sub: '99.4% Accuracy',
};

export class MarketplaceHeroService {
  /**
   * GET MARKETPLACE HERO
   * Fetches the hero configuration from PostgreSQL database.
   */
  public static async get() {
    try {
      let hero = await (prisma as any).marketplaceHero.findUnique({
        where: { id: 'default' },
      });

      if (!hero) {
        hero = await (prisma as any).marketplaceHero.create({
          data: DEFAULT_MARKETPLACE_HERO,
        });
      }

      return hero;
    } catch (error) {
      console.error('MarketplaceHero get error:', error);
      return DEFAULT_MARKETPLACE_HERO;
    }
  }

  /**
   * UPDATE MARKETPLACE HERO
   * Updates hero configuration in PostgreSQL database.
   */
  public static async update(payload: any) {
    try {
      const dataToSave = {
        ...payload,
        updatedAt: new Date(),
      };
      delete dataToSave.id;
      delete dataToSave.createdAt;

      const updated = await (prisma as any).marketplaceHero.upsert({
        where: { id: 'default' },
        create: {
          ...DEFAULT_MARKETPLACE_HERO,
          ...dataToSave,
          id: 'default',
        },
        update: dataToSave,
      });

      return updated;
    } catch (error) {
      console.error('MarketplaceHero update error:', error);
      throw error;
    }
  }

  /**
   * RESET MARKETPLACE HERO
   * Resets configuration to clean defaults in PostgreSQL database.
   */
  public static async reset() {
    try {
      const resetData = {
        ...DEFAULT_MARKETPLACE_HERO,
        updatedAt: new Date(),
      };
      delete (resetData as any).id;

      const updated = await (prisma as any).marketplaceHero.upsert({
        where: { id: 'default' },
        create: {
          ...DEFAULT_MARKETPLACE_HERO,
          id: 'default',
        },
        update: resetData,
      });

      return updated;
    } catch (error) {
      console.error('MarketplaceHero reset error:', error);
      throw error;
    }
  }
}
