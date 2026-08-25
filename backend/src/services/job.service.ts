import { prisma } from '../config/prisma.config';

const DEFAULT_JOBS = [
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
      'Collaborate with AI Researchers to deploy fine-tuned domain models.'
    ],
    requirements: [
      'Strong proficiency in TypeScript, React, Node.js, and Python.',
      'Hands-on experience with OpenAI APIs, LangChain, or vector databases.',
      'Proven track record of shipping production SaaS web applications.',
      'Deep understanding of microservices architecture, Docker, and PostgreSQL.'
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
      'Maintain and evolve the unified Dezo Design System.'
    ],
    requirements: [
      'Expertise in Figma, Framer, and modern prototyping tools.',
      'A stunning portfolio demonstrating complex SaaS/B2B data dashboard design.',
      'Understanding of modern CSS, Tailwind design tokens, and web animation principles.',
      'Exceptional communication and user-empathy skills.'
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
      'Partner with Solutions Engineers to scope custom enterprise deployments.'
    ],
    requirements: [
      '3+ years of track record closing B2B SaaS software contracts ($50k+ ARR).',
      'Proven ability to build relationships with VP, CRO, and C-level executive buyers.',
      'Self-starter mindset with exceptional presentation skills.'
    ],
    status: 'active',
    closingDate: new Date('2026-12-01T23:59:59.000Z'),
    order: 2,
    isEnabled: true,
  },
];

export class JobService {
  /**
   * GET ALL JOBS
   * PostgreSQL is the only source of truth.
   */
  static async getAll(filter?: { department?: string; status?: string; isEnabled?: boolean; search?: string }) {
    try {
      let jobs = await prisma.job.findMany({
        orderBy: { order: 'asc' },
      });

      if (!jobs || jobs.length === 0) {
        await prisma.job.createMany({
          data: DEFAULT_JOBS as any,
        });
        jobs = await prisma.job.findMany({
          orderBy: { order: 'asc' },
        });
      }

      let filtered = [...jobs];
      if (filter?.department && filter.department !== 'All') {
        filtered = filtered.filter(j => j.department.toLowerCase() === filter.department!.toLowerCase());
      }
      if (filter?.status && filter.status !== 'All') {
        filtered = filtered.filter(j => j.status === filter.status);
      }
      if (filter?.isEnabled !== undefined) {
        filtered = filtered.filter(j => j.isEnabled === filter.isEnabled);
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        filtered = filtered.filter(
          j =>
            j.title.toLowerCase().includes(q) ||
            j.department.toLowerCase().includes(q) ||
            j.location.toLowerCase().includes(q) ||
            j.description.toLowerCase().includes(q)
        );
      }

      return filtered;
    } catch (error) {
      console.error('GET JOBS ERROR:', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const job = await prisma.job.findUnique({ where: { id } });
      return job;
    } catch (error) {
      console.error(`GET JOB ${id} ERROR:`, error);
      throw error;
    }
  }

  static async create(data: {
    title: string;
    department: string;
    location: string;
    salary?: string;
    experience?: string;
    employmentType?: string;
    description: string;
    requirements?: string[] | string;
    responsibilities?: string[] | string;
    status?: string;
    closingDate?: string | Date | null;
    order?: number;
    isEnabled?: boolean;
  }) {
    try {
      const parseList = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
        return [];
      };

      const reqs = parseList(data.requirements);
      const resps = parseList(data.responsibilities);
      const closingDateVal = data.closingDate ? new Date(data.closingDate) : null;
      const count = await prisma.job.count();

      const created = await prisma.job.create({
        data: {
          title: data.title,
          department: data.department || 'General',
          location: data.location || 'Remote',
          salary: data.salary || 'Competitive',
          experience: data.experience || 'Mid-Senior',
          employmentType: data.employmentType || 'Full-Time',
          description: data.description,
          requirements: reqs,
          responsibilities: resps,
          status: data.status || 'active',
          closingDate: closingDateVal,
          order: data.order ?? count,
          isEnabled: data.isEnabled ?? (data.status !== 'closed'),
        },
      });

      return created;
    } catch (error) {
      console.error('CREATE JOB ERROR:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    title: string;
    department: string;
    location: string;
    salary: string;
    experience: string;
    employmentType: string;
    description: string;
    requirements: string[] | string;
    responsibilities: string[] | string;
    status: string;
    closingDate: string | Date | null;
    order: number;
    isEnabled: boolean;
  }>) {
    try {
      const parseList = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
        return [];
      };

      const updateData: any = { ...data };
      if (data.requirements !== undefined) updateData.requirements = parseList(data.requirements);
      if (data.responsibilities !== undefined) updateData.responsibilities = parseList(data.responsibilities);
      if (data.closingDate !== undefined) updateData.closingDate = data.closingDate ? new Date(data.closingDate) : null;
      if (data.status !== undefined && data.isEnabled === undefined) updateData.isEnabled = data.status === 'active';

      const updated = await prisma.job.update({ where: { id }, data: updateData });
      return updated;
    } catch (error) {
      console.error(`UPDATE JOB ${id} ERROR:`, error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.job.delete({ where: { id } });
      return { id, success: true };
    } catch (error) {
      console.error(`DELETE JOB ${id} ERROR:`, error);
      throw error;
    }
  }

  static async toggleStatus(id: string) {
    try {
      const existing = await prisma.job.findUnique({ where: { id } });
      if (!existing) throw new Error('Job not found');

      const newStatus = existing.status === 'active' ? 'closed' : 'active';
      return this.update(id, { status: newStatus, isEnabled: newStatus === 'active' });
    } catch (error) {
      console.error(`TOGGLE JOB STATUS ${id} ERROR:`, error);
      throw error;
    }
  }

  static async duplicate(id: string) {
    try {
      const existing = await prisma.job.findUnique({ where: { id } });
      if (!existing) throw new Error('Job not found');

      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = existing;
      return this.create({
        ...rest,
        title: `${rest.title} (Copy)`,
        requirements: rest.requirements as any,
        responsibilities: rest.responsibilities as any,
      });
    } catch (error) {
      console.error(`DUPLICATE JOB ${id} ERROR:`, error);
      throw error;
    }
  }

  static async reorder(orderedIds: string[]) {
    try {
      await Promise.all(
        orderedIds.map((id, index) => prisma.job.update({ where: { id }, data: { order: index } }))
      );
      return await prisma.job.findMany({ orderBy: { order: 'asc' } });
    } catch (error) {
      console.error('REORDER JOBS ERROR:', error);
      throw error;
    }
  }
}
