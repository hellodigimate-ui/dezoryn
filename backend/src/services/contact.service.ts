import { prisma } from '../config/prisma.config';

export interface DirectChannelItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionUrl: string;
  icon: string;
  enabled: boolean;
}

export interface SecurityGuaranteeItem {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

export interface OfficeLocationItem {
  id: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hours: string;
  isHQ: boolean;
}

export interface ContactSettingsPayload {
  phone?: string;
  email?: string;
  address?: string;
  googleMap?: string;
  socialLinks?: any;
  whatsApp?: string;
  businessHours?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroGradientTitle?: string;
  heroDescription?: string;
  formTitle?: string;
  responseSlaBadge?: string;
  directChannelsTitle?: string;
  directChannels?: DirectChannelItem[] | any;
  securityGuaranteesTitle?: string;
  securityGuarantees?: SecurityGuaranteeItem[] | any;
  officeLocationsBadge?: string;
  officeLocationsTitle?: string;
  officeLocations?: OfficeLocationItem[] | any;
}

export interface ContactSubmissionPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  employees?: string;
  budget?: string;
  productInterest?: string;
  message?: string;
}

const DEFAULT_DIRECT_CHANNELS: DirectChannelItem[] = [
  {
    id: 'channel-1',
    type: 'phone',
    title: 'Direct Executive Line',
    subtitle: '+1 (415) 890-2100',
    actionText: 'Call Now →',
    actionUrl: 'tel:+14158902100',
    icon: 'Phone',
    enabled: true,
  },
  {
    id: 'channel-2',
    type: 'whatsapp',
    title: 'WhatsApp Enterprise Chat',
    subtitle: 'Instant response 24/7',
    actionText: 'Open Chat →',
    actionUrl: '+917777804850',
    icon: 'MessageSquare',
    enabled: true,
  },
  {
    id: 'channel-3',
    type: 'chat',
    title: 'In-Browser Live Advisor',
    subtitle: 'Available Mon-Fri',
    actionText: 'Start →',
    actionUrl: '#live-advisor',
    icon: 'Headphones',
    enabled: true,
  },
];

const DEFAULT_SECURITY_GUARANTEES: SecurityGuaranteeItem[] = [
  {
    id: 'sec-1',
    title: 'SOC2 Type II',
    subtitle: 'Audited Security Controls',
    color: 'blue',
  },
  {
    id: 'sec-2',
    title: 'GDPR & ISO27001',
    subtitle: 'Global Data Compliance',
    color: 'emerald',
  },
  {
    id: 'sec-3',
    title: '99.99% Uptime',
    subtitle: 'Financially Backed SLA',
    color: 'violet',
  },
  {
    id: 'sec-4',
    title: 'Dedicated TAM',
    subtitle: 'Technical Account Manager',
    color: 'amber',
  },
];

const DEFAULT_OFFICE_LOCATIONS: OfficeLocationItem[] = [
  {
    id: 'loc-1',
    city: 'Indore (Global HQ)',
    country: 'India',
    address: 'Indore, Madhya Pradesh, India',
    phone: '+91 77778 04850',
    hours: 'Mon - Fri: 9:00 AM - 6:00 PM IST',
    isHQ: true,
  },
  {
    id: 'loc-2',
    city: 'San Francisco',
    country: 'United States',
    address: '500 Howard Street, Suite 400, CA 94105',
    phone: '+1 (415) 890-2100',
    hours: '8:00 AM - 6:00 PM PST',
    isHQ: false,
  },
  {
    id: 'loc-3',
    city: 'London',
    country: 'United Kingdom',
    address: '30 St Mary Axe, City of London, EC3A 8EP',
    phone: '+44 20 7946 0912',
    hours: '8:30 AM - 5:30 PM GMT',
    isHQ: false,
  },
  {
    id: 'loc-4',
    city: 'Singapore',
    country: 'Singapore',
    address: '1 Raffles Place, #28-01, 048616',
    phone: '+65 6789 0123',
    hours: '9:00 AM - 6:00 PM SGT',
    isHQ: false,
  },
];

