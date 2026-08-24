import { prisma } from '../config/prisma.config';
import { UpdateHeroInput } from '../schemas/hero.schema';

export const DEFAULT_HERO_DATA = {
  id: 'default',
  badgeText: 'DEZORYN 3.0 ENTERPRISE SUITE',
  badgeIcon: 'Sparkles',
  mainHeading: 'Autonomous Operations for',
  gradientHeading: 'Modern Enterprises',
  description:
    'Dezoryn Technologies unifies ERP, CRM, and AI automation into a single intelligent operating platform. Streamline workflows, scale operations, and boost productivity.',
  primaryBtnText: 'Explore Solution',
  primaryBtnLink: '/products',
  secondaryBtnText: 'Schedule Demo',
  secondaryBtnLink: '/book-demo',
  statsCards: [
    {
      id: 'stat-1',
      label: 'Enterprise Growth',
      value: '4.8x',
      subtext: '+140% YoY',
    },
    {
      id: 'stat-2',
      label: 'Automation Rate',
      value: '99.9%',
      subtext: 'Zero Latency',
    },
    {
      id: 'stat-3',
      label: 'Active Workflows',
      value: '10M+',
      subtext: 'Global Fleet',
    },
  ],
  techTags: [
    'AI Core 3.0',
    'Enterprise ERP',
    'PostgreSQL',
    'React 18',
    'Prisma ORM',
    'JWT RBAC',
  ],
};

export class HeroService {
  /**
   * GET HERO
   * PostgreSQL is the only source of truth.
   */
  public static async getHeroSection() {
    try {
      let hero = await prisma.heroSection.findUnique({
        where: {
          id: 'default',
        },
      });

      if (!hero) {
        hero = await prisma.heroSection.create({
          data: DEFAULT_HERO_DATA,
        });
      }

      return hero;
    } catch (error) {
      console.error('GET HERO ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE HERO
   */
  public static async updateHeroSection(input: UpdateHeroInput) {
    try {
      const updatedHero = await prisma.heroSection.upsert({
        where: {
          id: 'default',
        },

        update: {
          badgeText: input.badgeText,
          badgeIcon: input.badgeIcon,
          mainHeading: input.mainHeading,
          gradientHeading: input.gradientHeading,
          description: input.description,
          primaryBtnText: input.primaryBtnText,
          primaryBtnLink: input.primaryBtnLink,
          secondaryBtnText: input.secondaryBtnText,
          secondaryBtnLink: input.secondaryBtnLink,
          statsCards: input.statsCards,
          techTags: input.techTags,
        },

        create: {
          id: 'default',
          badgeText: input.badgeText,
          badgeIcon: input.badgeIcon,
          mainHeading: input.mainHeading,
          gradientHeading: input.gradientHeading,
          description: input.description,
          primaryBtnText: input.primaryBtnText,
          primaryBtnLink: input.primaryBtnLink,
          secondaryBtnText: input.secondaryBtnText,
          secondaryBtnLink: input.secondaryBtnLink,
          statsCards: input.statsCards,
          techTags: input.techTags,
        },
      });

      console.log('HERO SAVED:', updatedHero.id);

      return updatedHero;
    } catch (error) {
      console.error('UPDATE HERO ERROR:', error);
      throw error;
    }
  }

  /**
   * RESET HERO
   */
  public static async resetHeroSection() {
    try {
      const hero = await prisma.heroSection.upsert({
        where: {
          id: 'default',
        },

        update: {
          badgeText: DEFAULT_HERO_DATA.badgeText,
          badgeIcon: DEFAULT_HERO_DATA.badgeIcon,
          mainHeading: DEFAULT_HERO_DATA.mainHeading,
          gradientHeading: DEFAULT_HERO_DATA.gradientHeading,
          description: DEFAULT_HERO_DATA.description,
          primaryBtnText: DEFAULT_HERO_DATA.primaryBtnText,
          primaryBtnLink: DEFAULT_HERO_DATA.primaryBtnLink,
          secondaryBtnText: DEFAULT_HERO_DATA.secondaryBtnText,
          secondaryBtnLink: DEFAULT_HERO_DATA.secondaryBtnLink,
          statsCards: DEFAULT_HERO_DATA.statsCards,
          techTags: DEFAULT_HERO_DATA.techTags,
        },

        create: DEFAULT_HERO_DATA,
      });

      return hero;
    } catch (error) {
      console.error('RESET HERO ERROR:', error);
      throw error;
    }
  }
}
