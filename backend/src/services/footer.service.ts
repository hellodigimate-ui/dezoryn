import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

export interface FooterSettingsPayload {
  companyDescription?: string;
  footerLogo?: string;
  footerLinks?: any;
  socialLinks?: any;
  copyrightText?: string;
  legalLinks?: any;
  supportLinks?: any;
}

const DEFAULT_FOOTER = {
  id: 'default',
  companyDescription: 'Dezoryn Technologies Pvt. Ltd. is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products.',
  footerLogo: 'Dezoryn Technologies',
  footerLinks: [
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Our Leadership', url: '/about' },
        { label: 'Careers & Hiring', url: '/careers' },
        { label: 'Contact Us', url: '/contact-sales' },
      ],
    },
    {
      title: 'SOLUTIONS',
      links: [
        { label: 'DezoAI Sales Copilot', url: '/products' },
        { label: 'Enterprise Lead Scoring', url: '/products' },
        { label: 'Pricing Plans', url: '/pricing' },
        { label: 'Book Live Demo', url: '/book-demo' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: 'Contact Us', url: '/contact-sales' },
        { label: 'Product FAQs', url: '/products' },
        { label: 'Interactive Walkthrough', url: '/book-demo' },
      ],
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/company/dezoryn',
    twitter: 'https://twitter.com/dezoryn',
    github: 'https://github.com/dezoryn',
    youtube: 'https://youtube.com/@dezoryn',
    instagram: 'https://instagram.com/dezoryn',
    facebook: 'https://facebook.com/dezoryn',
  },
  copyrightText: 'Dezoryn Technologies Pvt. Ltd. All Rights Reserved.',
  legalLinks: [
    { label: 'Privacy Policy', url: '/contact-sales' },
    { label: 'Terms & Conditions', url: '/contact-sales' },
    { label: 'Security Policy', url: '/contact-sales' },
  ],
  supportLinks: [
    { label: '24/7 SLA Support', url: '/contact-sales' },
    { label: 'Help Center', url: '/products' },
    { label: 'System Status', url: '/products' },
  ],
};

async function seedDefaultFooterRaw() {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO footer_settings (id, "companyDescription", "footerLogo", "footerLinks", "socialLinks", "copyrightText", "legalLinks", "supportLinks", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7::jsonb, $8::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      DEFAULT_FOOTER.id,
      DEFAULT_FOOTER.companyDescription,
      DEFAULT_FOOTER.footerLogo,
      JSON.stringify(DEFAULT_FOOTER.footerLinks),
      JSON.stringify(DEFAULT_FOOTER.socialLinks),
      DEFAULT_FOOTER.copyrightText,
      JSON.stringify(DEFAULT_FOOTER.legalLinks),
      JSON.stringify(DEFAULT_FOOTER.supportLinks)
    );
  } catch {
    // ignore
  }
}

export class FooterService {
  static async get() {
    try {
      if (db.footerSettings) {
        let settings = await db.footerSettings.findUnique({ where: { id: 'default' } });
        if (!settings) {
          settings = await db.footerSettings.create({ data: DEFAULT_FOOTER });
        }
        return settings;
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM footer_settings WHERE id = $1', 'default');
      if (rows && rows.length > 0) {
        return rows[0];
      } else {
        await seedDefaultFooterRaw();
        const seeded: any = await prisma.$queryRawUnsafe('SELECT * FROM footer_settings WHERE id = $1', 'default');
        return seeded[0] || DEFAULT_FOOTER;
      }
    } catch {
      return DEFAULT_FOOTER;
    }
  }

  static async update(payload: FooterSettingsPayload) {
    const existing = await FooterService.get();

    const updatedData = {
      companyDescription: payload.companyDescription ?? existing.companyDescription ?? DEFAULT_FOOTER.companyDescription,
      footerLogo: payload.footerLogo ?? existing.footerLogo ?? DEFAULT_FOOTER.footerLogo,
      footerLinks: payload.footerLinks ?? existing.footerLinks ?? DEFAULT_FOOTER.footerLinks,
      socialLinks: payload.socialLinks ?? existing.socialLinks ?? DEFAULT_FOOTER.socialLinks,
      copyrightText: payload.copyrightText ?? existing.copyrightText ?? DEFAULT_FOOTER.copyrightText,
      legalLinks: payload.legalLinks ?? existing.legalLinks ?? DEFAULT_FOOTER.legalLinks,
      supportLinks: payload.supportLinks ?? existing.supportLinks ?? DEFAULT_FOOTER.supportLinks,
    };

    try {
      if (db.footerSettings) {
        return await db.footerSettings.upsert({
          where: { id: 'default' },
          update: updatedData,
          create: { id: 'default', ...updatedData },
        });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO footer_settings (id, "companyDescription", "footerLogo", "footerLinks", "socialLinks", "copyrightText", "legalLinks", "supportLinks", "createdAt", "updatedAt")
         VALUES ('default', $1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, $7::jsonb, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           "companyDescription" = EXCLUDED."companyDescription",
           "footerLogo" = EXCLUDED."footerLogo",
           "footerLinks" = EXCLUDED."footerLinks",
           "socialLinks" = EXCLUDED."socialLinks",
           "copyrightText" = EXCLUDED."copyrightText",
           "legalLinks" = EXCLUDED."legalLinks",
           "supportLinks" = EXCLUDED."supportLinks",
           "updatedAt" = NOW()`,
        updatedData.companyDescription,
        updatedData.footerLogo,
        JSON.stringify(updatedData.footerLinks),
        JSON.stringify(updatedData.socialLinks),
        updatedData.copyrightText,
        JSON.stringify(updatedData.legalLinks),
        JSON.stringify(updatedData.supportLinks)
      );

      return { id: 'default', ...updatedData };
    } catch (err) {
      console.error('Error updating footer settings:', err);
      throw err;
    }
  }
}
