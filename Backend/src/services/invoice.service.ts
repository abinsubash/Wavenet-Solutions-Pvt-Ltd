import { InvoiceRepository } from '../repositories/invoice.repository';
import { IInvoice } from '../model/invoice.model';
import createHttpError from 'http-errors';
import mongoose from 'mongoose';

export class InvoiceService {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async createInvoice(data: {
    invoiceNumber: string;
    invoiceDate: string;
    amount: number;
    createdBy: string;
  }): Promise<IInvoice> {
    // Trim the invoice number to handle whitespace
    const invoiceNumber = data.invoiceNumber.trim();
    
    if (!invoiceNumber) {
      throw createHttpError(400, 'Invoice number is required');
    }

    // Validate format YYYY-number
    const [year, numberPart] = invoiceNumber.split('-');
    
    if (!year || !numberPart) {
      throw createHttpError(400, 'Invoice number must be in format YYYY-number (e.g., 2025-1)');
    }

    // Validate year format
    if (!/^\d{4}$/.test(year)) {
      throw createHttpError(400, 'Year must be a 4-digit number');
    }

    // Validate number part
    const number = parseInt(numberPart);
    if (isNaN(number) || number < 1) {
      throw createHttpError(400, 'Invoice number must be greater than 0');
    }

    // Check if invoice number exists
    const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(invoiceNumber);
    if (existingInvoice) {
      throw createHttpError(400, 'Invoice number already exists');
    }

    return await this.invoiceRepository.create({
      ...data,
      invoiceNumber, // Use the trimmed value
      invoiceDate: new Date(data.invoiceDate),
      financialYear: year
    });
  }

  async getInvoices(userId: string): Promise<IInvoice[]> {
    return await this.invoiceRepository.findByCreator(userId);
  }

  async getAllInvoices() {
    try {
      const invoices = await this.invoiceRepository.getAllInvoices();
      return invoices;
    } catch (error) {
      throw error;
    }
  }

  async updateInvoice(invoiceId: string, data: {
    invoiceNumber?: string;
    invoiceDate?: string;
    amount?: number;
    updatedBy: string;
  }): Promise<IInvoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw createHttpError(404, 'Invoice not found');
    }

    if (invoice.createdBy.toString() !== data.updatedBy) {
      throw createHttpError(403, 'Not authorized to update this invoice');
    }

    if (data.invoiceNumber) {
      const existingInvoice = await this.invoiceRepository.findByInvoiceNumber(data.invoiceNumber);
      if (existingInvoice && existingInvoice._id.toString() !== invoiceId) {
        throw createHttpError(400, 'Invoice number already exists');
      }
    }

    const updatedInvoice = await this.invoiceRepository.update(invoiceId, {
      ...data,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : undefined
    });

    if (!updatedInvoice) {
      throw createHttpError(404, 'Failed to update invoice');
    }

    return updatedInvoice;
  }

  async deleteInvoice(invoiceId: string, userId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw createHttpError(404, 'Invoice not found');
    }

    if (invoice.createdBy.toString() !== userId) {
      throw createHttpError(403, 'Not authorized to delete this invoice');
    }

    const deleted = await this.invoiceRepository.delete(invoiceId);
    if (!deleted) {
      throw createHttpError(500, 'Failed to delete invoice');
    }
  }
}