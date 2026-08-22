import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Play,
  Zap,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Calendar,
  Cpu,
  FileText,
  AlertTriangle,
  RefreshCw,
  BadgeDollarSign
} from 'lucide-react';
import { apiFetch } from '../../config/api.config';
import { useNavigation } from '../../utils/NavigationContext';
import { resolveMediaUrl } from '../../utils/mediaUrl';

export interface ProductDetailData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryLabel: string;
  industry: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  price: string;
  priceValue: number;
  aiPowered: boolean;
  shortDesc: string;
  overviewText: string;
  impactMetrics: { label: string; value: string; desc: string }[];
  galleryScreenshots: { id: string; title: string; subtitle: string; tag: string }[];
  videoTour: { title: string; duration: string; thumbnail: string; videoUrl?: string };
  featuresList: { title: string; desc: string; icon: string }[];
  pricingTiers: { name: string; price: string; period: string; popular?: boolean; features: string[]; ctaText: string }[];
  technicalSpecs: { category: string; specs: { name: string; value: string }[] }[];
  faqs: { question: string; answer: string }[];
  customerReviews: { name: string; role: string; company: string; rating: number; date: string; title: string; review: string; verified: boolean }[];
  relatedProducts: { id: string; title: string; category: string; price: string; rating: number; shortDesc: string }[];
}

