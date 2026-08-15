import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

let memoryAboutData = { ...DEFAULT_ABOUT };

export class AboutService {
  public static async getAboutSection() {
    try {
      const data = await (prisma as any).aboutSection.findUnique({
        where: { id: 'default' },
      });
      if (data) return data;
    } catch {
      // Return memory fallback if table does not exist yet
    }
    return memoryAboutData;
  }

  public static async updateAboutSection(input: AboutSectionInput) {
    const payload = {
      badge: input.badge ?? memoryAboutData.badge,
      heading: input.heading ?? memoryAboutData.heading,
      descriptionOne: input.descriptionOne ?? memoryAboutData.descriptionOne,
      descriptionTwo: input.descriptionTwo ?? memoryAboutData.descriptionTwo,
      buttonText: input.buttonText ?? memoryAboutData.buttonText,
      buttonUrl: input.buttonUrl ?? memoryAboutData.buttonUrl,
      buttonEnabled: input.buttonEnabled ?? memoryAboutData.buttonEnabled,
      mediaUrl: input.mediaUrl !== undefined ? input.mediaUrl : memoryAboutData.mediaUrl,
      mediaType: input.mediaType ?? memoryAboutData.mediaType,
      mediaId: input.mediaId !== undefined ? input.mediaId : memoryAboutData.mediaId,
      cardEnabled: input.cardEnabled ?? memoryAboutData.cardEnabled,
      cardTitle: input.cardTitle ?? memoryAboutData.cardTitle,
      cardSubtitle: input.cardSubtitle ?? memoryAboutData.cardSubtitle,
      cardLocation: input.cardLocation ?? memoryAboutData.cardLocation,
      cardIcon: input.cardIcon ?? memoryAboutData.cardIcon,
      layoutSettings: input.layoutSettings ?? memoryAboutData.layoutSettings,
      styleSettings: input.styleSettings ?? memoryAboutData.styleSettings,
      animationSettings: input.animationSettings ?? memoryAboutData.animationSettings,
      isDraft: input.isDraft ?? memoryAboutData.isDraft,
    };

    memoryAboutData = { ...memoryAboutData, ...payload };

    try {
      return await (prisma as any).aboutSection.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...payload },
        update: payload,
      });
    } catch {
      return memoryAboutData;
    }
  }

  public static async updateMedia(mediaUrl: string, mediaType: string, mediaId?: string) {
    return this.updateAboutSection({ mediaUrl, mediaType, mediaId });
  }

  public static async removeMedia() {
    return this.updateAboutSection({ mediaUrl: '', mediaType: 'IMAGE', mediaId: '' });
  }
}
