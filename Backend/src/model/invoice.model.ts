import mongoose, { Document } from 'mongoose';

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: Date;
  amount: number;
  createdBy: mongoose.Types.ObjectId;
  financialYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  financialYear: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);