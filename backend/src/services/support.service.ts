import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const db = prisma as any;

export interface SupportTicketPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  product?: string;
  category?: string;
  priority?: string;
  subject: string;
  message: string;
}

export interface SupportTicketUpdatePayload {
  status?: string;
  priority?: string;
  assignedTo?: string;
  adminNotes?: string;
}

export interface SupportTicketFilter {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  product?: string;
  sortBy?: 'newest' | 'oldest';
}

let memorySupportTickets: any[] = [];

async function ensureSupportTableRaw() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public."support_tickets" (
        id TEXT PRIMARY KEY,
        "ticketId" TEXT UNIQUE NOT NULL,
        "fullName" TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT DEFAULT '',
        company TEXT DEFAULT '',
        product TEXT DEFAULT '',
        category TEXT DEFAULT 'General Support',
        priority TEXT DEFAULT 'MEDIUM',
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'OPEN',
        "adminNotes" TEXT DEFAULT '',
        "assignedTo" TEXT DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  } catch (_err) {
    // ignore
  }
}

export class SupportService {
  /**
   * Helper to generate human readable Ticket ID like SUP-0001
   */
  private static async generateTicketId(): Promise<string> {
    await ensureSupportTableRaw();
    let count = 0;

    try {
      if (db.supportTicket) {
        count = await db.supportTicket.count();
      } else {
        const rows: any = await prisma.$queryRawUnsafe('SELECT COUNT(*) FROM public."support_tickets"');
        count = parseInt(rows[0]?.count || '0', 10);
      }
    } catch {
      count = memorySupportTickets.length;
    }

    const nextNumber = Math.max(count + 1, memorySupportTickets.length + 1);
    const formattedNum = String(nextNumber).padStart(4, '0');
    return `SUP-${formattedNum}`;
  }

