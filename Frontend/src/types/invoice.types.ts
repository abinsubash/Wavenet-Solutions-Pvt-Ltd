export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  createdBy: string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}