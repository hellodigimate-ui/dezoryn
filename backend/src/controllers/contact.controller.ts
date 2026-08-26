import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { sendLeadDetailsToCRM } from '../utils/webhook.util';

export class ContactController {
  static async get(req: Request, res: Response): Promise<void> {
    try {
      const data = await ContactService.get();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch contact settings',
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await ContactService.update(req.body);
      res.status(200).json({
        success: true,
        message: 'Contact information updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update contact information',
      });
    }
  }

  static async submitInquiry(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, workEmail, phone, company, industry, employees, budget, productInterest, message, requirements } = req.body;
      const payload = {
        fullName: fullName || 'Anonymous Visitor',
        email: email || workEmail || '',
        phone: phone || '',
        company: company || '',
        industry: industry || '',
        employees: employees || '',
        budget: budget || '',
        productInterest: productInterest || '',
        message: message || requirements || '',
      };

      if (!payload.email) {
        res.status(400).json({
          success: false,
          message: 'Email address is required for inquiry submission.',
        });
        return;
      }

      const data = await ContactService.submitInquiry(payload);

      await sendLeadDetailsToCRM({
        inquiry: {
          name: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          company: payload.company,
          message: payload.message || payload.productInterest || '',
        },
        software: 'WEBSITE',
      });

      res.status(200).json({
        success: true,
        message: 'Thank you! Your inquiry has been submitted successfully.',
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit contact inquiry',
      });
    }
  }

  static async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query.q as string | undefined;
      const status = req.query.status as string | undefined;
      const data = await ContactService.getSubmissions(q, status);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch contact submissions',
      });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await ContactService.updateSubmissionStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Inquiry status updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update submission status',
      });
    }
  }

  static async deleteSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ContactService.deleteSubmission(id);
      res.status(200).json({
        success: true,
        message: 'Inquiry deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete inquiry',
      });
    }
  }
}
