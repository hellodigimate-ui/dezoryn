import { Request, Response } from 'express';
import { DemoService, validateBookingDate } from '../services/demo.service';

export class DemoController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';
      const demos = await DemoService.getAll(activeOnly);
      res.status(200).json({
        success: true,
        data: demos,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch product demos',
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const demo = await DemoService.getById(id);
      if (!demo) {
        res.status(404).json({ success: false, message: 'Product demo not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: demo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch product demo',
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const demo = await DemoService.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Product demo created successfully',
        data: demo,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product demo',
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await DemoService.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product demo updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product demo',
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await DemoService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Product demo deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete product demo',
      });
    }
  }

  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingDate, date, fullName, email } = req.body;
      const targetDate = bookingDate || date;

      if (!fullName || !email) {
        res.status(400).json({
          success: false,
          message: 'Full Name and Work Email are required fields.',
        });
        return;
      }

      const validation = validateBookingDate(targetDate);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.error || 'Please select a current or future date.',
        });
        return;
      }

      const idempotencyHeader = req.headers['x-idempotency-key'] || req.headers['idempotency-key'];
      const payload = {
        ...req.body,
        idempotencyKey: req.body.idempotencyKey || (Array.isArray(idempotencyHeader) ? idempotencyHeader[0] : idempotencyHeader)
      };

      const booking = await DemoService.createBooking(payload);

      if (!booking || !booking.id) {
        res.status(500).json({
          success: false,
          message: 'Database persistence failed. Unable to create booking record.',
        });
        return;
      }

      if (booking.calendarInviteStatus === 'FAILED') {
        res.status(502).json({
          success: false,
          message: 'Booking saved, but calendar invitation generation failed.',
          data: booking,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Demo booked successfully',
        data: booking,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to book demo',
      });
    }
  }

  static async getBookings(_req: Request, res: Response): Promise<void> {
    try {
      const bookings = await DemoService.getBookings();
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch bookings',
      });
    }
  }
}

