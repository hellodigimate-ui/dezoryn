import { prisma } from '../config/prisma.config';

export interface AboutUsPageConfig {
  storyBadge: string;
  storyHeading: string;
  storyDescription: string;
  storyCtaPrimaryText: string;
  storyCtaPrimaryLink: string;
  storyCtaSecondaryText: string;
  storyCtaSecondaryLink: string;
  storyCtaContactText: string;
  storyCtaContactLink: string;

  missionTitle: string;
  missionDesc: string;
  missionHighlight: string;

  visionTitle: string;
  visionDesc: string;
  visionHighlight: string;

  coreValuesBadge: string;
  coreValuesTitle: string;
  coreValues: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    style?: string;
  }>;

  milestonesBadge: string;
  milestonesTitle: string;
  milestones: Array<{
    id: string;
    year: string;
    title: string;
    desc: string;
    icon?: string;
    enabled?: boolean;
  }>;

  leadershipBadge: string;
  leadershipTitle: string;
  leadership: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
    image?: string;
  }>;

  ctaHeading: string;
  ctaDescription: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

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
  aboutPage?: Partial<AboutUsPageConfig>;
}

export const DEFAULT_ABOUT_PAGE: AboutUsPageConfig = {
  storyBadge: 'THE DEZORYN TECHNOLOGIES STORY & MISSION',
  storyHeading: 'Building the Future of Enterprise Software Intelligence',
  storyDescription: 'Dezoryn Technologies delivers next-generation predictive CRM, SchoolyCore ERP, Hospitality HMS, and Inventory management software designed for international scale.',
  storyCtaPrimaryText: 'Explore Products Suite',
  storyCtaPrimaryLink: '/products',
  storyCtaSecondaryText: 'Book a Live Demo',
  storyCtaSecondaryLink: '/book-demo',
  storyCtaContactText: 'Contact Us',
  storyCtaContactLink: '/contact-sales',

  missionTitle: 'Our Mission',
  missionDesc: 'To empower modern revenue, education, and healthcare institutions with autonomous AI workflows that automate routine administration, score opportunities in real time, and eliminate operational bottlenecks.',
  missionHighlight: '10x Operational Efficiency Target',

  visionTitle: 'Our Vision',
  visionDesc: 'To build a single, unified global software cloud where sales intelligence, ERP resource planning, and multi-location management operate seamlessly with bank-grade security and zero latency.',
  visionHighlight: 'Global 24/7 Unified Cloud Infrastructure',

  coreValuesBadge: 'WHAT DRIVES US',
  coreValuesTitle: 'Our Core Principles',
  coreValues: [
    {
      id: 'val-1',
      title: 'Customer-Centric Innovation',
      desc: 'We engineer tools around real operational challenges to deliver 10x ROI for revenue and management teams.',
      icon: 'Zap',
      style: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
    },
    {
      id: 'val-2',
      title: 'Uncompromised Security',
      desc: 'SOC2 Type II, GDPR compliance, and 256-bit encryption are baked into every layer of our architecture.',
      icon: 'ShieldCheck',
      style: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
    },
    {
      id: 'val-3',
      title: 'Predictive Intelligence',
      desc: 'Moving from reactive record-keeping to proactive, ML-driven funnel and operational recommendations.',
      icon: 'TrendingUp',
      style: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30'
    },
    {
      id: 'val-4',
      title: 'Global Scale & Reliability',
      desc: 'Financially backed 99.99% uptime SLA across multi-region cloud infrastructure worldwide.',
      icon: 'Globe',
      style: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
    }
  ],

  milestonesBadge: 'OUR JOURNEY',
  milestonesTitle: 'Company Milestones',
  milestones: [
    {
      id: 'mile-1',
      year: '2023',
      title: 'Founded',
      desc: 'Started with a vision to unify ERP, CRM, and AI operations into a single intelligent platform.',
      icon: 'Sparkles',
      enabled: true
    },
    {
      id: 'mile-2',
      year: '2024',
      title: 'First Enterprise Client',
      desc: 'Onboarded Fortune 500 partners and launched multi-tenant data pipelines.',
      icon: 'Building2',
      enabled: true
    },
    {
      id: 'mile-3',
      year: '2025',
      title: 'AI Platform Launch',
      desc: 'Unveiled DezoAI Predictive Sales Engine with autonomous copilot workflows.',
      icon: 'Zap',
      enabled: true
    },
    {
      id: 'mile-4',
      year: '2026',
      title: 'Global Expansion',
      desc: 'Scaled to 10M+ active workflows across global enterprise fleets.',
      icon: 'Globe',
      enabled: true
    }
  ],

  leadershipBadge: 'EXECUTIVE LEADERSHIP',
  leadershipTitle: 'Meet the Minds Behind Dezoryn Technologies',
  leadership: [
    {
      id: 'lead-1',
      name: 'David Vance',
      role: 'Co-Founder & CEO',
      bio: 'Former VP of Product at Salesforce with 15+ years experience building enterprise SaaS platforms.',
      avatar: 'DV',
      image: ''
    },
    {
      id: 'lead-2',
      name: 'Dr. Elena Rostova',
      role: 'Chief AI Architect',
      bio: 'Ph.D. in Machine Learning from MIT, leading our proprietary lead scoring & forecasting algorithms.',
      avatar: 'ER',
      image: ''
    },
    {
      id: 'lead-3',
      name: 'Marcus Thorne',
      role: 'Head of Global Sales',
      bio: 'Scales high-performing sales engineering teams across North America, Europe, and Asia-Pacific.',
      avatar: 'MT',
      image: ''
    },
    {
      id: 'lead-4',
      name: 'Priya Sharma',
      role: 'VP of Customer Success',
      bio: 'Ensures seamless onboarding, custom integrations, and 15-minute SLA support for global accounts.',
      avatar: 'PS',
      image: ''
    }
  ],

  ctaHeading: 'Ready to Explore Our Enterprise Products?',
  ctaDescription: 'Take a personalized tour of Dezoryn Technologies, SchoolyCore, HMS, and InventoryPro with our engineering team.',
  ctaPrimaryText: 'Explore Products',
  ctaPrimaryLink: '/products',
  ctaSecondaryText: 'Book a Live Demo',
  ctaSecondaryLink: '/book-demo'
};

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
    aboutPage: DEFAULT_ABOUT_PAGE,
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

      const rawLayout = (about.layoutSettings as any) || {};
      const storedAboutPage = rawLayout.aboutPage || {};
      const aboutPage = {
        ...DEFAULT_ABOUT_PAGE,
        ...storedAboutPage,
        coreValues: Array.isArray(storedAboutPage.coreValues)
          ? storedAboutPage.coreValues
          : DEFAULT_ABOUT_PAGE.coreValues,
        milestones: Array.isArray(storedAboutPage.milestones)
          ? storedAboutPage.milestones
          : DEFAULT_ABOUT_PAGE.milestones,
        leadership: Array.isArray(storedAboutPage.leadership)
          ? storedAboutPage.leadership
          : DEFAULT_ABOUT_PAGE.leadership,
      };

      return {
        ...about,
        aboutPage,
      };
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
      const existing = await prisma.aboutSection.findUnique({
        where: { id: 'default' },
      });
      const safeExisting = existing || DEFAULT_ABOUT;
      const existingLayout = (safeExisting.layoutSettings as any) || {};
      const existingAboutPage = existingLayout.aboutPage || DEFAULT_ABOUT_PAGE;

      let newAboutPage = {
        ...DEFAULT_ABOUT_PAGE,
        ...existingAboutPage,
      };

      if (input.aboutPage) {
        newAboutPage = {
          ...newAboutPage,
          ...input.aboutPage,
        };
      }

      const mergedLayout = {
        ...existingLayout,
        ...(input.layoutSettings || {}),
        aboutPage: newAboutPage,
      };

      const payload: any = {
        badge: input.badge !== undefined ? input.badge : safeExisting.badge,
        heading: input.heading !== undefined ? input.heading : safeExisting.heading,
        descriptionOne: input.descriptionOne !== undefined ? input.descriptionOne : safeExisting.descriptionOne,
        descriptionTwo: input.descriptionTwo !== undefined ? input.descriptionTwo : safeExisting.descriptionTwo,
        buttonText: input.buttonText !== undefined ? input.buttonText : safeExisting.buttonText,
        buttonUrl: input.buttonUrl !== undefined ? input.buttonUrl : safeExisting.buttonUrl,
        buttonEnabled: input.buttonEnabled !== undefined ? input.buttonEnabled : safeExisting.buttonEnabled,
        mediaUrl: input.mediaUrl !== undefined ? input.mediaUrl : safeExisting.mediaUrl,
        mediaType: input.mediaType !== undefined ? input.mediaType : safeExisting.mediaType,
        mediaId: input.mediaId !== undefined ? input.mediaId : safeExisting.mediaId,
        cardEnabled: input.cardEnabled !== undefined ? input.cardEnabled : safeExisting.cardEnabled,
        cardTitle: input.cardTitle !== undefined ? input.cardTitle : safeExisting.cardTitle,
        cardSubtitle: input.cardSubtitle !== undefined ? input.cardSubtitle : safeExisting.cardSubtitle,
        cardLocation: input.cardLocation !== undefined ? input.cardLocation : safeExisting.cardLocation,
        cardIcon: input.cardIcon !== undefined ? input.cardIcon : safeExisting.cardIcon,
        layoutSettings: mergedLayout,
        styleSettings: input.styleSettings !== undefined ? input.styleSettings : safeExisting.styleSettings,
        animationSettings: input.animationSettings !== undefined ? input.animationSettings : safeExisting.animationSettings,
        isDraft: input.isDraft !== undefined ? input.isDraft : safeExisting.isDraft,
        updatedAt: new Date(),
      };

      const updated = await prisma.aboutSection.upsert({
        where: { id: 'default' },
        create: { ...payload, id: 'default' },
        update: payload,
      });

      // Synchronize milestones to company_timeline if provided
      if (input.aboutPage?.milestones && Array.isArray(input.aboutPage.milestones)) {
        try {
          await prisma.companyTimeline.deleteMany({});
          const timelineEntries = input.aboutPage.milestones.map((m, idx) => ({
            year: m.year || '2026',
            title: m.title || 'Milestone',
            description: m.desc || '',
            icon: m.icon || 'Rocket',
            orderIndex: idx,
            enabled: m.enabled !== false,
          }));
          if (timelineEntries.length > 0) {
            await prisma.companyTimeline.createMany({
              data: timelineEntries,
            });
          }
        } catch (_timelineErr) {
          console.warn('Failed to auto-sync company timeline:', _timelineErr);
        }
      }

      return {
        ...updated,
        aboutPage: newAboutPage,
      };
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

