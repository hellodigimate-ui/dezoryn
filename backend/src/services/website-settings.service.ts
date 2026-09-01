import { prisma } from '../config/prisma.config';

export const DEFAULT_WEBSITE_SETTINGS = {
  id: 'default',
  websiteName: 'Dezoryn Technologies',
  logoUrl: '/uploads/dezoryn-brand-logo.jpg',
  faviconUrl: '/uploads/dezoryn-brand-logo.jpg',
  domain: 'https://dezoryn.com',
  maintenanceMode: false,
  announcementBar: false,
  announcementText: '',
  announcementColor: 'blue',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  smtpSecure: false,
  googleAnalyticsId: '',
  metaTitle: 'Dezoryn Technologies - Enterprise Business Automation',
  metaDescription: '',
};

export class WebsiteSettingsService {
  /**
   * GET WEBSITE SETTINGS
   * PostgreSQL is the only source of truth.
   */
  static async get() {
    try {
      let settings = await prisma.websiteSettings.findUnique({
        where: { id: 'default' },
      });

      if (!settings) {
        settings = await prisma.websiteSettings.create({
          data: DEFAULT_WEBSITE_SETTINGS,
        });
      }

      return settings;
    } catch (err) {
      console.error('WebsiteSettings get error:', err);
      throw err;
    }
  }

  /**
   * UPDATE WEBSITE SETTINGS
   */
  static async update(payload: Partial<typeof DEFAULT_WEBSITE_SETTINGS>) {
    try {
      const existing = await WebsiteSettingsService.get();
      const merged = {
        ...existing,
        ...payload,
        updatedAt: new Date(),
      };

      const updated = await prisma.websiteSettings.upsert({
        where: { id: 'default' },
        create: { ...DEFAULT_WEBSITE_SETTINGS, ...payload, id: 'default' },
        update: payload,
      });

      return updated;
    } catch (err) {
      console.error('WebsiteSettings update error:', err);
      throw err;
    }
  }
}
