import { prisma } from '../config/prisma.config';

export interface FooterSettingsPayload {
  companyDescription?: string;
  footerLogo?: string;
  footerLinks?: any;
  socialLinks?: any;
  copyrightText?: string;
  legalLinks?: any;
  supportLinks?: any;
}

export const DEFAULT_FOOTER = {
  id: 'default',
  companyDescription: 'Dezoryn Technologies Pvt. Ltd. is a global IT solutions provider committed to delivering innovative, reliable and future-ready software products.',
  footerLogo: 'Dezoryn Technologies',
  footerLinks: [
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Our Leadership', url: '/leadership' },
        { label: 'Careers & Hiring', url: '/careers' },
        { label: 'Contact Us', url: '/contact-sales' },
      ],
    },
    {
      title: 'SOLUTIONS',
      links: [
        { label: 'Technology Services', url: '/services' },
        { label: 'DezoAI Platform', url: '/products' },
        { label: 'CRM & ERP Suite', url: '/products' },
        { label: 'Pricing Plans', url: '/pricing' },
        { label: 'Book Live Demo', url: '/book-demo' },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { label: '24/7 Support Desk', url: '/support' },
        { label: 'Help & Support Center', url: '/support' },
        { label: 'Product FAQs', url: '/faq' },
        { label: 'API & Documentation', url: '/api-docs' },
        { label: 'System Status', url: '/status' },
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
    { label: 'Privacy Policy', url: '/privacy' },
    { label: 'Terms & Conditions', url: '/terms' },
    { label: 'Cookie Policy', url: '/cookies' },
  ],
  supportLinks: [
    { label: '24/7 Enterprise Support', url: '/support' },
    { label: 'Submit Support Ticket', url: '/support' },
    { label: 'System Status', url: '/status' },
  ],
};

export class FooterService {
  /**
   * GET FOOTER SETTINGS
   * PostgreSQL is the only source of truth.
   */
  static async get() {
    try {
      let settings = await prisma.footerSettings.findUnique({
        where: { id: 'default' },
      });

      if (!settings) {
        settings = await prisma.footerSettings.create({
          data: DEFAULT_FOOTER,
        });
      }

      return settings;
    } catch (error) {
      console.error('GET FOOTER ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE FOOTER SETTINGS
   */
  static async update(payload: FooterSettingsPayload) {
    try {
      const existing: any = await FooterService.get();

      const updatedData = {
        companyDescription: payload.companyDescription ?? existing.companyDescription ?? DEFAULT_FOOTER.companyDescription,
        footerLogo: payload.footerLogo ?? existing.footerLogo ?? DEFAULT_FOOTER.footerLogo,
        footerLinks: payload.footerLinks ?? existing.footerLinks ?? DEFAULT_FOOTER.footerLinks,
        socialLinks: payload.socialLinks ?? existing.socialLinks ?? DEFAULT_FOOTER.socialLinks,
        copyrightText: payload.copyrightText ?? existing.copyrightText ?? DEFAULT_FOOTER.copyrightText,
        legalLinks: payload.legalLinks ?? existing.legalLinks ?? DEFAULT_FOOTER.legalLinks,
        supportLinks: payload.supportLinks ?? existing.supportLinks ?? DEFAULT_FOOTER.supportLinks,
      };

      const updated = await prisma.footerSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...updatedData },
        update: updatedData,
      });

      return updated;
    } catch (error) {
      console.error('UPDATE FOOTER ERROR:', error);
      throw error;
    }
  }
}
