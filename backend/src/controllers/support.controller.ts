import { Request, Response, NextFunction } from 'express';
import { SupportService } from '../services/support.service';

export class SupportController {
  /**
   * Public Ticket Submission Endpoint
   * POST /api/v1/support
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, phone, company, product, category, priority, subject, message } = req.body;

      // Backend Input Validation
      if (!fullName || !fullName.trim() || fullName.trim().length < 2) {
        res.status(400).json({ success: false, message: 'Full Name is required (minimum 2 characters).' });
        return;
      }

      if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        res.status(400).json({ success: false, message: 'A valid Email Address is required.' });
        return;
      }

      if (!subject || !subject.trim() || subject.trim().length < 3) {
        res.status(400).json({ success: false, message: 'Subject is required (minimum 3 characters).' });
        return;
      }

      if (!message || !message.trim() || message.trim().length < 10) {
        res.status(400).json({ success: false, message: 'Message is required (minimum 10 characters).' });
        return;
      }

      const ticket = await SupportService.createTicket({
        fullName,
        email,
        phone,
        company,
        product,
        category,
        priority,
        subject,
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Support request submitted successfully.',
        ticketId: ticket.ticketId,
        data: ticket,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Protected Admin Endpoint: Get All Support Tickets
   * GET /api/v1/support
   */
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status, priority, category, product, sortBy } = req.query;

      const filter: any = {};
      if (search) filter.search = String(search);
      if (status) filter.status = String(status);
      if (priority) filter.priority = String(priority);
      if (category) filter.category = String(category);
      if (product) filter.product = String(product);
      if (sortBy) filter.sortBy = String(sortBy) as 'newest' | 'oldest';

      const tickets = await SupportService.getAllTickets(filter);

      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Protected Admin Endpoint: Get Ticket By ID
   * GET /api/v1/support/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await SupportService.getTicketById(req.params.id);
      if (!ticket) {
        res.status(404).json({ success: false, message: 'Support ticket not found.' });
        return;
      }
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Protected Admin Endpoint: Update Ticket Details / Status
   * PATCH /api/v1/support/:id
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, priority, assignedTo, adminNotes } = req.body;
      const updated = await SupportService.updateTicket(req.params.id, {
        status,
        priority,
        assignedTo,
        adminNotes,
      });

      if (!updated) {
        res.status(404).json({ success: false, message: 'Support ticket not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Support ticket updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Protected Admin Endpoint: Delete Support Ticket
   * DELETE /api/v1/support/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SupportService.deleteTicket(req.params.id);
      res.status(200).json({ success: true, message: 'Support ticket deleted.' });
    } catch (err) {
      next(err);
    }
  }
}