// ── DEFAULT CMS-READY PRODUCT DATASET ──
export const SAMPLE_PRODUCT_DETAIL: ProductDetailData = {
  id: 'schoolycore',
  title: 'SchoolyCore ERP',
  subtitle: 'K-12 & Higher-Education Automated Operations Suite',
  category: 'industry',
  categoryLabel: 'Education & Academics',
  industry: 'Education & Academics',
  badge: 'FEATURED SOLUTION',
  rating: 4.9,
  reviewsCount: 1420,
  price: 'From ₹49/mo',
  priceValue: 49,
  aiPowered: true,
  shortDesc: 'Complete K-12 and Higher-Ed Institute Management platform with automated fee collection, exams, grading, and multi-tenant parent & student portals.',
  overviewText: 'SchoolyCore ERP is designed specifically for modern academic institutions seeking to unify admissions, fee collection, attendance, examination grading, and parent communications into a single zero-friction cloud OS.',
  impactMetrics: [
    { label: 'Operational Time Saved', value: '+45%', desc: 'Reduction in administrative overhead and report generation' },
    { label: 'Fee Payment Recovery', value: '99.2%', desc: 'Automated WhatsApp & SMS payment gateway reminders' },
    { label: 'Parent Engagement', value: '4.8/5.0', desc: 'Active mobile app adoption rate across iOS and Android' }
  ],
  galleryScreenshots: [
    { id: '1', title: 'Executive Operations Dashboard', subtitle: 'Real-time student attendance, fee collections, and academic progress graphs.', tag: 'OVERVIEW' },
    { id: '2', title: 'Automated Fee Collection Engine', subtitle: 'Instant auto-generated invoices with multi-payment gateway reconciliation.', tag: 'FINANCE' },
    { id: '3', title: 'Exams & Automated Report Cards', subtitle: 'Configurable grading scales, transcript generators, and board compliance.', tag: 'ACADEMICS' },
    { id: '4', title: 'Parent & Student iOS / Android App', subtitle: 'Push notifications for homework, attendance alerts, and exam schedules.', tag: 'MOBILE' }
  ],
  videoTour: {
    title: 'Watch SchoolyCore 3-Minute Guided Product Demo',
    duration: '3:20 mins',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  featuresList: [
    { title: 'Online Admissions & Student Lifecycle', desc: 'Digital application portal with document verification, fee deposits, and enrollment numbers.', icon: 'GraduationCap' },
    { title: 'Automated Fee Billing & Auto-Receipts', desc: 'Schedule recurring fee cycles with SMS & WhatsApp payment links and instant GST receipts.', icon: 'BadgeDollarSign' },
    { title: 'Biometric & Geo-Fenced Mobile Attendance', desc: 'Real-time staff and student attendance logging with automatic parent SMS notifications.', icon: 'Users2' },
    { title: 'Exam Grading & Transcript Generator', desc: 'Customizable grading formulas, GPA calculation, and instant print-ready report cards.', icon: 'FileText' },
    { title: 'Transport & GPS Fleet Live Tracking', desc: 'Real-time route tracking for school buses with parent ETA notifications.', icon: 'Truck' },
    { title: 'Library & Asset Inventory Management', desc: 'Barcode scanner integration for book checkouts, fines, and lab equipment tracking.', icon: 'Boxes' }
  ],
  pricingTiers: [
    {
      name: 'Starter Institute',
      price: '₹29',
      period: '/month',
      features: [
        'Up to 500 Students',
        'Student & Staff Records',
        'Basic Fee Billing & Receipts',
        'Exam Grading Engine',
        'Email Support'
      ],
      ctaText: 'Start 14-Day Free Trial'
    },
    {
      name: 'Professional Campus',
      price: '₹49',
      period: '/month',
      popular: true,
      features: [
        'Up to 2,000 Students',
        'Parent & Student Mobile Apps',
        'WhatsApp Payment Reminders',
        'Biometric Attendance Sync',
        'Transport GPS Fleet Tracker',
        '24/7 Priority Support'
      ],
      ctaText: 'Start Free Trial'
    },
    {
      name: 'Enterprise Network',
      price: '₹99',
      period: '/month',
      features: [
        'Unlimited Students & Campuses',
        'Dedicated Private Cloud Cluster',
        'Custom Webhooks & REST API',
        'Single Sign-On (SSO / SAML 2.0)',
        'Custom Board Report Cards',
        'Dedicated Success Manager'
      ],
      ctaText: 'Contact Enterprise Team'
    }
  ],
  technicalSpecs: [
    {
      category: 'Deployment & Hosting',
      specs: [
        { name: 'Architecture', value: 'Multi-tenant Isolated Microservices' },
        { name: 'Cloud Infrastructure', value: 'AWS / Azure High-Availability Regions' },
        { name: 'Uptime SLA Guarantee', value: '99.99% Financial Backed SLA' }
      ]
    },
    {
      category: 'API & Integrations',
      specs: [
        { name: 'API Standards', value: 'RESTful API & GraphQL Connectors' },
        { name: 'Authentication', value: 'OAuth 2.0, SAML 2.0, Okta, Azure AD' },
        { name: 'Webhooks', value: 'Real-time Webhook Event Triggers' }
      ]
    },
    {
      category: 'Security & Governance',
      specs: [
        { name: 'Compliance Certifications', value: 'SOC 2 Type II, GDPR, ISO 27001' },
        { name: 'Data Encryption', value: 'AES-256 at Rest, TLS 1.3 in Transit' },
        { name: 'Audit Logging', value: 'Immutable User Activity Log History' }
      ]
    }
  ],
  faqs: [
    { question: 'How long does implementation take for a new school?', answer: 'Most institutions complete full data migration and onboarding within 3 to 5 business days using our automated Excel/CSV import tool.' },
    { question: 'Can we customize report cards according to our education board rules?', answer: 'Yes! SchoolyCore includes a drag-and-drop template designer supporting CBSE, ICSE, IB, State Board, and university grading scales.' },
    { question: 'Does the mobile app support offline attendance logging?', answer: 'Yes. Staff can record attendance offline, and the mobile app automatically synchronizes records as soon as internet connectivity is restored.' },
    { question: 'Is my student data secure and compliant with privacy regulations?', answer: 'Absolutely. We maintain bank-grade AES-256 encryption, strict role-based access control, and complete GDPR and SOC2 compliance.' }
  ],
  customerReviews: [
    {
      name: 'Dr. Robert Sterling',
      role: 'Principal & Academic Director',
      company: 'St. Jude International Academy',
      rating: 5,
      date: 'August 2, 2026',
      title: 'Transformed our fee collection and parent trust',
      review: 'Implementing SchoolyCore reduced our uncollected fee ratio from 14% down to under 1% in just two quarters. The WhatsApp automated reminders are a game changer.',
      verified: true
    },
    {
      name: 'Elena Rostova',
      role: 'Head of IT & Operations',
      company: 'Apex Global Education Network',
      rating: 5,
      date: 'July 24, 2026',
      title: 'Seamless rollout across 8 campuses',
      review: 'We migrated 12,000 student records in less than a week. The API webhooks enabled seamless integration with our custom accounting software.',
      verified: true
    }
  ],
  relatedProducts: [
    { id: 'dezoryn-hrms', title: 'Dezoryn HRMS Pulse', category: 'HR & Payroll', price: 'From ₹2,999/mo', rating: 4.9, shortDesc: 'Automated staff payroll, biometric attendance, and performance appraisals.' },
    { id: 'fintrack-erp', title: 'FinTrack Enterprise ERP', category: 'Finance & Tax', price: 'From ₹3,499/mo', rating: 4.8, shortDesc: 'General ledger, multi-currency accounting, and automated GST billing.' },
    { id: 'hms-health', title: 'Dezo Care HMS', category: 'Healthcare', price: 'From ₹6,999/mo', rating: 4.8, shortDesc: 'Enterprise Hospital Management System covering OPD/IPD and EHR.' }
  ]
};

export const PRODUCT_DETAILS_MAP: Record<string, ProductDetailData> = {
  'schoolycore': SAMPLE_PRODUCT_DETAIL,

  'dezo-commerce-engine': {
    id: 'dezo-commerce-engine',
    title: 'Dezo Commerce Engine',
    subtitle: 'Headless E-Commerce API & Omnichannel Retail OS',
    category: 'industry',
    categoryLabel: 'E-Commerce & Retail',
    industry: 'E-Commerce & Retail',
    badge: 'RETAIL OS',
    rating: 4.85,
    reviewsCount: 940,
    price: 'From $39/mo',
    priceValue: 39,
    aiPowered: true,
    shortDesc: 'Headless e-commerce API, retail POS terminal integration, subscription payments, and customer loyalty rewards.',
    overviewText: 'Dezo Commerce Engine provides enterprise retailers with a modular headless commerce framework, sub-millisecond API response speeds, omnichannel inventory sync, and integrated retail point-of-sale.',
    impactMetrics: [
      { label: 'Checkout Conversion', value: '+34%', desc: '1-click checkout API and local currency routing' },
      { label: 'API Response Speed', value: '14ms', desc: 'Global CDN edge cached REST & GraphQL APIs' },
      { label: 'Cart Abandonment Drop', value: '-28%', desc: 'Automated WhatsApp & Email cart recovery flows' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Omnichannel Order & Inventory Matrix', subtitle: 'Live inventory sync across web storefronts, mobile apps, and physical POS terminals.', tag: 'INVENTORY' },
      { id: '2', title: 'Headless Storefront API Portal', subtitle: 'Developer dashboard for API keys, webhook endpoints, and GraphQL exploration.', tag: 'API' },
      { id: '3', title: 'Retail POS Terminal Dashboard', subtitle: 'Barcode scanner integration, instant receipt printing, and daily cash reconciliation.', tag: 'POS' }
    ],
    videoTour: {
      title: 'Watch Dezo Commerce Engine Guided Product Demo',
      duration: '3:45 mins',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67daf64f42?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    featuresList: [
      { title: 'Headless Storefront API & React SDK', desc: 'Build ultra-fast storefronts with Next.js or mobile SDKs.', icon: 'ShoppingBag' },
      { title: 'Omnichannel POS Terminal Sync', desc: 'Connect physical retail stores with online inventory in real-time.', icon: 'Store' },
      { title: 'Multi-Currency & Regional Taxes', desc: 'Auto currency conversion and localized payment gateways.', icon: 'BadgeDollarSign' }
    ],
    pricingTiers: [
      {
        name: 'Growth Merchant',
        price: '$39',
        period: '/month',
        features: ['Up to 10,000 Monthly Orders', 'Headless REST & GraphQL APIs', 'Single Online Storefront', 'Standard Support'],
        ctaText: 'Start 14-Day Free Trial'
      },
      {
        name: 'Omnichannel Pro',
        price: '$89',
        period: '/month',
        popular: true,
        features: ['Up to 100,000 Monthly Orders', '5 Physical POS Terminals', 'Cart Recovery Workflows', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [
      {
        category: 'API & Performance',
        specs: [
          { name: 'Architecture', value: 'Headless Microservices & Edge GraphQL' },
          { name: 'Latency', value: '< 20ms Global Average Response Time' }
        ]
      }
    ],
    faqs: [
      { question: 'Can I use Dezo Commerce Engine with Next.js or React?', answer: 'Yes! We provide official React, Next.js, and React Native SDKs.' }
    ],
    customerReviews: [
      {
        name: 'Marcus Vance',
        role: 'VP of E-Commerce',
        company: 'Urban Threads Apparel',
        rating: 5,
        date: 'August 10, 2026',
        title: 'Migrated 14 retail stores and web in 2 weeks',
        review: 'Dezo Commerce Engine combined our online store and physical store inventories flawlessly.',
        verified: true
      }
    ],
    relatedProducts: [
      { id: 'dezo-analytics-bi', title: 'Dezo Analytics BI', category: 'Analytics', price: 'From $65/mo', rating: 4.9, shortDesc: 'Interactive executive dashboards and data queries.' },
      { id: 'inventory-pro', title: 'InventoryPro Matrix', category: 'Supply Chain', price: 'From ₹35/mo', rating: 4.7, shortDesc: 'Multi-warehouse stock control.' }
    ]
  },

  'dezo-analytics-bi': {
    id: 'dezo-analytics-bi',
    title: 'Dezo Analytics BI',
    subtitle: 'Natural Language AI Query & Interactive Executive BI Dashboards',
    category: 'ai',
    categoryLabel: 'Business Intelligence & Data',
    industry: 'Business Intelligence & Data',
    badge: 'AI BI OS',
    rating: 4.9,
    reviewsCount: 870,
    price: 'From $65/mo',
    priceValue: 65,
    aiPowered: true,
    shortDesc: 'Natural language query BI platform to turn raw SQL databases into interactive executive dashboards and PDF reports.',
    overviewText: 'Dezo Analytics BI empowers decision-makers to ask complex business data questions in plain English and receive instant, beautifully visualized charts and automated scheduled reports.',
    impactMetrics: [
      { label: 'Report Creation Time', value: '1-Click', desc: 'AI converts natural language prompts to live dashboards' },
      { label: 'Query Execution Speed', value: '3x Faster', desc: 'In-memory columnar caching for big data queries' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Executive KPI Command Center', subtitle: 'Live revenue pipelines, churn rates, operating margin metrics.', tag: 'DASHBOARD' },
      { id: '2', title: 'Natural Language "Ask Data" AI Assistant', subtitle: 'Type plain English questions like "Show Q3 revenue by category".', tag: 'AI ASSISTANT' }
    ],
    videoTour: {
      title: 'Watch Dezo Analytics BI 3-Minute Natural Language Query Demo',
      duration: '3:15 mins',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    featuresList: [
      { title: 'Natural Language AI "Ask Data" Query Engine', desc: 'Type questions in English to generate SQL queries and charts.', icon: 'BarChart3' },
      { title: 'Drag-and-Drop Interactive BI Dashboard Builder', desc: 'Build custom executive views with responsive widgets.', icon: 'Zap' },
      { title: 'Multi-Source Database Connectors', desc: 'Native drivers for Postgres, Snowflake, BigQuery, and Mongo.', icon: 'Cpu' }
    ],
    pricingTiers: [
      {
        name: 'Starter Analyst',
        price: '$65',
        period: '/month',
        features: ['Up to 5 Data Sources', '10 Dashboard Seats', 'Daily PDF Exports'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Pro Analytics Suite',
        price: '$149',
        period: '/month',
        popular: true,
        features: ['Unlimited Data Connectors', '50 User Seats', 'AI Query Engine', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [],
    faqs: [
      { question: 'Do non-technical users need to know SQL?', answer: 'Not at all! Our AI interface converts natural language queries directly into charts.' }
    ],
    customerReviews: [
      {
        name: 'Sarah Jenkins',
        role: 'Chief Data Officer',
        company: 'Finova Global',
        rating: 5,
        date: 'August 5, 2026',
        title: 'Replaced our legacy BI tools',
        review: 'Dezo Analytics BI allowed our C-suite to get instant answers without filing data tickets.',
        verified: true
      }
    ],
    relatedProducts: [
      { id: 'sales-ai-copilot', title: 'DezoAI Sales Copilot', category: 'AI Suite', price: 'From ₹79/mo', rating: 4.95, shortDesc: 'Autonomous AI agent for lead scoring.' }
    ]
  },

  'dezoryn-hrms': {
    id: 'dezoryn-hrms',
    title: 'Dezoryn HRMS Pulse',
    subtitle: 'Automated Human Resource, Biometric Attendance & Payroll OS',
    category: 'erp',
    categoryLabel: 'ERP & Operations',
    industry: 'HR & People Operations',
    badge: 'ENTERPRISE HR',
    rating: 4.9,
    reviewsCount: 2100,
    price: 'From ₹39/mo',
    priceValue: 39,
    aiPowered: true,
    shortDesc: 'Automated Human Resource suite for 1-click payroll processing, biometric attendance, performance appraisals, and employee self-service.',
    overviewText: 'Dezoryn HRMS Pulse unifies your entire employee lifecycle—from hiring and digital onboarding to multi-state automated payroll runs, biometric attendance tracking, and OKR goal appraisals.',
    impactMetrics: [
      { label: 'Payroll Processing Time', value: '1 Click', desc: 'Auto-calculated PF, ESI, TDS, and salary slip distribution' },
      { label: 'Attendance Compliance', value: '99.8%', desc: 'Real-time biometric and geo-fenced mobile check-ins' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Workforce Dashboard', subtitle: 'Real-time headcount, attendance percentage, and payroll expenses.', tag: 'PEOPLE' }
    ],
    videoTour: {
      title: 'Watch Dezoryn HRMS Pulse Guided Overview',
      duration: '3:30 mins',
      thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    featuresList: [
      { title: '1-Click Multi-State Automated Payroll Run', desc: 'Compute salaries, PF, ESI, and generate digital payslips instantly.', icon: 'Users2' },
      { title: 'Biometric & Mobile Attendance', desc: 'Sync biometric devices and mobile GPS check-ins into attendance rosters.', icon: 'CheckCircle2' }
    ],
    pricingTiers: [
      {
        name: 'Growth Enterprise',
        price: '₹89',
        period: '/month',
        popular: true,
        features: ['Up to 250 Employees', 'Biometric Device Integration', 'ESS Mobile App', '24/7 Support'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  },

  'hms-health': {
    id: 'hms-health',
    title: 'Dezo Care HMS',
    subtitle: 'Enterprise Hospital Management System & EHR OS',
    category: 'industry',
    categoryLabel: 'Healthcare & Telemedicine',
    industry: 'Healthcare & Telemedicine',
    badge: 'NABH READY',
    rating: 4.8,
    reviewsCount: 890,
    price: 'From ₹89/mo',
    priceValue: 89,
    aiPowered: true,
    shortDesc: 'Enterprise Hospital Management System covering OPD/IPD, Electronic Health Records, Pharmacy, and Telehealth.',
    overviewText: 'Dezo Care HMS is engineered for multi-specialty hospitals and clinics seeking NABH compliant digital patient workflows, automated bed management, and digital prescriptions.',
    impactMetrics: [
      { label: 'Patient Wait Time', value: '-40%', desc: 'Digital check-in and queue management' },
      { label: 'OPD Billing Efficiency', value: '99.5%', desc: 'Automated insurance & prescription reconciliation' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Hospital OPD & Bed Management', subtitle: 'Live bed occupancy rates, doctor schedules, and OPD queue desk.', tag: 'HEALTHCARE' },
      { id: '2', title: 'Electronic Health Records (EHR)', subtitle: 'ICD-10 coded medical histories, lab test results, and pharmacy scripts.', tag: 'CLINICAL' }
    ],
    videoTour: {
      title: 'Watch Dezo Care HMS Product Tour',
      duration: '3:50 mins',
      thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    featuresList: [
      { title: 'OPD / IPD Patient Management', desc: 'Streamline patient registrations, bed allocations, and discharge summary generation.', icon: 'Cross' },
      { title: 'Pharmacy & Lab Billing Sync', desc: 'Auto-deduct medicine stock and sync lab test reports into patient charts.', icon: 'Zap' }
    ],
    pricingTiers: [
      {
        name: 'Clinic Standard',
        price: '₹89',
        period: '/month',
        features: ['Up to 5 OPD Counters', 'Digital Prescriptions', 'Basic EHR & Billing', 'Standard Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Hospital Enterprise',
        price: '₹249',
        period: '/month',
        popular: true,
        features: ['Unlimited Beds & OPD', 'NABH Compliance Audit', 'IPD & ICU Bed Matrix', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [],
    faqs: [
      { question: 'Is Dezo Care HMS NABH compliant?', answer: 'Yes! It includes built-in NABH audit trails, consent forms, and electronic patient records.' }
    ],
    customerReviews: [],
    relatedProducts: []
  },

  'inventory-pro': {
    id: 'inventory-pro',
    title: 'InventoryPro Matrix',
    subtitle: 'Multi-Warehouse Stock Control & Supply Chain OS',
    category: 'erp',
    categoryLabel: 'Supply Chain & Inventory',
    industry: 'Supply Chain & Logistics',
    badge: 'SUPPLY CHAIN',
    rating: 4.7,
    reviewsCount: 650,
    price: 'From ₹35/mo',
    priceValue: 35,
    aiPowered: true,
    shortDesc: 'Multi-warehouse stock control, barcode scanner integration, automated purchase reordering, and batch expiry tracking.',
    overviewText: 'InventoryPro Matrix gives supply chain managers real-time visibility across global warehouses, automated batch tracking, and low-stock reorder triggers.',
    impactMetrics: [
      { label: 'Stockout Reduction', value: '-65%', desc: 'Automated reorder triggers based on velocity' },
      { label: 'Warehouse Pick Speed', value: '+50%', desc: 'Mobile barcode scanner routing' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Multi-Warehouse Inventory Matrix', subtitle: 'Live stock balances across distribution centers and retail stores.', tag: 'STOCK' }
    ],
    videoTour: {
      title: 'Watch InventoryPro Matrix Guided Product Demo',
      duration: '3:10 mins',
      thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    featuresList: [
      { title: 'Multi-Location Stock Sync', desc: 'Track items across multiple stores and distribution hubs in real-time.', icon: 'Boxes' },
      { title: 'Barcode & QR Scanner Integration', desc: 'Instant mobile scanning for receiving, picking, and dispatching orders.', icon: 'Zap' }
    ],
    pricingTiers: [
      {
        name: 'Single Warehouse',
        price: '₹35',
        period: '/month',
        features: ['Up to 5,000 SKUs', 'Barcode Scanning', 'Purchase Orders', 'Email Support'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  },

  'sales-ai-copilot': {
    id: 'sales-ai-copilot',
    title: 'DezoAI Sales Copilot',
    subtitle: 'Autonomous AI Sales Agent & Predictive Lead Scoring Engine',
    category: 'ai',
    categoryLabel: 'AI & Machine Learning',
    industry: 'Sales & Revenue Operations',
    badge: 'AI COPILOT',
    rating: 4.95,
    reviewsCount: 3400,
    price: 'From ₹79/mo',
    priceValue: 79,
    aiPowered: true,
    shortDesc: 'Autonomous AI agent to score leads, generate personalized multi-channel cadences, and predict pipeline deal close rates.',
    overviewText: 'DezoAI Sales Copilot continuously analyzes thousands of buyer intent signals to prioritize high-converting leads, automate outreach, and boost rep win rates.',
    impactMetrics: [
      { label: 'Lead Win Rate Boost', value: '4.8x', desc: 'Predictive intent signal scoring' },
      { label: 'Outreach Time Saved', value: '18 hrs/wk', desc: 'Autonomous email & WhatsApp agent' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'AI Predictive Lead Scoring Command Center', subtitle: 'Real-time buyer intent scores and recommended next-best actions.', tag: 'AI' }
    ],
    videoTour: {
      title: 'Watch DezoAI Sales Copilot Demo',
      duration: '2:50 mins',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    featuresList: [
      { title: 'Predictive Intent Lead Scoring', desc: 'Machine learning model ranks leads by likelihood to convert.', icon: 'Sparkles' },
      { title: 'Autonomous Multi-Channel Cadences', desc: 'Personalized email and WhatsApp sequences powered by LLM.', icon: 'Zap' }
    ],
    pricingTiers: [
      {
        name: 'Starter AI',
        price: '₹79',
        period: '/month',
        features: ['Up to 1,000 Scored Leads/mo', 'Email Cadence Generator', 'CRM 1-Click Sync', 'Standard Support'],
        ctaText: 'Start 14-Day Free Trial'
      },
      {
        name: 'Pro Copilot',
        price: '₹199',
        period: '/month',
        popular: true,
        features: ['Up to 10,000 Scored Leads/mo', 'Autonomous WhatsApp & Email Cadences', 'Predictive Deal Close Analytics', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Autonomous Enterprise',
        price: '₹499',
        period: '/month',
        features: ['Unlimited Leads & Custom LLMs', 'Dedicated Fine-Tuned Model Cluster', 'Custom API Webhooks & SLA', 'Dedicated Success Manager'],
        ctaText: 'Contact Enterprise Team'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  },

  'dezo-crm-suite': {
    id: 'dezo-crm-suite',
    title: 'Dezo CRM 360',
    subtitle: 'Unified Sales Pipeline, Deal Kanban & Omnichannel Inbox',
    category: 'crm',
    categoryLabel: 'CRM & Sales Operations',
    industry: 'Customer Relationship Management',
    badge: 'SALES OS',
    rating: 4.85,
    reviewsCount: 1850,
    price: 'From ₹29/mo',
    priceValue: 29,
    aiPowered: true,
    shortDesc: 'Unified customer relationship management with drag-and-drop deal Kanban, omnichannel inbox, custom webhooks, and sales rep leaderboards.',
    overviewText: 'Dezo CRM 360 streamlines your entire sales process from lead capture to contract closure with custom pipeline stages and real-time deal revenue forecasting.',
    impactMetrics: [
      { label: 'Pipeline Velocity', value: '+38%', desc: 'Automated deal stage transitions and task alerts' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Visual Drag-and-Drop Deal Kanban', subtitle: 'Customize stages, track deal values, and assign rep tasks.', tag: 'KANBAN' }
    ],
    videoTour: {
      title: 'Watch Dezo CRM 360 Walkthrough',
      duration: '3:00 mins',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    featuresList: [
      { title: 'Drag-and-Drop Deal Kanban', desc: 'Track sales deals through customizable stage pipelines.', icon: 'Zap' }
    ],
    pricingTiers: [
      {
        name: 'Starter CRM',
        price: '₹29',
        period: '/month',
        features: ['Up to 5 Sales Rep Seats', 'Visual Drag & Drop Kanban', 'Contact & Lead Records', 'Standard Email Support'],
        ctaText: 'Start 14-Day Free Trial'
      },
      {
        name: 'Growth CRM',
        price: '₹79',
        period: '/month',
        popular: true,
        features: ['Up to 25 Sales Rep Seats', 'Omnichannel Customer Inbox', 'Automated Deal Stage Triggers', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Enterprise 360',
        price: '₹169',
        period: '/month',
        features: ['Unlimited Rep Seats & Pipelines', 'Custom Webhooks & REST API', 'Quota Attainment Leaderboards', 'Dedicated Account Manager'],
        ctaText: 'Contact Enterprise Team'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  },

  'dezo-sec-vault': {
    id: 'dezo-sec-vault',
    title: 'DezoVault Security',
    subtitle: 'Enterprise SAML SSO, Role Access & Encrypted Audit OS',
    category: 'security',
    categoryLabel: 'Security & Governance',
    industry: 'Cybersecurity & Compliance',
    badge: 'SOC2 TYPE II',
    rating: 4.9,
    reviewsCount: 920,
    price: 'From ₹59/mo',
    priceValue: 59,
    aiPowered: false,
    shortDesc: 'Bank-grade compliance, identity access management, single sign-on (SSO), and immutable encrypted audit logs.',
    overviewText: 'DezoVault Security secures enterprise cloud apps with zero-trust access policies, SAML 2.0 / Okta integration, and real-time threat audit trails.',
    impactMetrics: [
      { label: 'Security Compliance', value: '100%', desc: 'SOC2 Type II and GDPR ready architecture' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'Identity & SAML SSO Governance Portal', subtitle: 'Manage active sessions, Okta integration, and RBAC rules.', tag: 'SECURITY' }
    ],
    videoTour: {
      title: 'Watch DezoVault Security Demo',
      duration: '3:10 mins',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    featuresList: [
      { title: 'SAML 2.0 Single Sign-On', desc: 'Connect Okta, Azure AD, or Google Workspace instantly.', icon: 'ShieldCheck' }
    ],
    pricingTiers: [
      {
        name: 'Vault Standard',
        price: '₹59',
        period: '/month',
        features: ['Up to 50 SSO Identity Users', 'Role-Based Access Control', 'Basic Encrypted Audit Logs', 'Standard Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Vault Pro',
        price: '₹149',
        period: '/month',
        popular: true,
        features: ['Up to 500 SSO Identity Users', 'SAML 2.0 / Okta / Azure AD', 'Real-Time Anomaly Threat Detection', '24/7 Security Operations Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Zero Trust Enterprise',
        price: '₹299',
        period: '/month',
        features: ['Unlimited Identity Users', 'Dedicated Private Cluster Isolation', 'Custom Audit Export & SIEM Integration', 'Dedicated Compliance Manager'],
        ctaText: 'Contact Security Team'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  },

  'fintrack-erp': {
    id: 'fintrack-erp',
    title: 'FinTrack Enterprise ERP',
    subtitle: 'Multi-Currency Accounting, GST Invoicing & Financial OS',
    category: 'finance',
    categoryLabel: 'Finance & Accounting',
    industry: 'Finance & Accounting',
    badge: 'FINANCE OS',
    rating: 4.8,
    reviewsCount: 1150,
    price: 'From ₹45/mo',
    priceValue: 45,
    aiPowered: true,
    shortDesc: 'General ledger, multi-currency accounting, automated GST/tax billing, and cash flow profit & loss forecasting.',
    overviewText: 'FinTrack Enterprise ERP automates book-keeping, bank reconciliation, multi-currency invoicing, and government tax compliance.',
    impactMetrics: [
      { label: 'Tax Closing Speed', value: '5x Faster', desc: 'Automated GST reconciliation and E-Way bill generation' }
    ],
    galleryScreenshots: [
      { id: '1', title: 'General Ledger & Financial Command Center', subtitle: 'Real-time P&L, balance sheets, and bank feed reconciliation.', tag: 'FINANCE' }
    ],
    videoTour: {
      title: 'Watch FinTrack Enterprise ERP Demo',
      duration: '3:30 mins',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    },
    featuresList: [
      { title: 'Automated GST & Multi-Tax Billing', desc: 'Generate GST-compliant invoices and auto-file e-way bills.', icon: 'Zap' }
    ],
    pricingTiers: [
      {
        name: 'FinTrack Basic',
        price: '₹45',
        period: '/month',
        features: ['Up to 500 Invoices/mo', 'GST Compliant Invoicing', 'Single-Currency Ledger', 'Email Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'FinTrack Pro',
        price: '₹119',
        period: '/month',
        popular: true,
        features: ['Multi-Currency Ledger & FX Sync', 'Automated E-Way Bill & Tax Filing', 'Real-Time Cash Flow Forecasting', '24/7 Priority Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Corporate ERP',
        price: '₹249',
        period: '/month',
        features: ['Unlimited Invoices & Entities', 'Multi-Company Consolidated Ledger', 'Custom Bank API Reconciliation', 'Dedicated Financial Advisor'],
        ctaText: 'Contact Enterprise Team'
      }
    ],
    technicalSpecs: [],
    faqs: [],
    customerReviews: [],
    relatedProducts: []
  }
};

// Aliases for canonical resolution
PRODUCT_DETAILS_MAP['hms'] = PRODUCT_DETAILS_MAP['hms-health'];
PRODUCT_DETAILS_MAP['hospital-management'] = PRODUCT_DETAILS_MAP['hms-health'];
PRODUCT_DETAILS_MAP['hrms'] = PRODUCT_DETAILS_MAP['dezoryn-hrms'];
PRODUCT_DETAILS_MAP['hrms-payroll'] = PRODUCT_DETAILS_MAP['dezoryn-hrms'];
PRODUCT_DETAILS_MAP['inventorypro'] = PRODUCT_DETAILS_MAP['inventory-pro'];
PRODUCT_DETAILS_MAP['inventory-management'] = PRODUCT_DETAILS_MAP['inventory-pro'];
PRODUCT_DETAILS_MAP['school-erp'] = PRODUCT_DETAILS_MAP['schoolycore'];
PRODUCT_DETAILS_MAP['crm-platform'] = PRODUCT_DETAILS_MAP['sales-ai-copilot'];
PRODUCT_DETAILS_MAP['dezo-crm'] = PRODUCT_DETAILS_MAP['dezo-crm-suite'];
PRODUCT_DETAILS_MAP['crm'] = PRODUCT_DETAILS_MAP['dezo-crm-suite'];
PRODUCT_DETAILS_MAP['security'] = PRODUCT_DETAILS_MAP['dezo-sec-vault'];
PRODUCT_DETAILS_MAP['finance'] = PRODUCT_DETAILS_MAP['fintrack-erp'];

export function normalizeProductId(rawId?: string): string {
  if (!rawId) return 'schoolycore';
  const clean = String(rawId).toLowerCase().trim();
  const aliasMap: Record<string, string> = {
    'hms': 'hms-health',
    'hospital-management': 'hms-health',
    'hrms': 'dezoryn-hrms',
    'hrms-payroll': 'dezoryn-hrms',
    'inventorypro': 'inventory-pro',
    'inventory-management': 'inventory-pro',
    'school-erp': 'schoolycore',
    'crm-platform': 'sales-ai-copilot',
    'dezo-crm': 'dezo-crm-suite',
    'crm': 'dezo-crm-suite',
    'security': 'dezo-sec-vault',
    'finance': 'fintrack-erp'
  };
  return aliasMap[clean] || clean;
}

export function createGenericProductDetail(id: string, partial?: any): ProductDetailData {
  const normalizedId = normalizeProductId(id);
  if (PRODUCT_DETAILS_MAP[normalizedId]) {
    return { ...PRODUCT_DETAILS_MAP[normalizedId], ...partial };
  }

  const title = partial?.title || formatTitleFromId(normalizedId);
  const categoryLabel = partial?.categoryLabel || partial?.tag || 'Enterprise Software';
  const shortDesc = partial?.description || partial?.shortDesc || `Enterprise automated platform engineered for ${title}.`;

  return {
    id: normalizedId,
    title,
    subtitle: partial?.subtitle || `${categoryLabel} Automation Suite`,
    category: partial?.category || 'industry',
    categoryLabel,
    industry: partial?.industry || categoryLabel,
    badge: partial?.badge || 'ENTERPRISE',
    rating: partial?.rating || 4.85,
    reviewsCount: partial?.reviewsCount || 640,
    price: partial?.price || 'From ₹49/mo',
    priceValue: partial?.priceValue || 49,
    aiPowered: partial?.aiPowered ?? true,
    shortDesc,
    overviewText: partial?.overviewText || partial?.description || `${title} unifies workflow automation, real-time analytics, and enterprise data management into a single cloud operating platform.`,
    impactMetrics: [
      { label: 'Efficiency Gain', value: '+42%', desc: 'Reduction in manual operational tasks' },
      { label: 'System Uptime SLA', value: '99.99%', desc: 'Multi-region fault-tolerant infrastructure' },
      { label: 'User Rating', value: '4.9/5', desc: 'Verified enterprise rating' }
    ],
    galleryScreenshots: [
      { id: '1', title: `${title} Command Center`, subtitle: 'Real-time metrics, activity logs, and status graphs.', tag: 'OVERVIEW' },
      { id: '2', title: 'Automated Workflow Engine', subtitle: 'Configurable rules, triggers, and notification pipelines.', tag: 'AUTOMATION' }
    ],
    videoTour: {
      title: `Watch ${title} 3-Minute Guided Product Demo`,
      duration: '3:15 mins',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    featuresList: Array.isArray(partial?.features) && partial.features.length > 0
      ? partial.features.map((f: any) => typeof f === 'string' ? { title: f, desc: `Enterprise automated ${f.toLowerCase()} capability.`, icon: 'Zap' } : f)
      : [
          { title: 'Workflow Automation', desc: 'Eliminate repetitive manual tasks with automated triggers.', icon: 'Zap' },
          { title: 'Real-Time Analytics & Logs', desc: 'Live operational insights and exportable audit trails.', icon: 'BarChart3' },
          { title: 'Bank-Grade Security & RBAC', desc: '256-bit encryption, role-based access control, and SAML SSO.', icon: 'ShieldCheck' }
        ],
    pricingTiers: [
      {
        name: 'Starter Enterprise',
        price: partial?.price || '₹49',
        period: '/month',
        features: ['Full Core Suite Access', 'Standard Cloud Hosting', '99.9% Uptime SLA', 'Email Support'],
        ctaText: 'Start Free Trial'
      },
      {
        name: 'Pro Automation',
        price: '₹149',
        period: '/month',
        popular: true,
        features: ['Unlimited Workflows & Users', 'Dedicated API Rate Limits', '24/7 Priority Support', 'Custom SLA'],
        ctaText: 'Start Free Trial'
      }
    ],
    technicalSpecs: [],
    faqs: [
      { question: `How fast can we deploy ${title}?`, answer: 'Deployment takes under 15 minutes with our pre-built cloud infrastructure.' }
    ],
    customerReviews: [],
    relatedProducts: [
      { id: 'sales-ai-copilot', title: 'DezoAI Sales Copilot', category: 'AI Suite', price: 'From ₹79/mo', rating: 4.95, shortDesc: 'Autonomous AI agent for lead scoring.' }
    ]
  };
}

function formatTitleFromId(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── HIGH PERFORMANCE HTML5 VIDEO PLAYER COMPONENT ──
const VideoPlayerContainer: React.FC<{
  videoUrl: string;
  posterUrl?: string;
  title: string;
  duration?: string;
}> = ({ videoUrl, posterUrl, title, duration }) => {
  const resolvedUrl = resolveMediaUrl(videoUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasError(false);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  return (
    <div className="relative w-full h-[240px] sm:h-[420px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group select-none">
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-bold text-slate-300">Loading video stream...</span>
        </div>
      )}

      {/* Error Fallback Card */}
      {hasError ? (
        <div className="p-6 text-center space-y-3 z-20 max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-extrabold text-white">Video Stream Unavailable</h4>
          <p className="text-xs text-slate-400">
            Unable to load video stream for <span className="text-white font-bold">{title}</span>. Please verify your connection or try again.
          </p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => setHasError(true));
              }
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-cyan-300 border border-slate-700 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={resolvedUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            preload="auto"
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onPlaying={() => {
              setIsLoading(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            className="w-full h-full object-contain bg-black"
          />

          {/* Initial Overlay Play Button before playback starts */}
          {!isPlaying && !isLoading && (
            <div
              onClick={handlePlayClick}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-10 hover:bg-slate-950/30 transition"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition transform hover:scale-105">
                <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
              </div>
              <div className="text-sm font-extrabold text-white mt-3">Click to Start Walkthrough</div>
              {duration && <div className="text-xs font-mono text-cyan-300 mt-1">Duration: {duration}</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const ProductDetailPage: React.FC<{ productId?: string }> = ({ productId }) => {
  const { navigateTo } = useNavigation();
  
  const scrollToPricing = () => {
    const el = document.getElementById('pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateTo(`/marketplace?product=${encodeURIComponent(product.id)}`);
    }
  };

  const activeId = useMemo(() => {
    const raw = productId || new URLSearchParams(window.location.search).get('id') || new URLSearchParams(window.location.search).get('productId');
    return normalizeProductId(raw || 'schoolycore');
  }, [productId]);

  const initialProduct = useMemo(() => {
    return PRODUCT_DETAILS_MAP[activeId] || createGenericProductDetail(activeId);
  }, [activeId]);

  const [product, setProduct] = useState<ProductDetailData>(initialProduct);
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const localBase = PRODUCT_DETAILS_MAP[activeId] || createGenericProductDetail(activeId);
    setProduct(localBase);

    const fetchBackendProduct = async () => {
      try {
        const res = await apiFetch(`/products/${activeId}`);
        const result = await res.json();
        if (result.success && result.data) {
          const apiProd = result.data;
          setProduct(createGenericProductDetail(activeId, {
            ...localBase,
            ...apiProd,
            id: apiProd.id || activeId,
            title: apiProd.title || localBase.title,
            subtitle: apiProd.subtitle || localBase.subtitle,
            shortDesc: apiProd.description || apiProd.shortDesc || localBase.shortDesc,
            overviewText: apiProd.overviewText || apiProd.description || localBase.overviewText,
            rating: apiProd.rating || localBase.rating,
            reviewsCount: apiProd.reviewsCount || localBase.reviewsCount,
            price: apiProd.price || localBase.price,
            pricingTiers: (Array.isArray(apiProd.pricingTiers) && apiProd.pricingTiers.length > 0)
              ? apiProd.pricingTiers
              : localBase.pricingTiers,
            featuresList: (Array.isArray(apiProd.features) && apiProd.features.length > 0)
              ? apiProd.features.map((f: any) =>
                  typeof f === 'string'
                    ? { title: f, desc: `Enterprise automated ${f.toLowerCase()} capability.`, icon: 'Zap' }
                    : f
                )
              : localBase.featuresList,
          }));
        }
      } catch (_err) {
        // Retain localBase
      }
    };

    fetchBackendProduct();
  }, [activeId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden transition-colors duration-300">
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b05_1px,transparent_1px),linear-gradient(to_bottom,#1e293b05_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        
        {/* ── BREADCRUMBS & BACK BUTTON ── */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigateTo('/marketplace');
              }
            }}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace Catalog</span>
          </button>

          <div className="flex items-center gap-2 text-slate-400">
            <span onClick={() => navigateTo('/marketplace')} className="hover:underline cursor-pointer">Marketplace</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">{product.categoryLabel}</span>
            <span>/</span>
            <span className="text-blue-600 dark:text-cyan-400 font-black">{product.title}</span>
          </div>
        </div>

        {/* ── SECTION 1: HERO SECTION ── */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-black text-xs uppercase tracking-wider">
                  {product.badge}
                </span>

                {product.aiPowered && (
                  <span className="px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 border border-cyan-400/50 text-cyan-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>AI Powered OS</span>
                  </span>
                )}

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  <span>{product.price || 'From ₹49/mo'}</span>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-medium">({product.reviewsCount} verified reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">
                {product.title}
              </h1>
              
              <p className="text-lg font-bold text-blue-600 dark:text-cyan-300 mb-4">
                {product.subtitle}
              </p>

              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6">
                {product.shortDesc}
              </p>

              {/* Quick Highlight Pills */}
              <div className="flex flex-wrap gap-3">
                {['1-Click Deploy', '99.99% Uptime SLA', 'SOC2 Certified', '14-Day Free Trial'].map((pill) => (
                  <span key={pill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-300 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{pill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT (2-COLUMN GRID WITH STICKY RIGHT SIDEBAR) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── LEFT MAIN SECTION COLUMN (8 COLS) ── */}
          <div className="lg:col-span-8 space-y-14">

            {/* ── SECTION 2 & 3: GALLERY & VIDEO TOUR ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              
              {/* Main Screenshot Stage */}
              <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden mb-4 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/10 to-transparent pointer-events-none" />
                
                {/* Simulated High-Res Dashboard Screenshot */}
                <div className="w-full h-full p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-xs font-mono text-slate-400">https://app.dezoryn.com/{product.id}/preview</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsVideoModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 hover:scale-105 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Watch Product Tour</span>
                    </button>
                  </div>

                  <div className="my-auto text-center p-6 bg-slate-900/90 rounded-2xl border border-slate-800/90 max-w-xl mx-auto backdrop-blur-md shadow-2xl">
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-cyan-300 font-extrabold text-[10px] uppercase border border-cyan-400/30">
                      {product.galleryScreenshots[activeScreenshotIdx]?.tag}
                    </span>
                    <h3 className="text-xl font-black text-white mt-2 mb-1">
                      {product.galleryScreenshots[activeScreenshotIdx]?.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {product.galleryScreenshots[activeScreenshotIdx]?.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Live Production Cluster</span>
                    <span>HD 4K Interface Preview</span>
                  </div>
                </div>
              </div>

              {/* Gallery Thumbnails Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.galleryScreenshots.map((shot, idx) => {
                  const isActive = idx === activeScreenshotIdx;
                  return (
                    <button
                      key={shot.id}
                      type="button"
                      onClick={() => setActiveScreenshotIdx(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 dark:bg-cyan-500/10 border-blue-600 dark:border-cyan-400 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                        {shot.tag}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                        {shot.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── SECTION 4: OVERVIEW & IMPACT METRICS ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                <span>Executive Overview</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8">
                {product.overviewText}
              </p>

              {/* Impact Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.impactMetrics.map((metric, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left">
                    <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-cyan-300 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mb-1">
                      {metric.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-normal">
                      {metric.desc}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 5: FEATURES GRID ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-cyan-400" />
                <span>Core Capabilities & Features</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.featuresList.map((feat, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition text-left flex items-start gap-5 group">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-300 shrink-0 shadow-md transition-transform group-hover:scale-110">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>


            {/* ── SECTION 6: PRICING TIERS & PLANS ── */}
            <section id="pricing" className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative scroll-mt-24">
              <div className="text-left mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-extrabold text-xs uppercase tracking-wider mb-2">
                  <BadgeDollarSign className="w-4 h-4" />
                  <span>Flexible Subscription Plans</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Transparent Pricing for Every Scale
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose the ideal plan for your institution. All tiers include a 14-day risk-free trial with zero setup fees.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(product.pricingTiers && product.pricingTiers.length > 0
                  ? product.pricingTiers
                  : [
                      {
                        name: 'Starter Tier',
                        price: product.price || '₹49',
                        period: '/month',
                        features: ['Full Core Suite Access', 'Standard Cloud Hosting', '99.9% Uptime SLA', 'Email Support'],
                        ctaText: 'Start Free Trial'
                      },
                      {
                        name: 'Professional Tier',
                        price: '₹149',
                        period: '/month',
                        popular: true,
                        features: ['Unlimited Workflows & Users', 'Dedicated API Rate Limits', '24/7 Priority Support', 'Custom SLA'],
                        ctaText: 'Start Free Trial'
                      },
                      {
                        name: 'Enterprise Network',
                        price: 'Custom',
                        period: '',
                        features: ['Dedicated Private Cloud Cluster', 'Single Sign-On (SSO / SAML 2.0)', 'Custom Integrations & SLA', 'Dedicated Success Manager'],
                        ctaText: 'Contact Enterprise Team'
                      }
                    ]
                ).map((tier, idx) => {
                  const isPopular = tier.popular;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                        isPopular
                          ? 'bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-slate-900/50 dark:to-slate-900/90 border-2 border-blue-500 dark:border-cyan-400 shadow-xl shadow-cyan-500/10 scale-102'
                          : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                          Most Popular
                        </span>
                      )}

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                          {tier.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-cyan-400">
                            {tier.price}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {tier.period}
                          </span>
                        </div>

                        <div className="space-y-2.5 mb-6 text-xs text-slate-600 dark:text-slate-300">
                          {tier.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="font-semibold">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}&plan=${encodeURIComponent(tier.name)}`)}
                        className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                          isPopular
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700'
                        }`}
                      >
                        <span>{tier.ctaText || 'Get Started'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── SECTION 7: TECHNICAL SPECIFICATIONS ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Cpu className="w-6 h-6 text-purple-400" />
                <span>Technical Specifications & Compliance</span>
              </h2>

              <div className="space-y-6">
                {product.technicalSpecs.map((cat, idx) => (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800/80 px-5 py-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {cat.category}
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {cat.specs.map((spec, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-2 p-4 text-xs">
                          <span className="font-bold text-slate-500 dark:text-slate-400">{spec.name}</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 9: PRODUCT FAQS ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-3">
                {product.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-left">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-sm font-extrabold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── SECTION 10: CUSTOMER REVIEWS ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                    Verified Customer Reviews
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Based on verified enterprise buyer ratings
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-black text-amber-500">{product.rating}</span>
                  <span className="text-xs font-bold text-slate-400">/ 5.0 Rating</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.customerReviews.map((rev, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, rIdx) => (
                            <Star key={rIdx} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">{rev.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                        "{rev.review}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{rev.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{rev.role} • {rev.company}</div>
                      </div>
                      {rev.verified && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase border border-emerald-500/20">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 11: RELATED PRODUCTS ── */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                Related Software Products
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {product.relatedProducts.map((rel) => (
                  <div key={rel.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left flex flex-col justify-between hover:border-blue-500/50 transition">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">{rel.category}</span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 mb-2">{rel.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">{rel.shortDesc}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{rel.category}</span>
                      <button
                        type="button"
                        onClick={() => navigateTo('/marketplace')}
                        className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── SECTION 12: PRODUCT CONVERSION CTA BANNER ── */}
            <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-10 lg:p-12 text-white text-center shadow-2xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3">
                Ready to explore {product.title}?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
                Discover the platform, explore available subscription plans in the Marketplace, or schedule a live walkthrough with our technical architects.
              </p>
              <div className="flex flex-wrap items-center gap-4 justify-center">
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="px-7 py-4 rounded-full bg-white text-blue-600 font-extrabold text-xs shadow-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2 border-none"
                >
                  <span>View Pricing & Plans</span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}`)}
                  className="px-7 py-4 rounded-full bg-blue-900/60 hover:bg-blue-900 text-white font-extrabold text-xs border border-blue-400/40 transition cursor-pointer flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-cyan-300" />
                  <span>Schedule a Demo</span>
                </button>
              </div>
            </section>

          </div>

          {/* ── RIGHT STICKY SIDEBAR (4 COLS) ── */}
          <div className="lg:col-span-4 sticky top-24 z-20 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xl backdrop-blur-xl text-left space-y-6">
              
              {/* Sidebar Header */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-400/30 text-blue-600 dark:text-cyan-400 font-extrabold text-[10px] uppercase tracking-wider">
                  {product.categoryLabel}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2 mb-1">
                  {product.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  Discover platform capabilities, explore plans in the Marketplace, or schedule a guided architecture walkthrough.
                </p>
              </div>

              {/* Sidebar Pricing Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-slate-700/80 text-left">
                <div className="text-[10px] font-black text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                  Starting Subscription
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {product.price || 'From ₹49/mo'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  14-day free trial • Cancel anytime • Zero setup fee
                </p>
              </div>

              {/* Action Buttons Stack */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={scrollToPricing}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  <span>View Pricing & Plans</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(`/book-demo?product=${encodeURIComponent(product.id)}`)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 border-none"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule a Demo</span>
                </button>
              </div>

              {/* Quick Spec List */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant Sandbox Access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>14-Day Risk-Free Trial</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>SOC 2 Type II Certified</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* ── DEMO VIDEO MODAL ── */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl z-10 text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="font-extrabold text-white text-base flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  <span>{product.title} Guided Interactive Tour</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm px-2 py-1 rounded-lg bg-slate-800 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <VideoPlayerContainer
                videoUrl={product.videoTour?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                posterUrl={product.videoTour?.thumbnail}
                title={product.title}
                duration={product.videoTour?.duration}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
