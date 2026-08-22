import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'about.json');

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

export interface AboutSectionInput {
  badge?: string;
  heading?: string;
  descriptionOne?: string;
  descriptionTwo?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonEnabled?: boolean;
  mediaUrl?: string | null;
  mediaType?: string; // "IMAGE" | "VIDEO"
  mediaId?: string | null;
  cardEnabled?: boolean;
  cardTitle?: string;
  cardSubtitle?: string;
  cardLocation?: string;
  cardIcon?: string;
  layoutSettings?: any;
  styleSettings?: any;
  animationSettings?: any;
  isDraft?: boolean;
}

const DEFAULT_ABOUT: AboutSectionInput & { id: string; mediaUrl: string | null; mediaId: string | null } = {
  id: 'default',
  badge: 'ABOUT DEZORYN TECHNOLOGIES',
  heading: 'Empowering Modern Enterprises with Intelligent Automation',
  descriptionOne: 'Dezoryn Technologies is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products. We engineer unified platforms that automate complex workflows, optimize resource allocation, and drive sustainable growth.',
  descriptionTwo: 'Our mission is to replace fragmented software ecosystems with intelligent, high-performance technology hubs built for scalability, bank-grade security, and seamless multi-channel integration.',
  buttonText: 'Discover Our Ecosystem',
  buttonUrl: '/products',
  buttonEnabled: true,
  mediaUrl: null,
  mediaType: 'IMAGE',
  mediaId: null,
  cardEnabled: true,
  cardTitle: 'Global Enterprise HQ',
  cardSubtitle: 'Innovation Center',
  cardLocation: 'San Francisco, CA',
  cardIcon: 'Globe',
  layoutSettings: {
    imagePosition: 'right',
    imageWidth: '100%',
    imageHeight: 'auto',
    borderRadius: '1.5rem',
    padding: '5rem 1rem',
    columnGap: '3rem',
    verticalAlign: 'center',
  },
  styleSettings: {
    bgColor: 'transparent',
    accentColor: '#06b6d4',
    headingColor: '#ffffff',
    paragraphColor: '#94a3b8',
    overlayOpacity: 0.2,
  },
  animationSettings: {
    fadeEnabled: true,
    slideEnabled: true,
    scaleEnabled: false,
    duration: 0.6,
    delay: 0.2,
  },
  isDraft: false,
};

export class AboutService {
  public static async getAboutSection() {
    const fileData = readFileData();
    if (fileData) return fileData;

    try {
      const data = await (prisma as any).aboutSection.findUnique({
        where: { id: 'default' },
      });
      if (data) {
        writeFileData(data);
        return data;
      }
    } catch (_e) {}

    writeFileData(DEFAULT_ABOUT);
    return DEFAULT_ABOUT;
  }

  public static async updateAboutSection(input: AboutSectionInput) {
    const existing = await AboutService.getAboutSection();
    const payload = {
      ...existing,
      ...input,
    };

    writeFileData(payload);

    try {
      await (prisma as any).aboutSection.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...payload },
        update: payload,
      });
    } catch (_e) {}

    return payload;
  }

  public static async updateMedia(mediaUrl: string, mediaType: string, mediaId?: string) {
    return this.updateAboutSection({ mediaUrl, mediaType, mediaId });
  }

  public static async removeMedia() {
    return this.updateAboutSection({ mediaUrl: '', mediaType: 'IMAGE', mediaId: '' });
  }
}

