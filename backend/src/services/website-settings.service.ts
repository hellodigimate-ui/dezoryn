import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
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

const dataDir = path.resolve(process.cwd(), 'src/data');
const dataFilePath = path.join(dataDir, 'website_settings.json');

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

export class WebsiteSettingsService {
  static async get() {
    const fileData = readFileData();
    if (fileData) return fileData;

    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM website_settings WHERE id = $1 LIMIT 1`,
        'default'
      );
      if (rows && rows.length > 0) {
        writeFileData(rows[0]);
        return rows[0];
      }

      // Seed default row
      await prisma.$executeRawUnsafe(
        `INSERT INTO website_settings (
          id, "websiteName", "logoUrl", "faviconUrl", domain,
          "maintenanceMode", "announcementBar", "announcementText", "announcementColor",
          language, timezone, currency, "currencySymbol",
          "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom", "smtpSecure",
          "googleAnalyticsId", "metaTitle", "metaDescription",
          "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW(),NOW())
        ON CONFLICT (id) DO NOTHING`,
        DEFAULT_SETTINGS.id,
        DEFAULT_SETTINGS.websiteName,
        DEFAULT_SETTINGS.logoUrl,
        DEFAULT_SETTINGS.faviconUrl,
        DEFAULT_SETTINGS.domain,
        DEFAULT_SETTINGS.maintenanceMode,
        DEFAULT_SETTINGS.announcementBar,
        DEFAULT_SETTINGS.announcementText,
        DEFAULT_SETTINGS.announcementColor,
        DEFAULT_SETTINGS.language,
        DEFAULT_SETTINGS.timezone,
        DEFAULT_SETTINGS.currency,
        DEFAULT_SETTINGS.currencySymbol,
        DEFAULT_SETTINGS.smtpHost,
        DEFAULT_SETTINGS.smtpPort,
        DEFAULT_SETTINGS.smtpUser,
        DEFAULT_SETTINGS.smtpPass,
        DEFAULT_SETTINGS.smtpFrom,
        DEFAULT_SETTINGS.smtpSecure,
        DEFAULT_SETTINGS.googleAnalyticsId,
        DEFAULT_SETTINGS.metaTitle,
        DEFAULT_SETTINGS.metaDescription
      );
      const seeded: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM website_settings WHERE id = $1 LIMIT 1`,
        'default'
      );
      const resData = seeded[0] || DEFAULT_SETTINGS;
      writeFileData(resData);
      return resData;
    } catch (err) {
      console.error('WebsiteSettings get error:', err);
      writeFileData(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  }

  static async update(payload: Partial<typeof DEFAULT_SETTINGS>) {
    const existing = await WebsiteSettingsService.get();
    const merged = { ...existing, ...payload };

    writeFileData(merged);

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO website_settings (
          id, "websiteName", "logoUrl", "faviconUrl", domain,
          "maintenanceMode", "announcementBar", "announcementText", "announcementColor",
          language, timezone, currency, "currencySymbol",
          "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom", "smtpSecure",
          "googleAnalyticsId", "metaTitle", "metaDescription",
          "createdAt", "updatedAt"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW(),NOW())
        ON CONFLICT (id) DO UPDATE SET
          "websiteName" = EXCLUDED."websiteName",
          "logoUrl" = EXCLUDED."logoUrl",
          "faviconUrl" = EXCLUDED."faviconUrl",
          domain = EXCLUDED.domain,
          "maintenanceMode" = EXCLUDED."maintenanceMode",
          "announcementBar" = EXCLUDED."announcementBar",
          "announcementText" = EXCLUDED."announcementText",
          "announcementColor" = EXCLUDED."announcementColor",
          language = EXCLUDED.language,
          timezone = EXCLUDED.timezone,
          currency = EXCLUDED.currency,
          "currencySymbol" = EXCLUDED."currencySymbol",
          "smtpHost" = EXCLUDED."smtpHost",
          "smtpPort" = EXCLUDED."smtpPort",
          "smtpUser" = EXCLUDED."smtpUser",
          "smtpPass" = EXCLUDED."smtpPass",
          "smtpFrom" = EXCLUDED."smtpFrom",
          "smtpSecure" = EXCLUDED."smtpSecure",
          "googleAnalyticsId" = EXCLUDED."googleAnalyticsId",
          "metaTitle" = EXCLUDED."metaTitle",
          "metaDescription" = EXCLUDED."metaDescription",
          "updatedAt" = NOW()`,
        'default',
        merged.websiteName ?? DEFAULT_SETTINGS.websiteName,
        merged.logoUrl ?? null,
        merged.faviconUrl ?? null,
        merged.domain ?? DEFAULT_SETTINGS.domain,
        merged.maintenanceMode ?? false,
        merged.announcementBar ?? false,
        merged.announcementText ?? '',
        merged.announcementColor ?? 'blue',
        merged.language ?? 'en',
        merged.timezone ?? 'Asia/Kolkata',
        merged.currency ?? 'INR',
        merged.currencySymbol ?? '₹',
        merged.smtpHost ?? '',
        merged.smtpPort ?? 587,
        merged.smtpUser ?? '',
        merged.smtpPass ?? '',
        merged.smtpFrom ?? '',
        merged.smtpSecure ?? false,
        merged.googleAnalyticsId ?? '',
        merged.metaTitle ?? DEFAULT_SETTINGS.metaTitle,
        merged.metaDescription ?? ''
      );
    } catch (err) {
      console.error('WebsiteSettings update DB error:', err);
    }
    return merged;
  }
}

