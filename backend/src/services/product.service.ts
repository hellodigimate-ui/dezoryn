import { prisma } from '../config/prisma.config';

const db = prisma as any;

export interface BackendProductFilter {
  category?: string;
  search?: string;
  maxPrice?: number;
  aiPowered?: boolean;
  apiAvailable?: boolean;
  cloudNative?: boolean;
  mobileApp?: boolean;
  whatsAppIntegration?: boolean;
  industries?: string[];
  businessSizes?: string[];
  deployments?: string[];
  pricingTypes?: string[];
  platforms?: string[];
  features?: string[];
  languages?: string[];
  countries?: string[];
  isEnabled?: boolean;
}

const DEFAULT_PRODUCTS = [
  {
    id: 'schoolycore',
    title: 'SchoolyCore ERP',
    subtitle: 'FEATURED',
    description: 'Complete K-12 and Higher-Ed Institute Management platform with automated fee collection, exams, and parent portal.',
    icon: 'GraduationCap',
    gradient: 'from-blue-600 to-cyan-500',
    category: 'industry',
    categoryLabel: 'Industry Vertical',
    industry: 'Education & Academics',
    badge: 'FEATURED',
    tag: 'Education',
    tags: ['school', 'education', 'students', 'exams', 'fees', 'timetable', 'attendance', 'k12', 'institute', 'academy'],
    status: 'Featured',
    rating: 4.9,
    reviewsCount: 1420,
    price: 'From ₹49/mo',
    priceValue: 49,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'Hybrid Cloud'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Hindi', 'Multi-Lingual'],
    countries: ['Global', 'India (GST Ready)', 'United States'],
    features: [
      'Student Lifecycle & Online Admissions',
      'Automated Fee Collection Gateway & Auto Receipts',
      'Exams, Grading & Custom Report Card Generator',
      'Parent & Student iOS / Android Mobile App'
    ],
    order: 0,
    isEnabled: true
  },
  {
    id: 'hms-health',
    title: 'Dezo Care HMS',
    subtitle: 'POPULAR',
    description: 'Enterprise Hospital Management System covering OPD/IPD, Electronic Health Records, Pharmacy, and Telehealth.',
    icon: 'Cross',
    gradient: 'from-emerald-600 to-teal-500',
    category: 'industry',
    categoryLabel: 'Industry Vertical',
    industry: 'Healthcare & Telemedicine',
    badge: 'POPULAR',
    tag: 'Healthcare',
    tags: ['hospital', 'health', 'healthcare', 'hms', 'opd', 'ipd', 'ehr', 'pharmacy', 'doctors', 'patient', 'medical', 'billing'],
    status: 'Featured',
    rating: 4.8,
    reviewsCount: 890,
    price: 'From ₹89/mo',
    priceValue: 89,
    pricingType: 'Monthly',
    businessSizes: ['Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'On-Premise', 'Dedicated Private Cluster'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App', 'Windows Desktop'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Hindi', 'Spanish'],
    countries: ['Global', 'India (GST Ready)', 'United States', 'European Union (GDPR)'],
    features: [
      'OPD / IPD Patient Management & Bed Allocation',
      'EHR & Digital Doctor Prescriptions Engine',
      'Pharmacy & Pathology Lab Billing Integration',
      'NABH Compliance Audit Trail Logs'
    ],
    order: 1,
    isEnabled: true
  },
  {
    id: 'dezoryn-hrms',
    title: 'Dezoryn HRMS Pulse',
    subtitle: 'ENTERPRISE',
    description: 'Automated Human Resource suite for payroll processing, biometric attendance, performance tracking, and hiring.',
    icon: 'Users2',
    gradient: 'from-purple-600 to-indigo-500',
    category: 'erp',
    categoryLabel: 'ERP & Operations',
    industry: 'HR & People Operations',
    badge: 'ENTERPRISE',
    tag: 'HR & Payroll',
    tags: ['hrms', 'hr', 'payroll', 'attendance', 'employees', 'biometric', 'leaves', 'hiring', 'salary', 'pf', 'tax'],
    status: 'Available',
    rating: 4.9,
    reviewsCount: 2100,
    price: 'From ₹39/mo',
    priceValue: 39,
    pricingType: 'Monthly',
    businessSizes: ['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'Hybrid Cloud'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Hindi', 'Spanish', 'French', 'Multi-Lingual'],
    countries: ['Global', 'India (GST Ready)', 'United States', 'European Union (GDPR)', 'Asia Pacific'],
    features: [
      '1-Click Multi-State Automated Payroll Run',
      'Biometric & Geo-Fenced Mobile Attendance',
      'Employee Self-Service (ESS) Leave Portal',
      'Performance Appraisals & Goal Tracking (OKRs)'
    ],
    order: 2,
    isEnabled: true
  },
  {
    id: 'inventory-pro',
    title: 'InventoryPro Matrix',
    subtitle: 'CORE',
    description: 'Multi-warehouse stock control, barcode scanner integration, automated purchase ordering, and low-stock alerts.',
    icon: 'Boxes',
    gradient: 'from-amber-600 to-orange-500',
    category: 'erp',
    categoryLabel: 'ERP & Operations',
    industry: 'Supply Chain & Logistics',
    badge: 'CORE',
    tag: 'Supply Chain',
    tags: ['inventory', 'stock', 'warehouse', 'purchase', 'barcode', 'supply chain', 'pos', 'vendor', 'materials'],
    status: 'Available',
    rating: 4.7,
    reviewsCount: 650,
    price: 'From ₹35/mo',
    priceValue: 35,
    pricingType: 'Monthly',
    businessSizes: ['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'Android App', 'Windows Desktop'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: false,
    languages: ['English', 'Hindi'],
    countries: ['Global', 'India (GST Ready)', 'United States'],
    features: [
      'Multi-Location Stock Sync & Batch Tracking',
      'Barcode & QR Scanner Hardware Integration',
      'Automated Purchase Reordering & PO Generation',
      'Low Stock & Batch Expiry Real-Time Alerts'
    ],
    order: 3,
    isEnabled: true
  },
  {
    id: 'sales-ai-copilot',
    title: 'DezoAI Sales Copilot',
    subtitle: 'AI DRIVEN',
    description: 'Autonomous AI agent to score leads, generate personalized multi-channel outreach, and predict pipeline deal win rates.',
    icon: 'Zap',
    gradient: 'from-cyan-600 to-blue-500',
    category: 'ai',
    categoryLabel: 'AI Suite',
    industry: 'Sales & Revenue Operations',
    badge: 'AI DRIVEN',
    tag: 'AI Intelligence',
    tags: ['ai', 'copilot', 'sales', 'leads', 'scoring', 'email', 'cadence', 'predictive', 'revenue', 'automation', 'llm'],
    status: 'Featured',
    rating: 4.95,
    reviewsCount: 3400,
    price: 'From ₹79/mo',
    priceValue: 79,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Spanish', 'German', 'French', 'Multi-Lingual'],
    countries: ['Global', 'United States', 'European Union (GDPR)'],
    features: [
      '50+ Real-Time Behavioral Intent Signal Scoring',
      'Multi-Channel Automated Email & WhatsApp Cadences',
      'Predictive Pipeline Deal Close Forecasting',
      'Bi-Directional CRM 1-Click Sync'
    ],
    order: 4,
    isEnabled: true
  },
  {
    id: 'dezo-crm-suite',
    title: 'Dezo CRM 360',
    subtitle: 'HIGH DEMAND',
    description: 'Unified customer relationship management with deal Kanban, omnichannel communication, custom webhooks, and SLAs.',
    icon: 'Building2',
    gradient: 'from-blue-600 to-cyan-500',
    category: 'crm',
    categoryLabel: 'CRM & Sales',
    industry: 'Customer Relationship Management',
    badge: 'HIGH DEMAND',
    tag: 'CRM & Sales',
    tags: ['crm', 'pipeline', 'deals', 'contacts', 'kanban', 'leads', 'sales', 'inbox', 'accounts'],
    status: 'Available',
    rating: 4.85,
    reviewsCount: 1850,
    price: 'From ₹29/mo',
    priceValue: 29,
    pricingType: 'Monthly',
    businessSizes: ['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Spanish', 'Hindi'],
    countries: ['Global', 'United States', 'India (GST Ready)'],
    features: [
      'Visual Drag-and-Drop Deal Kanban Board',
      'Unified Omnichannel Customer Inbox',
      'Custom Webhooks & REST API Integrations',
      'Sales Rep Quota Attainment Leaderboards'
    ],
    order: 5,
    isEnabled: true
  },
  {
    id: 'dezo-sec-vault',
    title: 'DezoVault Security',
    subtitle: 'SECURITY',
    description: 'Bank-grade compliance, identity access management, single sign-on (SSO), and immutable encrypted audit logs.',
    icon: 'ShieldCheck',
    gradient: 'from-indigo-600 to-purple-600',
    category: 'security',
    categoryLabel: 'Security & Tools',
    industry: 'Cybersecurity & Governance',
    badge: 'SECURITY',
    tag: 'Security & Auth',
    tags: ['security', 'auth', 'sso', 'saml', 'gdpr', 'soc2', 'audit', 'rbac', 'vault', 'encryption', 'identity', 'more'],
    status: 'Available',
    rating: 4.9,
    reviewsCount: 920,
    price: 'From ₹59/mo',
    priceValue: 59,
    pricingType: 'Monthly',
    businessSizes: ['Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'On-Premise', 'Dedicated Private Cluster'],
    platforms: ['Web App (Browser)', 'Windows Desktop', 'macOS App'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: false,
    whatsAppIntegration: false,
    languages: ['English', 'German'],
    countries: ['Global', 'United States', 'European Union (GDPR)'],
    features: [
      'SOC2 Type II & GDPR Compliance Architecture',
      'SAML 2.0 / Okta / Azure AD Single Sign-On',
      'Granular Role-Based Access Control (RBAC)',
      'Immutable Encrypted Audit Logs & Data Governance'
    ],
    order: 6,
    isEnabled: true
  },
  {
    id: 'fintrack-erp',
    title: 'FinTrack Enterprise ERP',
    subtitle: 'FINANCE',
    description: 'General ledger, multi-currency accounting, automated GST/tax billing, and cash flow profit & loss forecasting.',
    icon: 'BadgeDollarSign',
    gradient: 'from-emerald-600 to-green-500',
    category: 'finance',
    categoryLabel: 'Finance & Accounting',
    industry: 'Finance & Accounting',
    badge: 'FINANCE',
    tag: 'Finance',
    tags: ['finance', 'accounting', 'invoicing', 'gst', 'tax', 'ledger', 'budget', 'billing', 'audit', 'currency'],
    status: 'Available',
    rating: 4.8,
    reviewsCount: 1150,
    price: 'From ₹45/mo',
    priceValue: 45,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'Hybrid Cloud'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App', 'Windows Desktop'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: false,
    languages: ['English', 'Hindi'],
    countries: ['Global', 'India (GST Ready)', 'United States'],
    features: [
      'Multi-Currency General Ledger & Chart of Accounts',
      'Automated GST, VAT & E-Way Bill Generation',
      'Cash Flow & Profit / Loss Real-Time Forecasting',
      'Bank Reconciliation & Expense Tracking Engine'
    ],
    order: 7,
    isEnabled: true
  },
  {
    id: 'mfg-pro',
    title: 'MfgPro Factory Suite',
    subtitle: 'NEW',
    description: 'Shop floor automation, bill of materials (BOM), production planning, machine IoT telemetry, and quality control.',
    icon: 'Factory',
    gradient: 'from-indigo-600 to-blue-600',
    category: 'industry',
    categoryLabel: 'Manufacturing ERP',
    industry: 'Manufacturing & Industrial',
    badge: 'NEW',
    tag: 'Manufacturing',
    tags: ['manufacturing', 'factory', 'industrial', 'bom', 'production', 'quality', 'iot', 'machinery', 'assembly'],
    status: 'Available',
    rating: 4.75,
    reviewsCount: 510,
    price: 'From ₹99/mo',
    priceValue: 99,
    pricingType: 'Monthly',
    businessSizes: ['Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['On-Premise', 'Hybrid Cloud'],
    platforms: ['Web App (Browser)', 'Windows Desktop'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: false,
    mobileApp: true,
    whatsAppIntegration: false,
    languages: ['English', 'German'],
    countries: ['Global', 'United States', 'European Union (GDPR)'],
    features: [
      'Multi-Level Bill of Materials (BOM) & Routing',
      'Shop Floor Machine Telemetry & Downtime Tracking',
      'Production Work Order Scheduling & Capacity Planning',
      'ISO Quality Control & Defect Inspection Audits'
    ],
    order: 8,
    isEnabled: true
  },
  {
    id: 'prop360-estate',
    title: 'Prop360 Real Estate Suite',
    subtitle: 'POPULAR',
    description: 'Property leasing, tenant portal, automated rent invoicing, maintenance ticket management, and broker CRM.',
    icon: 'Home',
    gradient: 'from-teal-600 to-cyan-600',
    category: 'industry',
    categoryLabel: 'Real Estate Management',
    industry: 'Real Estate & Property',
    badge: 'POPULAR',
    tag: 'Real Estate',
    tags: ['realestate', 'real estate', 'property', 'tenant', 'lease', 'rent', 'broker', 'housing', 'commercial'],
    status: 'Available',
    rating: 4.8,
    reviewsCount: 730,
    price: 'From ₹55/mo',
    priceValue: 55,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Hindi', 'Spanish'],
    countries: ['Global', 'India (GST Ready)', 'United States'],
    features: [
      'Commercial & Residential Lease Contract Engine',
      'Automated Rent Invoice & Online Payment Gateway',
      'Tenant Mobile App & Work Order Maintenance Desk',
      'Broker Lead Pipeline & Property Unit Mapping'
    ],
    order: 9,
    isEnabled: true
  },
  {
    id: 'logiroute-hub',
    title: 'LogiRoute Supply Hub',
    subtitle: 'LOGISTICS',
    description: 'Real-time GPS fleet tracking, driver route optimization, proof of delivery, and cargo shipment monitoring.',
    icon: 'Truck',
    gradient: 'from-orange-500 to-amber-500',
    category: 'industry',
    categoryLabel: 'Industry Vertical',
    industry: 'Transport & Logistics',
    badge: 'LOGISTICS',
    tag: 'Logistics',
    tags: ['logistics', 'fleet', 'transport', 'gps', 'shipment', 'tracking', 'cargo', 'delivery', 'route', 'more'],
    status: 'Featured',
    rating: 4.7,
    reviewsCount: 480,
    price: 'From $69/mo',
    priceValue: 69,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'Android App'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Spanish'],
    countries: ['Global', 'United States', 'India (GST Ready)'],
    features: [
      'Real-Time Telematics & GPS Fleet Live Map',
      'AI Route Optimization & Fuel Saver Engine',
      'Digital Signature Proof-of-Delivery (POD)',
      'Vehicle Maintenance & Driver Performance Logs'
    ],
    order: 10,
    isEnabled: true
  },
  {
    id: 'omnichannel-helpdesk',
    title: 'OmniChannel HelpDesk',
    subtitle: 'POPULAR',
    description: 'Centralized helpdesk unifying WhatsApp, Email, and Web Live Chat with AI auto-routing and SLA management.',
    icon: 'MessageSquareText',
    gradient: 'from-purple-600 to-violet-500',
    category: 'crm',
    categoryLabel: 'CRM & Sales',
    industry: 'Customer Support & Service',
    badge: 'POPULAR',
    tag: 'Support & Desk',
    tags: ['support', 'helpdesk', 'tickets', 'whatsapp', 'email', 'chat', 'sla', 'knowledgebase', 'customer service', 'crm'],
    status: 'Available',
    rating: 4.85,
    reviewsCount: 1600,
    price: 'From $19/mo',
    priceValue: 19,
    pricingType: 'Free Trial',
    businessSizes: ['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Spanish', 'Hindi', 'French', 'Multi-Lingual'],
    countries: ['Global', 'United States', 'European Union (GDPR)', 'India (GST Ready)'],
    features: [
      'WhatsApp, Email & Web Live Chat Unified Inbox',
      'AI Ticket Auto-Categorization & SLA Alerts',
      'Self-Service Customer Knowledge Base Portal',
      'Customer Satisfaction Score (CSAT) Analytics'
    ],
    order: 11,
    isEnabled: true
  },
  {
    id: 'dezo-analytics-bi',
    title: 'Dezo Analytics BI',
    subtitle: 'AI DRIVEN',
    description: 'Natural language query BI platform to turn raw SQL databases into interactive executive dashboards and PDF reports.',
    icon: 'BarChart3',
    gradient: 'from-teal-600 to-cyan-500',
    category: 'ai',
    categoryLabel: 'AI Suite',
    industry: 'Business Intelligence & Data',
    badge: 'AI DRIVEN',
    tag: 'Business Intelligence',
    tags: ['analytics', 'bi', 'dashboard', 'reports', 'sql', 'visualization', 'data', 'metrics', 'chart', 'ai'],
    status: 'Featured',
    rating: 4.9,
    reviewsCount: 870,
    price: 'From $65/mo',
    priceValue: 65,
    pricingType: 'Monthly',
    businessSizes: ['SMB (10-50)', 'Mid-Market (50-250)', 'Enterprise (250+)'],
    deployment: ['Cloud Hosted (SaaS)', 'On-Premise'],
    platforms: ['Web App (Browser)', 'Windows Desktop', 'macOS App'],
    aiPowered: true,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: false,
    whatsAppIntegration: false,
    languages: ['English', 'German'],
    countries: ['Global', 'United States', 'European Union (GDPR)'],
    features: [
      'Drag-and-Drop Interactive BI Dashboard Builder',
      'Natural Language AI Query Engine (Ask Data)',
      'Automated PDF / Excel Scheduled Email Reports',
      'Multi-Source Connectors (Postgres, Snowflake, MySQL)'
    ],
    order: 12,
    isEnabled: true
  },
  {
    id: 'dezo-commerce-engine',
    title: 'Dezo Commerce Engine',
    subtitle: 'RETAIL',
    description: 'Headless e-commerce API, retail POS terminal integration, subscription payments, and customer loyalty rewards.',
    icon: 'ShoppingBag',
    gradient: 'from-pink-600 to-rose-500',
    category: 'industry',
    categoryLabel: 'Industry Vertical',
    industry: 'E-Commerce & Retail',
    badge: 'RETAIL',
    tag: 'Retail & E-Com',
    tags: ['retail', 'ecommerce', 'pos', 'store', 'checkout', 'payments', 'products', 'cart', 'checkout', 'loyalty'],
    status: 'Available',
    rating: 4.75,
    reviewsCount: 940,
    price: 'From $39/mo',
    priceValue: 39,
    pricingType: 'Monthly',
    businessSizes: ['Startup (1-10)', 'SMB (10-50)', 'Mid-Market (50-250)'],
    deployment: ['Cloud Hosted (SaaS)'],
    platforms: ['Web App (Browser)', 'iOS App (iPhone/iPad)', 'Android App'],
    aiPowered: false,
    apiAvailable: true,
    cloudNative: true,
    mobileApp: true,
    whatsAppIntegration: true,
    languages: ['English', 'Hindi', 'Spanish'],
    countries: ['Global', 'India (GST Ready)', 'United States'],
    features: [
      'Headless Storefront API & React Components',
      'Integrated Retail POS Touch Terminal Interface',
      'Recurring Subscription & One-Time Payments',
      'Customer Loyalty Points & Coupon Campaign Engine'
    ],
    order: 13,
    isEnabled: true
  }
];

const checkCategoryMatch = (product: any, categoryId?: string): boolean => {
  if (!categoryId || categoryId === 'all') return true;
  if (categoryId === 'crm') return product.category === 'crm' || product.tags?.includes('crm');
  if (categoryId === 'erp') return product.category === 'erp' || product.tags?.includes('erp');
  if (categoryId === 'healthcare') return product.tags?.includes('healthcare') || product.tags?.includes('hospital') || product.industry?.toLowerCase().includes('health');
  if (categoryId === 'education') return product.tags?.includes('education') || product.tags?.includes('school') || product.industry?.toLowerCase().includes('edu');
  if (categoryId === 'finance') return product.category === 'finance' || product.tags?.includes('finance');
  if (categoryId === 'manufacturing') return product.tags?.includes('manufacturing') || product.tags?.includes('factory') || product.industry?.toLowerCase().includes('manufactur');
  if (categoryId === 'retail') return product.tags?.includes('retail') || product.tags?.includes('ecommerce') || product.industry?.toLowerCase().includes('retail');
  if (categoryId === 'realestate') return product.tags?.includes('realestate') || product.tags?.includes('property') || product.industry?.toLowerCase().includes('real estate');
  if (categoryId === 'ai') return product.category === 'ai' || product.tags?.includes('ai');
  if (categoryId === 'inventory') return product.tags?.includes('inventory') || product.id?.includes('inventory');
  if (categoryId === 'hrms') return product.tags?.includes('hrms') || product.tags?.includes('payroll');
  if (categoryId === 'more') return product.category === 'utility' || product.category === 'security' || product.tags?.includes('more');
  return product.category === categoryId;
};

let PRODUCT_STORE: any[] = [...DEFAULT_PRODUCTS];

export class ProductService {
  static async getAll(filter?: BackendProductFilter) {
    try {
      const where: any = {};
      if (filter?.isEnabled !== undefined) where.isEnabled = filter.isEnabled;

      let products: any[] = [];
      try {
        products = await db.product.findMany({ where, orderBy: { order: 'asc' } });
        if (products.length > 0) {
          PRODUCT_STORE = products;
        }
      } catch (_dbErr) {
        // Fallback to in-memory store
      }

      const sourceProducts = PRODUCT_STORE;
      const searchClean = filter?.search ? filter.search.trim().toLowerCase() : '';

      return sourceProducts.filter((p: any) => {
        // Category Filter
        if (filter?.category && !checkCategoryMatch(p, filter.category)) {
          return false;
        }

        // Boolean Filters
        if (filter?.aiPowered && !p.aiPowered) return false;
        if (filter?.apiAvailable && !p.apiAvailable) return false;
        if (filter?.cloudNative && !p.cloudNative) return false;
        if (filter?.mobileApp && !p.mobileApp) return false;
        if (filter?.whatsAppIntegration && !p.whatsAppIntegration) return false;

        // Max Price Slider
        if (filter?.maxPrice !== undefined && typeof p.priceValue === 'number' && p.priceValue > filter.maxPrice) {
          return false;
        }

        // Pricing Types
        if (filter?.pricingTypes && filter.pricingTypes.length > 0) {
          if (!filter.pricingTypes.includes(p.pricingType)) return false;
        }

        // Industries
        if (filter?.industries && filter.industries.length > 0) {
          if (!filter.industries.includes(p.industry)) return false;
        }

        // Business Sizes
        if (filter?.businessSizes && filter.businessSizes.length > 0) {
          const sizes = Array.isArray(p.businessSizes) ? p.businessSizes : [];
          if (!filter.businessSizes.some((s) => sizes.includes(s))) return false;
        }

        // Deployments
        if (filter?.deployments && filter.deployments.length > 0) {
          const deps = Array.isArray(p.deployment) ? p.deployment : [];
          if (!filter.deployments.some((d) => deps.includes(d))) return false;
        }

        // Platforms
        if (filter?.platforms && filter.platforms.length > 0) {
          const plats = Array.isArray(p.platforms) ? p.platforms : [];
          if (!filter.platforms.some((pl) => plats.includes(pl))) return false;
        }

        // Features
        if (filter?.features && filter.features.length > 0) {
          const feats = Array.isArray(p.features) ? p.features : [];
          const matchesFeat = filter.features.some((f) => feats.some((pf: string) => String(pf).toLowerCase().includes(f.toLowerCase())));
          if (!matchesFeat) return false;
        }

        // Languages
        if (filter?.languages && filter.languages.length > 0) {
          const langs = Array.isArray(p.languages) ? p.languages : [];
          if (!filter.languages.some((l) => langs.includes(l))) return false;
        }

        // Countries
        if (filter?.countries && filter.countries.length > 0) {
          const couns = Array.isArray(p.countries) ? p.countries : [];
          if (!filter.countries.some((c) => couns.includes(c))) return false;
        }

        // Multi-Field Search Query
        if (searchClean) {
          const matchesTitle = String(p.title || '').toLowerCase().includes(searchClean);
          const matchesDesc = String(p.description || p.shortDesc || '').toLowerCase().includes(searchClean);
          const matchesCat = String(p.categoryLabel || p.category || '').toLowerCase().includes(searchClean);
          const matchesInd = String(p.industry || p.tag || '').toLowerCase().includes(searchClean);
          const tags = Array.isArray(p.tags) ? p.tags : [];
          const matchesTag = tags.some((t: string) => String(t).toLowerCase().includes(searchClean));
          const feats = Array.isArray(p.features) ? p.features : [];
          const matchesFeat = feats.some((f: string) => String(f).toLowerCase().includes(searchClean));

          return matchesTitle || matchesDesc || matchesCat || matchesInd || matchesTag || matchesFeat;
        }

        return true;
      });

    } catch (_err) {
      return PRODUCT_STORE;
    }
  }

  static async getById(id: string) {
    return PRODUCT_STORE.find((p) => p.id === id) || db.product.findUnique({ where: { id } }).catch(() => null);
  }

  static async create(data: any) {
    const newProduct = {
      id: data.id || `prod-${Date.now()}`,
      order: data.order ?? PRODUCT_STORE.length,
      isEnabled: data.isEnabled ?? true,
      ...data
    };
    PRODUCT_STORE.unshift(newProduct);
    try {
      await db.product.create({ data: newProduct });
    } catch (_e) {
      // Memory store updated
    }
    return newProduct;
  }

  static async update(id: string, data: any) {
    PRODUCT_STORE = PRODUCT_STORE.map((p) => (p.id === id ? { ...p, ...data } : p));
    try {
      await db.product.update({ where: { id }, data });
    } catch (_e) {
      // Memory store updated
    }
    return PRODUCT_STORE.find((p) => p.id === id);
  }

  static async delete(id: string) {
    PRODUCT_STORE = PRODUCT_STORE.filter((p) => p.id !== id);
    try {
      await db.product.delete({ where: { id } });
    } catch (_e) {
      // Memory store updated
    }
    return { success: true, deletedId: id };
  }

  static async duplicate(id: string) {
    const original = PRODUCT_STORE.find((p) => p.id === id);
    if (!original) throw new Error('Product not found');
    const { id: _id, ...rest } = original;
    const duplicated = {
      ...rest,
      id: `copy-${Date.now()}`,
      title: `${rest.title} (Copy)`,
      order: PRODUCT_STORE.length
    };
    PRODUCT_STORE.unshift(duplicated);
    return duplicated;
  }

  static async toggleEnabled(id: string) {
    PRODUCT_STORE = PRODUCT_STORE.map((p) =>
      p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
    );
    return PRODUCT_STORE.find((p) => p.id === id);
  }

  static async reorder(orderedIds: string[]) {
    const map = new Map(orderedIds.map((id, index) => [id, index]));
    PRODUCT_STORE.sort((a, b) => (map.get(a.id) ?? 99) - (map.get(b.id) ?? 99));
    return PRODUCT_STORE;
  }
}