const DEFAULT_CONTACT = {
  id: 'default',
  phone: '+91 77778 04850',
  email: 'support@dezoryn.com',
  address: 'Indore, Madhya Pradesh, India',
  googleMap: 'https://maps.google.com/?q=Indore,Madhya+Pradesh,India',
  socialLinks: {
    twitter: 'https://twitter.com/dezoryn',
    linkedin: 'https://linkedin.com/company/dezoryn',
    github: 'https://github.com/dezoryn',
    facebook: 'https://facebook.com/dezoryn',
    instagram: 'https://instagram.com/dezoryn',
    youtube: 'https://youtube.com/@dezoryn',
  },
  whatsApp: '+917777804850',
  businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM IST | Sat - Sun: Closed',
  heroBadge: 'ENTERPRISE & GLOBAL ADVISORY',
  heroTitle: 'Talk with Our',
  heroGradientTitle: 'Enterprise Team',
  heroDescription: 'Whether you need custom SLA guarantees, multi-region deployment, or dedicated volume licensing, our global sales engineers respond within 15 minutes.',
  formTitle: 'Enterprise Inquiry Form',
  responseSlaBadge: '15 Min SLA',
  directChannelsTitle: 'Direct Communication Channels',
  directChannels: DEFAULT_DIRECT_CHANNELS,
  securityGuaranteesTitle: 'Enterprise Security & Guarantees',
  securityGuarantees: DEFAULT_SECURITY_GUARANTEES,
  officeLocationsBadge: 'OUR GLOBAL FOOTPRINT',
  officeLocationsTitle: 'Worldwide Office Locations',
  officeLocations: DEFAULT_OFFICE_LOCATIONS,
};

export class ContactService {
  /**
   * GET CONTACT SETTINGS
   * PostgreSQL is the only source of truth.
   */
  static async get() {
    try {
      let settings: any = await prisma.contactSettings.findUnique({ where: { id: 'default' } });
      if (!settings) {
        settings = await prisma.contactSettings.create({ data: DEFAULT_CONTACT as any });
      } else {
        // Ensure defaults for any newly added fields if existing record had nulls
        settings = {
          ...DEFAULT_CONTACT,
          ...settings,
          socialLinks: settings.socialLinks || DEFAULT_CONTACT.socialLinks,
          directChannels: Array.isArray(settings.directChannels) ? settings.directChannels : DEFAULT_DIRECT_CHANNELS,
          securityGuarantees: Array.isArray(settings.securityGuarantees) ? settings.securityGuarantees : DEFAULT_SECURITY_GUARANTEES,
          officeLocations: Array.isArray(settings.officeLocations) ? settings.officeLocations : DEFAULT_OFFICE_LOCATIONS,
        };
      }
      return settings;
    } catch (error) {
      console.error('GET CONTACT SETTINGS ERROR:', error);
      throw error;
    }
  }

  /**
   * UPDATE CONTACT SETTINGS
   */
  static async update(payload: ContactSettingsPayload) {
    try {
      const existing: any = await ContactService.get();

      const updatedData: any = {
        phone: payload.phone ?? existing.phone ?? DEFAULT_CONTACT.phone,
        email: payload.email ?? existing.email ?? DEFAULT_CONTACT.email,
        address: payload.address ?? existing.address ?? DEFAULT_CONTACT.address,
        googleMap: payload.googleMap ?? existing.googleMap ?? DEFAULT_CONTACT.googleMap,
        socialLinks: payload.socialLinks ?? existing.socialLinks ?? DEFAULT_CONTACT.socialLinks,
        whatsApp: payload.whatsApp ?? existing.whatsApp ?? DEFAULT_CONTACT.whatsApp,
        businessHours: payload.businessHours ?? existing.businessHours ?? DEFAULT_CONTACT.businessHours,
        heroBadge: payload.heroBadge ?? existing.heroBadge ?? DEFAULT_CONTACT.heroBadge,
        heroTitle: payload.heroTitle ?? existing.heroTitle ?? DEFAULT_CONTACT.heroTitle,
        heroGradientTitle: payload.heroGradientTitle ?? existing.heroGradientTitle ?? DEFAULT_CONTACT.heroGradientTitle,
        heroDescription: payload.heroDescription ?? existing.heroDescription ?? DEFAULT_CONTACT.heroDescription,
        formTitle: payload.formTitle ?? existing.formTitle ?? DEFAULT_CONTACT.formTitle,
        responseSlaBadge: payload.responseSlaBadge ?? existing.responseSlaBadge ?? DEFAULT_CONTACT.responseSlaBadge,
        directChannelsTitle: payload.directChannelsTitle ?? existing.directChannelsTitle ?? DEFAULT_CONTACT.directChannelsTitle,
        directChannels: payload.directChannels ?? existing.directChannels ?? DEFAULT_CONTACT.directChannels,
        securityGuaranteesTitle: payload.securityGuaranteesTitle ?? existing.securityGuaranteesTitle ?? DEFAULT_CONTACT.securityGuaranteesTitle,
        securityGuarantees: payload.securityGuarantees ?? existing.securityGuarantees ?? DEFAULT_CONTACT.securityGuarantees,
        officeLocationsBadge: payload.officeLocationsBadge ?? existing.officeLocationsBadge ?? DEFAULT_CONTACT.officeLocationsBadge,
        officeLocationsTitle: payload.officeLocationsTitle ?? existing.officeLocationsTitle ?? DEFAULT_CONTACT.officeLocationsTitle,
        officeLocations: payload.officeLocations ?? existing.officeLocations ?? DEFAULT_CONTACT.officeLocations,
      };

      const updated = await prisma.contactSettings.upsert({
        where: { id: 'default' },
        update: updatedData,
        create: { id: 'default', ...updatedData },
      });

      return updated;
    } catch (error) {
      console.error('UPDATE CONTACT SETTINGS ERROR:', error);
      throw error;
    }
  }

