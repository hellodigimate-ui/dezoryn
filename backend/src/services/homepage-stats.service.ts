import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

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

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'homepage_stats.json');

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
  } catch (_e) {}
  return null;
};

const writeFileData = (data: any) => {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (_e) {}
};

export class HomepageStatsService {
  static async get() {
    const fileData = readFileData();
    if (fileData) return fileData;

    try {
      if (db.homepageStats) {
        let record = await db.homepageStats.findUnique({ where: { id: 'default' } });
        if (!record) {
          record = await db.homepageStats.create({ data: DEFAULT_HOMEPAGE_STATS });
        }
        writeFileData(record);
        return record;
      }
    } catch (_e) {}

    writeFileData(DEFAULT_HOMEPAGE_STATS);
    return DEFAULT_HOMEPAGE_STATS;
  }

  static async update(payload: HomepageStatsPayload) {
    const existing = await HomepageStatsService.get();

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

    writeFileData(merged);

    try {
      if (db.homepageStats) {
        await db.homepageStats.upsert({
          where: { id: 'default' },
          update: merged,
          create: merged,
        });
      }
    } catch (_e) {}

    return merged;
  }

  static async reset() {
    writeFileData(DEFAULT_HOMEPAGE_STATS);

    try {
      if (db.homepageStats) {
        await db.homepageStats.upsert({
          where: { id: 'default' },
          update: DEFAULT_HOMEPAGE_STATS,
          create: DEFAULT_HOMEPAGE_STATS,
        });
      }
    } catch (_e) {}

    return DEFAULT_HOMEPAGE_STATS;
  }
}
