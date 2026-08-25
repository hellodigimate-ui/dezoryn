import { prisma } from '../config/prisma.config';

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

export const DEFAULT_ABOUT: AboutSectionInput & { id: string; mediaUrl: string | null; mediaId: string | null } = {
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
  /**
   * GET ABOUT SECTION
   * PostgreSQL is the only source of truth.
   */
  public static async getAboutSection() {
    try {
      let about = await prisma.aboutSection.findUnique({
        where: { id: 'default' },
      });

      if (!about) {
        about = await prisma.aboutSection.create({
          data: DEFAULT_ABOUT,
        });
      }

      return about;
    } catch (error) {
      console.error('GET ABOUT SECTION ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE ABOUT SECTION
   */
  public static async updateAboutSection(input: AboutSectionInput) {
    try {
      const existing = await this.getAboutSection();
      const payload = {
        ...existing,
        ...input,
        updatedAt: new Date(),
      };

      const updated = await prisma.aboutSection.upsert({
        where: { id: 'default' },
        create: payload,
        update: payload,
      });

      return updated;
    } catch (error) {
      console.error('UPDATE ABOUT SECTION ERROR:', error);
      throw error;
    }
  }

  public static async updateMedia(mediaUrl: string, mediaType: string, mediaId?: string) {
    return this.updateAboutSection({ mediaUrl, mediaType, mediaId });
  }

  public static async removeMedia() {
    return this.updateAboutSection({ mediaUrl: '', mediaType: 'IMAGE', mediaId: '' });
  }
}