  /**
   * SUBMIT CONTACT INQUIRY
   */
  static async submitInquiry(payload: ContactSubmissionPayload) {
    try {
      const submission = await prisma.contactSubmission.create({
        data: {
          fullName: payload.fullName || 'Anonymous Visitor',
          email: payload.email || '',
          phone: payload.phone || '',
          company: payload.company || '',
          industry: payload.industry || '',
          employees: payload.employees || '',
          budget: payload.budget || '',
          productInterest: payload.productInterest || '',
          message: payload.message || '',
          status: 'NEW',
        },
      });

      return submission;
    } catch (error) {
      console.error('SUBMIT INQUIRY ERROR:', error);
      throw error;
    }
  }

  /**
   * GET SUBMISSIONS (Contact, Demo Bookings, etc.)
   */
  static async getSubmissions(query?: string, statusFilter?: string) {
    try {
      let items: any[] = [];

      // 1. Fetch Contact Sales Submissions
      try {
        const dbSubmissions = await prisma.contactSubmission.findMany({
          orderBy: { createdAt: 'desc' },
        });
        items = dbSubmissions.map((i: any) => ({ ...i, source: i.source || 'Contact Form' }));
      } catch (_e) {}

      // 2. Fetch Demo Booking Submissions
      let demoBookings: any[] = [];
      try {
        demoBookings = await prisma.demoBooking.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch (_e) {}

      const mappedDemoBookings = demoBookings.map((b: any) => ({
        id: b.id,
        fullName: (b.fullName || 'Demo Applicant').trim(),
        email: b.email || '',
        phone: b.phone || '',
        company: b.company || '',
        industry: b.productSelected ? `Product: ${b.productSelected}` : 'Enterprise Client',
        employees: b.teamSize || b.expectedUsers || '',
        budget: '',
        productInterest: b.productSelected || 'Dezoryn Enterprise Demo',
        message: b.notes ? `[Demo Notes]: ${b.notes} | Scheduled: ${b.formattedBookingDate || b.bookingDate} ${b.bookingTimeSlot || ''}` : `Scheduled Demo: ${b.formattedBookingDate || b.bookingDate} ${b.bookingTimeSlot || ''}`,
        status: (b.status === 'CONFIRMED' ? 'NEW' : (b.status || 'NEW')).toUpperCase(),
        source: 'Demo Booking',
        createdAt: b.createdAt || new Date(),
        updatedAt: b.updatedAt || new Date(),
      }));

      // Combine streams
      const combinedMap = new Map<string, any>();
      mappedDemoBookings.forEach((item) => combinedMap.set(item.id, item));
      items.forEach((item) => combinedMap.set(item.id, item));

      const combined = Array.from(combinedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      let filtered = combined;
      if (statusFilter && statusFilter !== 'ALL') {
        filtered = filtered.filter((i) => (i.status || 'NEW').toUpperCase() === statusFilter.toUpperCase());
      }

      if (query && query.trim()) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(
          (i) =>
            (i.fullName && String(i.fullName).toLowerCase().includes(q)) ||
            (i.email && String(i.email).toLowerCase().includes(q)) ||
            (i.company && String(i.company).toLowerCase().includes(q)) ||
            (i.phone && String(i.phone).toLowerCase().includes(q)) ||
            (i.message && String(i.message).toLowerCase().includes(q)) ||
            (i.industry && String(i.industry).toLowerCase().includes(q)) ||
            (i.productInterest && String(i.productInterest).toLowerCase().includes(q)) ||
            (i.source && String(i.source).toLowerCase().includes(q))
        );
      }

      return filtered;
    } catch (error) {
      console.error('GET SUBMISSIONS ERROR:', error);
      throw error;
    }
  }

  static async updateSubmissionStatus(id: string, status: string) {
    try {
      try {
        await prisma.contactSubmission.update({
          where: { id },
          data: { status, updatedAt: new Date() },
        });
      } catch (_e) {}

      try {
        await prisma.demoBooking.update({
          where: { id },
          data: { status },
        });
      } catch (_e) {}

      return { id, status };
    } catch (error) {
      console.error(`UPDATE SUBMISSION STATUS ${id} ERROR:`, error);
      throw error;
    }
  }

  static async deleteSubmission(id: string) {
    try {
      try {
        await prisma.contactSubmission.delete({ where: { id } });
      } catch (_e) {}

      try {
        await prisma.demoBooking.delete({ where: { id } });
      } catch (_e) {}

      return { success: true };
    } catch (error) {
      console.error(`DELETE SUBMISSION ${id} ERROR:`, error);
      throw error;
    }
  }
}
