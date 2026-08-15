import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.config';
import { UpdateHeroInput } from '../schemas/hero.schema';

export const DEFAULT_HERO_DATA = {
  id: 'default',
  badgeText: 'DEZORYN 3.0 ENTERPRISE SUITE',
  badgeIcon: 'Sparkles',
  mainHeading: 'Autonomous Operations for',
  gradientHeading: 'Modern Enterprises',
  description: 'Dezoryn Technologies unifies ERP, CRM, and AI automation into a single intelligent operating platform. Streamline workflows, scale operations, and boost productivity.',
  primaryBtnText: 'Explore Solution',
  primaryBtnLink: '/products',
  secondaryBtnText: 'Schedule Demo',
  secondaryBtnLink: '/book-demo',
  statsCards: [
    { id: 'stat-1', label: 'Enterprise Growth', value: '4.8x', subtext: '+140% YoY' },
    { id: 'stat-2', label: 'Automation Rate', value: '99.9%', subtext: 'Zero Latency' },
    { id: 'stat-3', label: 'Active Workflows', value: '10M+', subtext: 'Global Fleet' },
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

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'hero.json');

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readFileData = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (_e) {
    // fallback
  }
  return null;
};

const writeFileData = (data: any) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {
    // fallback
  }
};

export class HeroService {
  public static async getHeroSection() {
    // 1. Check disk file store
    const fileData = readFileData();
    if (fileData) {
      return fileData;
    }

    // 2. Fallback to Prisma database
    try {
      let hero = await (prisma as any).heroSection.findUnique({
        where: { id: 'default' },
      });

      if (!hero) {
        hero = await (prisma as any).heroSection.create({
          data: DEFAULT_HERO_DATA,
        });
      }

      writeFileData(hero);
      return hero;
    } catch (_error) {
      return DEFAULT_HERO_DATA;
    }
  }

  public static async updateHeroSection(input: UpdateHeroInput) {
    const updatedData = { ...DEFAULT_HERO_DATA, ...input };

    // 1. Write to persistent JSON store
    writeFileData(updatedData);

    // 2. Upsert in PostgreSQL database
    try {
      await (prisma as any).heroSection.upsert({
        where: { id: 'default' },
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
    } catch (_error) {
      // JSON backup is saved
    }

    return updatedData;
  }

  public static async resetHeroSection() {
    writeFileData(DEFAULT_HERO_DATA);

    try {
      await (prisma as any).heroSection.upsert({
        where: { id: 'default' },
        update: DEFAULT_HERO_DATA,
        create: DEFAULT_HERO_DATA,
      });
    } catch (_error) {
      // ignore
    }

    return DEFAULT_HERO_DATA;
  }
}
