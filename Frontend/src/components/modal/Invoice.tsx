import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { createInvoice, editInvoice, type Invoice } from '@/api/invoice';
import { createAuthenticatedRequest } from '@/api/auth';

interface InvoiceProps {
  invoice?: Invoice | null;  // Change this to accept both undefined and null
  onClose: () => void;
  onInvoiceAdded: () => void;
}

interface FormData {
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
}

interface FormErrors {
  invoiceNumber?: string;
  invoiceDate?: string;
  amount?: number;
}

const Invoice: React.FC<InvoiceProps> = ({ invoice, onClose, onInvoiceAdded }) => {
  const [formData, setFormData] = useState<FormData>({
    invoiceNumber: '',  // Changed from nextInvoiceNumber to empty string
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'invoiceNumber':
        if (!value) return 'Invoice number is required';
        // Updated regex to properly validate YYYY-N format
        if (!/^\d{4}-\d+$/.test(value.trim())) {
          return 'Invoice number must be in format YYYY-number (e.g., 2025-1)';
        }
        const [year, number] = value.split('-');
        if (parseInt(number) < 1) {
          return 'Number after hyphen must be greater than 0';
        }
        break;
      case 'invoiceDate':
        if (!value) return 'Invoice date is required';
        const date = new Date(value);
        const today = new Date();
        if (date > today) {
          return 'Invoice date cannot be in the future';
        }
        // Year from invoice number should match date's year
        const yearFromNumber = value.split('-')[0];
        const yearFromDate = date.getFullYear().toString();
        if (yearFromNumber !== yearFromDate) {
          return 'Invoice year must match the date year';
        }
        break;
      case 'amount':
        if (!value) return 'Amount is required';
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          return 'Invalid amount format';
        }
        if (parseFloat(value) <= 0) {
          return 'Amount must be greater than 0';
        }
        break;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const message = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      const submissionData = {
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        amount: parseFloat(formData.amount)
      };

      const response = invoice
        ? await editInvoice(invoice._id, submissionData)
        : await createInvoice(submissionData);

      if (response.success) {
        toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        onInvoiceAdded();
        onClose();
      }
    } catch (error: any) {
      // Show the specific error message from the backend
      const errorMessage = error?.response?.data?.message || 
                          (error instanceof Error ? error.message : 'Failed to create invoice');
      toast.error(errorMessage);
      console.error('Error details:', error); // For debugging
    } finally {
      setIsLoading(false);
    }
  };

  const validateInvoiceNumber = (value: string) => {
    if (!value) return 'Invoice number is required';
    
    const [year, number] = value.split('-');
    if (!/^\d{4}-\d+$/.test(value) || !number || parseInt(number) < 1) {
      return 'Invoice number must be in format YYYY-number and number must be greater than 0';
    }
    
    return '';
  };

  const isFormValid = () => {
    // Check if all required fields are filled and valid
    if (!formData.invoiceNumber || !formData.invoiceDate || !formData.amount) {
      return false;
    }

    // Check if there are any validation errors
    return Object.values(errors).every(error => !error);
  };

  useEffect(() => {
    if (!invoice) {
      // Removed the fetchNextInvoiceNumber call
    } else {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        amount: invoice.amount.toString()
      });
    }
  }, [invoice]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {invoice ? 'Edit Invoice' : 'Create Invoice'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-300">
              Invoice Number
            </label>
            <input
              type="text"  // Changed from "number" to "text"
              id="invoiceNumber"
              name="invoiceNumber"
              placeholder="Enter invoice number (e.g., 2025-1)"
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.invoiceNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-300">
              Invoice Date
            </label>
            <input
              type="date"
              id="invoiceDate"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.invoiceDate && (
              <p className="mt-1 text-sm text-red-500">{errors.invoiceDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`bg-red-600 hover:bg-red-700 ${
                (!isFormValid() || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Loading...' : invoice ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Invoice;