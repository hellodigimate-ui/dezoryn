import { prisma } from '../config/prisma.config';

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

export class SupportService {
  /**
   * Helper to generate human readable Ticket ID like SUP-0001
   */
  private static async generateTicketId(): Promise<string> {
    try {
      const count = await prisma.supportTicket.count();
      const formattedNum = String(count + 1).padStart(4, '0');
      return `SUP-${formattedNum}`;
    } catch {
      return `SUP-${Date.now().toString().slice(-4)}`;
    }
  }

  /**
   * Submit a new support ticket
   * PostgreSQL is the only source of truth.
   */
  static async createTicket(payload: SupportTicketPayload) {
    try {
      const ticketId = await SupportService.generateTicketId();

      const ticket = await prisma.supportTicket.create({
        data: {
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
        },
      });

      return ticket;
    } catch (error) {
      console.error('CREATE SUPPORT TICKET ERROR:', error);
      throw error;
    }
  }

  /**
   * Get all support tickets with search and filtering
   */
  static async getAllTickets(filter?: SupportTicketFilter) {
    try {
      const sortOrder = filter?.sortBy === 'oldest' ? 'asc' : 'desc';
      let tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: sortOrder },
      });

      let result = [...tickets];

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
    } catch (error) {
      console.error('GET ALL TICKETS ERROR:', error);
      throw error;
    }
  }

  /**
   * Get single ticket details
   */
  static async getTicketById(id: string) {
    try {
      const found = await prisma.supportTicket.findFirst({
        where: { OR: [{ id }, { ticketId: id }] },
      });

      return found;
    } catch (error) {
      console.error(`GET TICKET ${id} ERROR:`, error);
      throw error;
    }
  }

  /**
   * Update support ticket
   */
  static async updateTicket(id: string, payload: SupportTicketUpdatePayload) {
    try {
      const updateData: any = {};
      if (payload.status !== undefined) updateData.status = payload.status;
      if (payload.priority !== undefined) updateData.priority = payload.priority;
      if (payload.assignedTo !== undefined) updateData.assignedTo = payload.assignedTo;
      if (payload.adminNotes !== undefined) updateData.adminNotes = payload.adminNotes;

      const updated = await prisma.supportTicket.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error) {
      console.error(`UPDATE TICKET ${id} ERROR:`, error);
      throw error;
    }
  }

  /**
   * Delete support ticket
   */
  static async deleteTicket(id: string) {
    try {
      await prisma.supportTicket.delete({
        where: { id },
      });

      return { success: true, deletedId: id };
    } catch (error) {
      console.error(`DELETE TICKET ${id} ERROR:`, error);
      throw error;
    }
  }
}

export const createTicket = SupportService.createTicket.bind(SupportService);
export const getAllTickets = SupportService.getAllTickets.bind(SupportService);
export const getTicketById = SupportService.getTicketById.bind(SupportService);
export const updateTicket = SupportService.updateTicket.bind(SupportService);
export const deleteTicket = SupportService.deleteTicket.bind(SupportService);
