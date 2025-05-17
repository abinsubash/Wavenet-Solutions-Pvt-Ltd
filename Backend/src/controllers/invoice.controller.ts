import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/jwt.types';
import { InvoiceService } from '../services/invoice.service';
import createHttpError from 'http-errors';

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const invoice = await this.invoiceService.createInvoice({
        ...req.body,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const invoices = await this.invoiceService.getInvoices(userId);
      res.status(200).json({
        success: true,
        data: invoices
      });
    } catch (error) {
      next(error);
    }
  };

  updateInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.id;
      const invoiceId = req.params.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const invoice = await this.invoiceService.updateInvoice(invoiceId, {
        ...req.body,
        updatedBy: userId
      });

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  };

  deleteInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.id;
      const invoiceId = req.params.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await this.invoiceService.deleteInvoice(invoiceId, userId);
      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('pundachi mownneee')
      const invoices = await this.invoiceService.getAllInvoices();
      res.status(200).json({
        success: true,
        data: invoices
      });
    } catch (error) {
      next(error);
    }
  };
}