  /**
   * Submit a new support ticket (Public Endpoint)
   */
  static async createTicket(payload: SupportTicketPayload) {
    await ensureSupportTableRaw();

    const ticketId = await SupportService.generateTicketId();
    const id = `sup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const now = new Date();

    const ticketData = {
      id,
      ticketId,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: (payload.phone || '').trim(),
      company: (payload.company || '').trim(),
      product: (payload.product || 'Dezoryn CRM').trim(),
      category: (payload.category || 'General Support').trim(),
      priority: (payload.priority || 'MEDIUM').toUpperCase().trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      status: 'OPEN',
      adminNotes: '',
      assignedTo: '',
      createdAt: now,
      updatedAt: now,
    };

    // Store in memory fallback array first
    memorySupportTickets.unshift(ticketData);

    // Try Prisma DB insertion
    try {
      if (db.supportTicket) {
        const created = await db.supportTicket.create({ data: ticketData });
        return created;
      }
    } catch (_e) {
      // Fall through to raw SQL
    }

    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO public."support_tickets" (id, "ticketId", "fullName", email, phone, company, product, category, priority, subject, message, status, "adminNotes", "assignedTo", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        ticketData.id,
        ticketData.ticketId,
        ticketData.fullName,
        ticketData.email,
        ticketData.phone,
        ticketData.company,
        ticketData.product,
        ticketData.category,
        ticketData.priority,
        ticketData.subject,
        ticketData.message,
        ticketData.status,
        ticketData.adminNotes,
        ticketData.assignedTo,
        ticketData.createdAt,
        ticketData.updatedAt
      );
    } catch (_rawErr) {
      // Memory fallback saved
    }

    return ticketData;
  }

  /**
   * Get all support tickets with search and filtering (Admin Endpoint)
   */
  static async getAllTickets(filter?: SupportTicketFilter) {
    await ensureSupportTableRaw();
    let tickets: any[] = [];

    try {
      if (db.supportTicket) {
        tickets = await db.supportTicket.findMany({ orderBy: { createdAt: 'desc' } });
      }
    } catch (_dbErr) {
      // Fallback
    }

    if (!tickets || tickets.length === 0) {
      try {
        const rows: any = await prisma.$queryRawUnsafe(
          'SELECT * FROM public."support_tickets" ORDER BY "createdAt" DESC'
        );
        if (rows && rows.length > 0) {
          tickets = rows;
        }
      } catch (_e) {
        // use memory
      }
    }

    // Merge memory tickets with DB results to eliminate duplicates
    const map = new Map<string, any>();
    tickets.forEach((t) => map.set(t.id, t));
    memorySupportTickets.forEach((t) => map.set(t.id, t));

    let result = Array.from(map.values());

    // Apply Sorting
    const sortOrder = filter?.sortBy || 'newest';
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    // Apply Search Filter
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.ticketId && String(t.ticketId).toLowerCase().includes(q)) ||
          (t.fullName && String(t.fullName).toLowerCase().includes(q)) ||
          (t.email && String(t.email).toLowerCase().includes(q)) ||
          (t.subject && String(t.subject).toLowerCase().includes(q)) ||
          (t.company && String(t.company).toLowerCase().includes(q)) ||
          (t.message && String(t.message).toLowerCase().includes(q))
      );
    }

    // Apply Status Filter
    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter((t) => (t.status || 'OPEN').toUpperCase() === filter.status!.toUpperCase());
    }

    // Apply Priority Filter
    if (filter?.priority && filter.priority !== 'ALL') {
      result = result.filter((t) => (t.priority || 'MEDIUM').toUpperCase() === filter.priority!.toUpperCase());
    }

    // Apply Category Filter
    if (filter?.category && filter.category !== 'ALL') {
      result = result.filter((t) => (t.category || '').toLowerCase() === filter.category!.toLowerCase());
    }

    // Apply Product Filter
    if (filter?.product && filter.product !== 'ALL') {
      result = result.filter((t) => (t.product || '').toLowerCase().includes(filter.product!.toLowerCase()));
    }

    return result;
  }

  /**
   * Get single ticket details
   */
  static async getTicketById(id: string) {
    await ensureSupportTableRaw();

    let found = memorySupportTickets.find((t) => t.id === id || t.ticketId === id);
    if (found) return found;

    try {
      if (db.supportTicket) {
        found = await db.supportTicket.findFirst({
          where: { OR: [{ id }, { ticketId: id }] },
        });
        if (found) return found;
      }
    } catch (_e) {}

    try {
      const rows: any = await prisma.$queryRawUnsafe(
        'SELECT * FROM public."support_tickets" WHERE id = $1 OR "ticketId" = $1 LIMIT 1',
        id
      );
      if (rows && rows[0]) return rows[0];
    } catch (_e) {}

    return null;
  }

  /**
   * Update support ticket status, priority, assignment, admin notes (Admin Endpoint)
   */
  static async updateTicket(id: string, payload: SupportTicketUpdatePayload) {
    await ensureSupportTableRaw();
    const now = new Date();

    // Update in memory
    const memIdx = memorySupportTickets.findIndex((t) => t.id === id || t.ticketId === id);
    if (memIdx !== -1) {
      if (payload.status !== undefined) memorySupportTickets[memIdx].status = payload.status;
      if (payload.priority !== undefined) memorySupportTickets[memIdx].priority = payload.priority;
      if (payload.assignedTo !== undefined) memorySupportTickets[memIdx].assignedTo = payload.assignedTo;
      if (payload.adminNotes !== undefined) memorySupportTickets[memIdx].adminNotes = payload.adminNotes;
      memorySupportTickets[memIdx].updatedAt = now;
    }

    try {
      if (db.supportTicket) {
        const updateData: any = {};
        if (payload.status !== undefined) updateData.status = payload.status;
        if (payload.priority !== undefined) updateData.priority = payload.priority;
        if (payload.assignedTo !== undefined) updateData.assignedTo = payload.assignedTo;
        if (payload.adminNotes !== undefined) updateData.adminNotes = payload.adminNotes;

        const updated = await db.supportTicket.update({
          where: { id },
          data: updateData,
        });
        return updated;
      }
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE public."support_tickets"
         SET status = COALESCE($1, status),
             priority = COALESCE($2, priority),
             "assignedTo" = COALESCE($3, "assignedTo"),
             "adminNotes" = COALESCE($4, "adminNotes"),
             "updatedAt" = NOW()
         WHERE id = $5 OR "ticketId" = $5`,
        payload.status,
        payload.priority,
        payload.assignedTo,
        payload.adminNotes,
        id
      );
    } catch (_e) {}

    return SupportService.getTicketById(id);
  }

  /**
   * Delete support ticket (Admin Endpoint)
   */
  static async deleteTicket(id: string) {
    memorySupportTickets = memorySupportTickets.filter((t) => t.id !== id && t.ticketId !== id);

    try {
      if (db.supportTicket) {
        await db.supportTicket.delete({ where: { id } });
      }
    } catch (_e) {}

    try {
      await prisma.$executeRawUnsafe(
        'DELETE FROM public."support_tickets" WHERE id = $1 OR "ticketId" = $1',
        id
      );
    } catch (_e) {}

    return { success: true, deletedId: id };
  }
}
