import { InvoiceModel, IInvoice } from '../model/invoice.model';
import mongoose from 'mongoose';

export class InvoiceRepository {
  async create(data: {
    invoiceNumber: string;
    invoiceDate: Date;
    amount: number;
    createdBy: string;
    financialYear: string;
  }): Promise<IInvoice> {
    const invoice = new InvoiceModel(data);
    return await invoice.save();
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<IInvoice | null> {
    return await InvoiceModel.findOne({ invoiceNumber });
  }

  async findByCreator(createdBy: string): Promise<IInvoice[]> {
    return await InvoiceModel.find({ createdBy })
      .sort({ createdAt: -1 });
  }

  async findPreviousInvoice(year: string, number: number): Promise<IInvoice | null> {
    return await InvoiceModel
      .findOne({
        financialYear: year,
        invoiceNumber: { $regex: `^${year}-${number-1}$` }
      })
      .sort({ invoiceNumber: -1 });
  }

  async findNextInvoice(year: string, number: number): Promise<IInvoice | null> {
    return await InvoiceModel
      .findOne({
        financialYear: year,
        invoiceNumber: { $regex: `^${year}-${number+1}$` }
      })
      .sort({ invoiceNumber: 1 });
  }

  async getNextInvoiceNumber(year: string): Promise<string> {
    const lastInvoice = await InvoiceModel
      .findOne({ financialYear: year })
      .sort({ invoiceNumber: -1 });

    if (!lastInvoice) {
      return `${year}-1`;
    }

    const currentNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
    return `${year}-${currentNumber + 1}`;
  }

  async findById(id: string): Promise<IInvoice | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await InvoiceModel.findById(id);
  }

  async update(id: string, data: Partial<IInvoice>): Promise<IInvoice | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await InvoiceModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await InvoiceModel.findByIdAndDelete(id);
    return result !== null;
  }

  async getAllInvoices() {
    try {
      const invoices = await InvoiceModel.find()
        .populate({
          path: 'createdBy',
          select: 'username role'
        })
        .sort({ createdAt: -1 });
      return invoices;
    } catch (error) {
      throw error;
    }
  }
}