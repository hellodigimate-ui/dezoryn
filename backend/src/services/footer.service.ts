import fs from 'fs';
import path from 'path';
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

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'footer.json');

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

export class FooterService {
  static async get() {
    const fileData = readFileData();
    if (fileData) return fileData;

    try {
      if (db.footerSettings) {
        let settings = await db.footerSettings.findUnique({ where: { id: 'default' } });
        if (settings) {
          writeFileData(settings);
          return settings;
        }
      }
    } catch (_e) {}

    try {
      const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM footer_settings WHERE id = $1', 'default');
      if (rows && rows.length > 0) {
        writeFileData(rows[0]);
        return rows[0];
      }
    } catch (_e) {}

    writeFileData(DEFAULT_FOOTER);
    return DEFAULT_FOOTER;
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

    writeFileData(updatedData);

    try {
      if (db.footerSettings) {
        await db.footerSettings.upsert({
          where: { id: 'default' },
          update: updatedData,
          create: { id: 'default', ...updatedData },
        });
      }
    } catch (_e) {}

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
    } catch (_e) {}

    return { id: 'default', ...updatedData };
  }
}

