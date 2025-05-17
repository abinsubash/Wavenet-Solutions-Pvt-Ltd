import { createAuthenticatedRequest } from './auth';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  createdBy: string;
  isBlocked?: boolean;
}

// Interface for edit data
export interface EditInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
}

export const createInvoice = async (data: {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
}) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post('/invoices', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create invoice');
  }
};

export const getInvoices = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/invoices'); 
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch invoices');
  }
};

export const getAllInvoices = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/invoices/all');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const editInvoice = async (invoiceId: string, data: EditInvoiceData) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.patch(`/invoices/${invoiceId}`, {
      ...data,
      amount: Number(data.amount) // Convert string to number
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to edit invoice');
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.delete(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to delete invoice');
  }
};

export const blockInvoice = async (invoiceId: string, isBlocked: boolean) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.patch(`/invoices/${invoiceId}/block`, { isBlocked });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to ${isBlocked ? 'block' : 'unblock'} invoice`);
  }
};