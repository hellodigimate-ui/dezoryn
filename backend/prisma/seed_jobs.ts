/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SEED_JOBS = [
  {
    id: 'job-seed-1',
    title: 'Senior Full-Stack AI Engineer',
    department: 'Engineering & AI',
    location: 'Remote (US/EU/APAC)',
    salary: '$130,000 - $170,000 / yr',
    experience: '4+ Years',
    employmentType: 'Full-Time',
    description: 'Lead the architectural design and implementation of DezoAI copilot workflows, multi-agent frameworks, and real-time CRM predictive engines.',
    responsibilities: [
      'Architect scalable agentic workflows integrating LLMs with enterprise CRM data stores.',
      'Develop reactive front-end dashboards in React, TypeScript, and Tailwind CSS.',
      'Optimize API response latencies and vector embedding retrievals for sub-50ms query times.',
      'Collaborate with AI Researchers to deploy fine-tuned domain models.',
    ],
    requirements: [
      'Strong proficiency in TypeScript, React, Node.js, and Python.',
      'Hands-on experience with OpenAI APIs, LangChain, or vector databases.',
      'Proven track record of shipping production SaaS web applications.',
      'Deep understanding of microservices architecture, Docker, and PostgreSQL.',
    ],
    status: 'active',
    closingDate: new Date('2026-10-31T23:59:59.000Z'),
    order: 0,
    isEnabled: true,
  },
  {
    id: 'job-seed-2',
    title: 'Lead Product Designer (UI/UX)',
    department: 'Product & Design',
    location: 'Hybrid (San Francisco, CA)',
    salary: '$115,000 - $150,000 / yr',
    experience: '5+ Years',
    employmentType: 'Full-Time',
    description: 'Craft beautiful, high-converting enterprise interfaces, interactive visualizations, and intuitive design systems for Dezoryn Technologies.',
    responsibilities: [
      'Own the end-to-end design lifecycle from user research wireframes to pixel-perfect Figma components.',
      'Develop micro-animations and smooth transition guidelines for complex ERP dashboards.',
      'Conduct usability tests with sales teams and enterprise managers.',
      'Maintain and evolve the unified Dezo Design System.',
    ],
    requirements: [
      'Expertise in Figma, Framer, and modern prototyping tools.',
      'A stunning portfolio demonstrating complex SaaS/B2B data dashboard design.',
      'Understanding of modern CSS, Tailwind design tokens, and web animation principles.',
      'Exceptional communication and user-empathy skills.',
    ],
    status: 'active',
    closingDate: new Date('2026-11-15T23:59:59.000Z'),
    order: 1,
    isEnabled: true,
  },
  {
    id: 'job-seed-3',
    title: 'Enterprise Sales Account Executive',
    department: 'Sales & Marketing',
    location: 'Remote (North America)',
    salary: '$120,000 - $160,000 + OTE',
    experience: '3+ Years',
    employmentType: 'Full-Time',
    description: 'Drive new enterprise revenue growth by closing mid-market and fortune 500 SaaS opportunities with Dezoryn AI suite.',
    responsibilities: [
      'Manage end-to-end sales cycles from lead qualification to contract execution.',
      'Conduct live platform demonstrations showcasing predictive lead scoring and workflow automation.',
      'Partner with Solutions Engineers to scope custom enterprise deployments.',
    ],
    requirements: [
      '3+ years of track record closing B2B SaaS software contracts ($50k+ ARR).',
      'Proven ability to build relationships with VP, CRO, and C-level executive buyers.',
      'Self-starter mindset with exceptional presentation skills.',
    ],
    status: 'active',
    closingDate: new Date('2026-12-01T23:59:59.000Z'),
    order: 2,
    isEnabled: true,
  },
];

async function seedJobs() {
  console.log('🌱 Seeding development career jobs...');
  for (const job of SEED_JOBS) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: job as any,
      create: job as any,
    });
  }
  console.log(`✅ Seeded ${SEED_JOBS.length} development job postings successfully.`);
}

seedJobs()
  .catch((e) => {
    console.error('❌ Error seeding jobs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
