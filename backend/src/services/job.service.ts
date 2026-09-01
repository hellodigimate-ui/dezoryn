import { prisma } from '../config/prisma.config';

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
