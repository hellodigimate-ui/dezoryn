import { prisma } from '../config/prisma.config';

export const DEFAULT_CAREERS_CMS = {
  hero: {
    badgeText: 'Careers at Dezoryn Technologies',
    headlinePrefix: 'Build the Future of',
    gradientWords: 'Enterprise AI, Predictive Automation & Campus Technology',
    description: 'Dezoryn Technologies builds autonomous AI agent infrastructure, enterprise CRM platforms, and campus ERP management suites powering institutions worldwide.',
    viewPositionsBtnText: 'View Open Positions',
    lifeAtDezorynBtnText: 'Life at Dezoryn',
    stats: [
      { label: 'Employees', target: 150, suffix: '+', decimals: 0 },
      { label: 'Countries', target: 15, suffix: '', decimals: 0 },
      { label: 'Employee Rating', target: 4.9, suffix: ' / 5.0', decimals: 1 },
      { label: 'Retention Rate', target: 96, suffix: '%', decimals: 0 }
    ],
    engineVersion: 'DezoAI Engine v4.2',
    engineStatus: 'Multi-Tenant Cluster Active',
    engineLatency: '12ms Latency',
    vectorQPS: '2.4M QPS',
    accuracySLA: '99.8% SLA',
    employeeBadge1: {
      name: 'Anya Sharma',
      role: 'Principal AI Architect',
      location: 'San Francisco, US',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    employeeBadge2: {
      name: 'David Chen',
      role: 'Lead Systems Engineer',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    }
  },
  whyJoin: {
    badgeText: 'CULTURE & BENEFITS',
    title: 'Why Join Dezoryn Technologies?',
    subtitle: 'We empower world-class builders with top-tier compensation, complete autonomy, frontier AI research tools, and unmatched work-life balance.',
    benefits: [
      {
        id: 'b1',
        iconName: 'Globe',
        title: 'Remote First',
        desc: 'Work from anywhere in the world with flexible core hours, asynchronous workflows, and home office stipends.',
        gradient: 'from-cyan-500 to-blue-600',
        badge: 'FLEXIBLE WORK'
      },
      {
        id: 'b2',
        iconName: 'Brain',
        title: 'AI Research',
        desc: 'Pioneer novel multi-agent LLM systems, autonomous copilot engines, and domain-fine-tuned model architectures.',
        gradient: 'from-purple-500 to-indigo-600',
        badge: 'FRONTIER LABS'
      },
      {
        id: 'b3',
        iconName: 'GraduationCap',
        title: 'Learning Budget',
        desc: '₹1,60,000 annual stipend for technical courses, books, certifications, and international tech conferences.',
        gradient: 'from-emerald-500 to-teal-600',
        badge: 'GROWTH STIPEND'
      },
      {
        id: 'b4',
        iconName: 'DollarSign',
        title: 'Competitive Salary',
        desc: 'Top-tier base pay benchmarked to tier-1 markets, plus high-upside equity stock options in high-growth SaaS.',
        gradient: 'from-amber-500 to-orange-600',
        badge: 'EQUITY & BONUSES'
      },
      {
        id: 'b5',
        iconName: 'HeartPulse',
        title: 'Health Insurance',
        desc: '100% company-covered medical, dental, and vision insurance for you and your dependents with wellness perks.',
        gradient: 'from-rose-500 to-pink-600',
        badge: 'FULL COVERAGE'
      },
      {
        id: 'b6',
        iconName: 'TrendingUp',
        title: 'Career Growth',
        desc: 'Clear, merit-based promotion tracks, 1-on-1 executive mentorship, and leadership fast-track pathways.',
        gradient: 'from-blue-600 to-cyan-400',
        badge: 'LEADERSHIP PATH'
      },
      {
        id: 'b7',
        iconName: 'Laptop',
        title: 'Latest Hardware',
        desc: 'Brand-new M3 Max MacBook Pro, dual 4K monitors, ergonomic setup, and hardware upgrade cycle every 2 years.',
        gradient: 'from-indigo-500 to-purple-600',
        badge: 'TOP GEAR'
      },
      {
        id: 'b8',
        iconName: 'Palmtree',
        title: 'Annual Retreats',
        desc: 'All-expenses-paid annual team retreats in tropical destinations like Bali, Lisbon, and Costa Rica.',
        gradient: 'from-emerald-400 to-cyan-500',
        badge: 'WORLD RETREATS'
      }
    ]
  },
  teamsSection: {
    badgeText: 'ORGANIZATION & DEPARTMENTS',
    title: 'Meet Our Teams',
    subtitle: 'Discover the interdisciplinary teams crafting the next generation of autonomous enterprise software and campus technology.',
    teams: [
      {
        id: 'engineering',
        name: 'Engineering',
        iconName: 'Code2',
        desc: 'Architect high-throughput multi-tenant SaaS platforms, distributed vector databases, and real-time CRM pipelines.',
        teamSize: '45+ Engineers',
        openings: 4,
        gradient: 'from-blue-600 to-cyan-500',
        color: 'text-cyan-400',
        borderColor: 'hover:border-cyan-500/50'
      },
      {
        id: 'ai-research',
        name: 'AI Research',
        iconName: 'Brain',
        desc: 'Pioneer novel autonomous agentic frameworks, fine-tune open-weights models, and push commercial LLM boundaries.',
        teamSize: '18+ Scientists',
        openings: 2,
        gradient: 'from-purple-600 to-indigo-500',
        color: 'text-purple-400',
        borderColor: 'hover:border-purple-500/50'
      },
      {
        id: 'product',
        name: 'Product',
        iconName: 'Layers',
        desc: 'Define feature roadmaps, bridge deep technical capabilities with user empathy, and scale enterprise product strategy.',
        teamSize: '14+ PMs',
        openings: 3,
        gradient: 'from-cyan-500 to-teal-500',
        color: 'text-cyan-300',
        borderColor: 'hover:border-cyan-400/50'
      },
      {
        id: 'design',
        name: 'Design',
        iconName: 'Palette',
        desc: 'Craft intuitive 3D visualizations, sleek glassmorphism UI components, micro-interactions, and design systems.',
        teamSize: '12+ Designers',
        openings: 2,
        gradient: 'from-pink-500 to-rose-500',
        color: 'text-pink-400',
        borderColor: 'hover:border-pink-500/50'
      },
      {
        id: 'sales',
        name: 'Sales',
        iconName: 'Briefcase',
        desc: 'Partner with Fortune 500 decision-makers and global universities to deploy Dezoryn enterprise SaaS suites.',
        teamSize: '35+ Sales Reps',
        openings: 5,
        gradient: 'from-amber-500 to-orange-500',
        color: 'text-amber-400',
        borderColor: 'hover:border-amber-500/50'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        iconName: 'Megaphone',
        desc: 'Drive global developer brand awareness, technical content strategies, product launches, and demand gen.',
        teamSize: '16+ Marketers',
        openings: 2,
        gradient: 'from-emerald-500 to-green-500',
        color: 'text-emerald-400',
        borderColor: 'hover:border-emerald-500/50'
      },
      {
        id: 'customer-success',
        name: 'Customer Success',
        iconName: 'Headphones',
        desc: 'Ensure zero-friction enterprise onboarding, campus IT integrations, 99.99% uptime compliance, and user adoption.',
        teamSize: '22+ Specialists',
        openings: 3,
        gradient: 'from-indigo-600 to-blue-500',
        color: 'text-indigo-400',
        borderColor: 'hover:border-indigo-500/50'
      },
      {
        id: 'operations',
        name: 'Operations',
        iconName: 'Settings',
        desc: 'Empower our global remote team with seamless people ops, talent acquisition, legal compliance, and finance infrastructure.',
        teamSize: '10+ Ops Leaders',
        openings: 1,
        gradient: 'from-violet-600 to-purple-500',
        color: 'text-violet-400',
        borderColor: 'hover:border-violet-500/50'
      }
    ]
  },
  gallerySection: {
    badgeText: 'CULTURE & MOMENTS',
    title: 'Life Behind the Screens',
    subtitle: 'From global hackathons to international retreats, explore the culture, moments, and people that make Dezoryn extraordinary.',
    items: [
      {
        id: 'office',
        title: 'San Francisco HQ & Glass Hubs',
        category: 'OFFICE ENVIRONMENT',
        tag: 'Office',
        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        desc: 'State-of-the-art workstations, ergonomic setup, and high-speed fiber internet.'
      },
      {
        id: 'hackathons',
        title: '24-Hour Agentic AI Hackathon',
        category: 'INNOVATION',
        tag: 'Hackathons',
        img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        desc: 'Engineers & researchers competing to build autonomous agentic tools overnight.'
      },
      {
        id: 'workshops',
        title: 'LLM Architecture & Fine-Tuning Workshops',
        category: 'LEARNING',
        tag: 'Workshops',
        img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
        desc: 'Weekly knowledge-sharing sessions on distributed systems and RLHF fine-tuning.'
      },
      {
        id: 'retreats',
        title: 'Annual Team Retreat in Bali',
        category: 'CULTURE & TRAVEL',
        tag: 'Retreats',
        img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        desc: 'Connecting our global remote team in tropical paradise for bonding & surfing.'
      },
      {
        id: 'collaboration',
        title: 'Whiteboard Product Brainstorming',
        category: 'TEAMWORK',
        tag: 'Collaboration',
        img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
        desc: 'Cross-functional teams sketching UX wireframes and backend data schemas together.'
      },
      {
        id: 'presentations',
        title: 'Global Tech Keynote & Demo Day',
        category: 'KEYNOTE',
        tag: 'Presentations',
        img: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        desc: 'Unveiling new Dezoryn AI Copilot capabilities live to enterprise leaders.'
      },
      {
        id: 'team-lunch',
        title: 'Friday Global Team Lunch',
        category: 'SOCIAL',
        tag: 'Team Lunch',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        desc: 'Catered gourmet meals, coffee chats, and casual team hangouts across hubs.'
      },
      {
        id: 'celebrations',
        title: 'Series B & Product Release Milestone',
        category: 'CELEBRATIONS',
        tag: 'Celebrations',
        img: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
        desc: 'Popping champagne and celebrating major product shipping milestones together.'
      }
    ]
  }
};

export class CareersCMSService {
  /**
   * GET CAREERS CMS CONFIGURATION
   */
  static async get() {
    try {
      let record = await prisma.careersCMS.findUnique({
        where: { id: 'default' },
      });

      if (!record) {
        record = await prisma.careersCMS.create({
          data: {
            id: 'default',
            hero: DEFAULT_CAREERS_CMS.hero,
            whyJoin: DEFAULT_CAREERS_CMS.whyJoin,
            teamsSection: DEFAULT_CAREERS_CMS.teamsSection,
            gallerySection: DEFAULT_CAREERS_CMS.gallerySection,
          },
        });
      }

      return {
        hero: (record.hero as any) || DEFAULT_CAREERS_CMS.hero,
        whyJoin: (record.whyJoin as any) || DEFAULT_CAREERS_CMS.whyJoin,
        teamsSection: (record.teamsSection as any) || DEFAULT_CAREERS_CMS.teamsSection,
        gallerySection: (record.gallerySection as any) || DEFAULT_CAREERS_CMS.gallerySection,
      };
    } catch (error) {
      console.error('GET CAREERS CMS ERROR:', error);
      return DEFAULT_CAREERS_CMS;
    }
  }

  /**
   * UPDATE CAREERS CMS CONFIGURATION
   */
  static async update(data: any) {
    try {
      const current = await this.get();
      const updatedHero = data.hero ? { ...current.hero, ...data.hero } : current.hero;
      const updatedWhyJoin = data.whyJoin ? { ...current.whyJoin, ...data.whyJoin } : current.whyJoin;
      const updatedTeams = data.teamsSection ? { ...current.teamsSection, ...data.teamsSection } : current.teamsSection;
      const updatedGallery = data.gallerySection ? { ...current.gallerySection, ...data.gallerySection } : current.gallerySection;

      const record = await prisma.careersCMS.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          hero: updatedHero,
          whyJoin: updatedWhyJoin,
          teamsSection: updatedTeams,
          gallerySection: updatedGallery,
        },
        update: {
          hero: updatedHero,
          whyJoin: updatedWhyJoin,
          teamsSection: updatedTeams,
          gallerySection: updatedGallery,
        },
      });

      return {
        hero: record.hero,
        whyJoin: record.whyJoin,
        teamsSection: record.teamsSection,
        gallerySection: record.gallerySection,
      };
    } catch (error) {
      console.error('UPDATE CAREERS CMS ERROR:', error);
      throw error;
    }
  }

  /**
   * RESET CAREERS CMS TO DEFAULTS
   */
  static async reset() {
    try {
      const record = await prisma.careersCMS.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          hero: DEFAULT_CAREERS_CMS.hero,
          whyJoin: DEFAULT_CAREERS_CMS.whyJoin,
          teamsSection: DEFAULT_CAREERS_CMS.teamsSection,
          gallerySection: DEFAULT_CAREERS_CMS.gallerySection,
        },
        update: {
          hero: DEFAULT_CAREERS_CMS.hero,
          whyJoin: DEFAULT_CAREERS_CMS.whyJoin,
          teamsSection: DEFAULT_CAREERS_CMS.teamsSection,
          gallerySection: DEFAULT_CAREERS_CMS.gallerySection,
        },
      });

      return {
        hero: record.hero,
        whyJoin: record.whyJoin,
        teamsSection: record.teamsSection,
        gallerySection: record.gallerySection,
      };
    } catch (error) {
      console.error('RESET CAREERS CMS ERROR:', error);
      throw error;
    }
  }
}
