import { prisma } from '../config/prisma.config';

const db = prisma as any;

function generateId(): string {
  return 'job_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

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

async function seedDefaultJobsRaw() {
  for (const item of DEFAULT_JOBS) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO jobs (id, title, department, location, salary, experience, "employmentType", description, requirements, responsibilities, status, "closingDate", "order", "isEnabled", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        item.id, item.title, item.department, item.location, item.salary, item.experience, item.employmentType,
        item.description, JSON.stringify(item.requirements), JSON.stringify(item.responsibilities),
        item.status, item.closingDate, item.order, item.isEnabled
      );
    } catch {
      // ignore
    }
  }
}

let hasAttemptedJobInitialSeed = false;

export class JobService {
  static async getAll(filter?: { department?: string; status?: string; isEnabled?: boolean; search?: string }) {
    if (!hasAttemptedJobInitialSeed) {
      hasAttemptedJobInitialSeed = true;
      try {
        const countRes: any = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM jobs');
        if (countRes[0]?.count === 0) {
          await seedDefaultJobsRaw();
        }
      } catch {
        // ignore initial seed error
      }
    }

    try {
      if (db.job) {
        const where: any = {};
        if (filter?.department && filter.department !== 'All') where.department = { equals: filter.department, mode: 'insensitive' };
        if (filter?.status && filter.status !== 'All') where.status = filter.status;
        if (filter?.isEnabled !== undefined) where.isEnabled = filter.isEnabled;
        if (filter?.search) {
          where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { department: { contains: filter.search, mode: 'insensitive' } },
            { location: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
        return await db.job.findMany({ where, orderBy: { order: 'asc' } });
      }
    } catch {
      // Fall through to raw SQL
    }

    try {
      let sql = 'SELECT * FROM jobs WHERE 1=1';

      const params: any[] = [];
      let idx = 1;

      if (filter?.department && filter.department !== 'All') {
        sql += ` AND LOWER(department) = LOWER($${idx++})`;
        params.push(filter.department);
      }
      if (filter?.status && filter.status !== 'All') {
        sql += ` AND status = $${idx++}`;
        params.push(filter.status);
      }
      if (filter?.isEnabled !== undefined) {
        sql += ` AND "isEnabled" = $${idx++}`;
        params.push(filter.isEnabled);
      }
      if (filter?.search) {
        sql += ` AND (LOWER(title) LIKE $${idx} OR LOWER(department) LIKE $${idx} OR LOWER(location) LIKE $${idx} OR LOWER(description) LIKE $${idx})`;
        params.push(`%${filter.search.toLowerCase()}%`);
        idx++;
      }

      sql += ' ORDER BY "order" ASC';
      const rows: any = await prisma.$queryRawUnsafe(sql, ...params);
      return rows;
    } catch (err) {
      console.error('Raw SQL error in JobService.getAll:', err);
      return DEFAULT_JOBS;
    }
  }

  static async getById(id: string) {
    try {
      if (db.job) return await db.job.findUnique({ where: { id } });
    } catch {}

    const rows: any = await prisma.$queryRawUnsafe('SELECT * FROM jobs WHERE id = $1', id);
    return rows[0] || null;
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
    const parseList = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
      return [];
    };

    const reqs = parseList(data.requirements);
    const resps = parseList(data.responsibilities);
    const closingDateVal = data.closingDate ? new Date(data.closingDate) : null;

    try {
      if (db.job) {
        const count = await db.job.count();
        return await db.job.create({
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
      }
    } catch {}

    const countRes: any = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM jobs');
    const orderIndex = data.order ?? (countRes[0]?.count || 0);
    const newId = generateId();

    await prisma.$executeRawUnsafe(
      `INSERT INTO jobs (id, title, department, location, salary, experience, "employmentType", description, requirements, responsibilities, status, "closingDate", "order", "isEnabled", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, NOW(), NOW())`,
      newId, data.title, data.department || 'General', data.location || 'Remote',
      data.salary || 'Competitive', data.experience || 'Mid-Senior', data.employmentType || 'Full-Time',
      data.description, JSON.stringify(reqs), JSON.stringify(resps),
      data.status || 'active', closingDateVal, orderIndex, data.isEnabled ?? (data.status !== 'closed')
    );

    return this.getById(newId);
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
    const parseList = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split('\n').map(s => s.trim()).filter(Boolean);
      return [];
    };

    try {
      if (db.job) {
        const updateData: any = { ...data };
        if (data.requirements !== undefined) updateData.requirements = parseList(data.requirements);
        if (data.responsibilities !== undefined) updateData.responsibilities = parseList(data.responsibilities);
        if (data.closingDate !== undefined) updateData.closingDate = data.closingDate ? new Date(data.closingDate) : null;
        if (data.status !== undefined && data.isEnabled === undefined) updateData.isEnabled = data.status === 'active';
        return await db.job.update({ where: { id }, data: updateData });
      }
    } catch {}

    const existing: any = await this.getById(id);
    if (!existing) throw new Error('Job not found');

    const title = data.title ?? existing.title;
    const department = data.department ?? existing.department;
    const location = data.location ?? existing.location;
    const salary = data.salary ?? existing.salary;
    const experience = data.experience ?? existing.experience;
    const employmentType = data.employmentType ?? existing.employmentType;
    const description = data.description ?? existing.description;
    const reqs = data.requirements !== undefined ? parseList(data.requirements) : existing.requirements;
    const resps = data.responsibilities !== undefined ? parseList(data.responsibilities) : existing.responsibilities;
    const status = data.status ?? existing.status;
    const closingDateVal = data.closingDate !== undefined ? (data.closingDate ? new Date(data.closingDate) : null) : existing.closingDate;
    const orderVal = data.order ?? existing.order;
    const isEnabledVal = data.isEnabled ?? (status === 'active');

    await prisma.$executeRawUnsafe(
      `UPDATE jobs SET title = $1, department = $2, location = $3, salary = $4, experience = $5, "employmentType" = $6, description = $7, requirements = $8::jsonb, responsibilities = $9::jsonb, status = $10, "closingDate" = $11, "order" = $12, "isEnabled" = $13, "updatedAt" = NOW() WHERE id = $14`,
      title, department, location, salary, experience, employmentType, description,
      JSON.stringify(reqs), JSON.stringify(resps), status, closingDateVal, orderVal, isEnabledVal, id
    );

    return this.getById(id);
  }

  static async delete(id: string) {
    try {
      if (db.job) return await db.job.delete({ where: { id } });
    } catch {}

    await prisma.$executeRawUnsafe('DELETE FROM jobs WHERE id = $1', id);
    return { id };
  }

  static async toggleStatus(id: string) {
    const existing: any = await this.getById(id);
    if (!existing) throw new Error('Job not found');

    const newStatus = existing.status === 'active' ? 'closed' : 'active';
    return this.update(id, { status: newStatus, isEnabled: newStatus === 'active' });
  }

  static async duplicate(id: string) {
    const existing: any = await this.getById(id);
    if (!existing) throw new Error('Job not found');

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = existing;
    return this.create({
      ...rest,
      title: `${rest.title} (Copy)`,
    });
  }

  static async reorder(orderedIds: string[]) {
    try {
      if (db.job) {
        await Promise.all(orderedIds.map((id, index) => db.job.update({ where: { id }, data: { order: index } })));
        return await db.job.findMany({ orderBy: { order: 'asc' } });
      }
    } catch {}

    for (let index = 0; index < orderedIds.length; index++) {
      await prisma.$executeRawUnsafe('UPDATE jobs SET "order" = $1 WHERE id = $2', index, orderedIds[index]);
    }
    return this.getAll();
  }
}
