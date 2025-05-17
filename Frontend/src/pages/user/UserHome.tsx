import React, { useEffect, useState, useCallback } from "react";
import Invoice from "@/components/modal/Invoice";
import type { Invoice as InvoiceType } from "../../api/invoice";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../store/auth.slice";
import toast from "react-hot-toast";
import { FileText, LogOut, Plus, Eye } from "lucide-react";
import { getInvoices, deleteInvoice, blockInvoice, getAllInvoices } from '../../api/invoice';

const UserHome = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceType[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [invoiceItemsPerPage] = useState(5);
  const [allInvoices, setAllInvoices] = useState<InvoiceType[]>([]);
  const [filteredAllInvoices, setFilteredAllInvoices] = useState<InvoiceType[]>([]);
  const [allInvoicesSearchTerm, setAllInvoicesSearchTerm] = useState('');
  const [allInvoicesDateRange, setAllInvoicesDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeSection, setActiveSection] = useState<'invoices' | 'allInvoices'>('invoices');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleEditInvoice = (invoice: InvoiceType) => {
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();
      if (response.success) {
        setInvoices(response.data);
        setFilteredInvoices(response.data); // Initialize filteredInvoices
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    }
  };

  const fetchAllInvoices = async () => {
    try {
      const response = await getAllInvoices();
      if (response.success) {
        setAllInvoices(response.data);
        setFilteredAllInvoices(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch all invoices');
    }
  };

  const filterInvoices = useCallback(() => {
    let result = [...invoices];

    // Filter by financial year
    if (selectedYear) {
      result = result.filter(invoice => invoice.invoiceNumber.startsWith(selectedYear));
    }

    // Filter by invoice number search
    if (searchTerm) {
      result = result.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
    }

    setFilteredInvoices(result);
  }, [invoices, selectedYear, searchTerm, dateRange]);

  const filterAllInvoices = useCallback(() => {
    let result = [...allInvoices];

    if (allInvoicesSearchTerm) {
      result = result.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(allInvoicesSearchTerm.toLowerCase()) ||
        invoice.createdBy?.username.toLowerCase().includes(allInvoicesSearchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      result = result.filter(invoice => invoice.createdBy?.role === selectedRole);
    }

    if (allInvoicesDateRange.startDate && allInvoicesDateRange.endDate) {
      const start = new Date(allInvoicesDateRange.startDate);
      const end = new Date(allInvoicesDateRange.endDate);
      result = result.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
    }

    setFilteredAllInvoices(result);
  }, [allInvoices, allInvoicesSearchTerm, allInvoicesDateRange, selectedRole]);

  // Update useEffect to fetch invoices when section changes
  useEffect(() => {
    if (activeSection === 'invoices') {
      fetchInvoices();
    } else if (activeSection === 'allInvoices') {
      fetchAllInvoices();
    }
  }, [activeSection]);

  // Add another useEffect to refresh invoices after creation
  useEffect(() => {
    if (!showInvoiceModal) {
      fetchInvoices();
    }
  }, [showInvoiceModal]);

  // Update useEffect to apply filters when dependencies change
  useEffect(() => {
    filterInvoices();
    setInvoiceCurrentPage(1); // Reset to first page when filters change
  }, [filterInvoices, invoices, selectedYear, searchTerm, dateRange]);

  // Add effect to trigger filtering
  useEffect(() => {
    filterAllInvoices();
  }, [filterAllInvoices]);

  const getPaginatedInvoices = () => {
    const indexOfLastItem = invoiceCurrentPage * invoiceItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - invoiceItemsPerPage;
    return filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handleInvoicePageChange = (pageNumber: number) => {
    setInvoiceCurrentPage(pageNumber);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await deleteInvoice(invoiceId);
      if (response.success) {
        setInvoices(prevInvoices => 
          prevInvoices.filter(invoice => invoice._id !== invoiceId)
        );
        toast.success('Invoice deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleBlockInvoice = async (invoiceId: string, currentBlockStatus: boolean) => {
    try {
      const response = await blockInvoice(invoiceId, !currentBlockStatus);
      if (response.success) {
        setInvoices(prevInvoices =>
          prevInvoices.map(invoice =>
            invoice._id === invoiceId 
              ? { ...invoice, isBlocked: !currentBlockStatus }
              : invoice
          )
        );
        toast.success(`Invoice ${currentBlockStatus ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      toast.error(`Failed to ${currentBlockStatus ? 'unblock' : 'block'} invoice`);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed w-64 h-screen bg-zinc-900 p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-500">User Panel</h2>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection('invoices')}
            className={`flex items-center w-full space-x-2 p-2 rounded-lg text-left ${
              activeSection === 'invoices' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            <span>My Invoices</span>
          </button>
          
          <button
            onClick={() => setActiveSection('allInvoices')}
            className={`flex items-center w-full space-x-2 p-2 rounded-lg text-left ${
              activeSection === 'allInvoices' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            <span>All Invoices</span>
          </button>
        </nav>
      </div>

      {/* Main Content Section */}
      <div className="ml-64 flex-1 bg-black p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeSection === 'invoices' ? 'My Invoices' : 'All Invoices'}
            </h1>
            <p className="text-gray-400">Welcome, {user?.username}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-700 text-red-700 hover:bg-red-700/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Conditional Content */}
        {activeSection === 'invoices' ? (
          <>
            {/* My Invoices Section */}
            <div className="mb-4 space-y-4">
              <Button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-red-700 hover:bg-red-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Financial Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                >
                  <option value="">All Years</option>
                  {Array.from(
                    new Set(invoices.map(invoice => invoice.invoiceNumber.split('-')[0]))
                  ).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* Invoice Number Search */}
                <input
                  type="text"
                  placeholder="Search invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />

                {/* Date Range Filters */}
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />
              </div>
            </div>

            {/* My Invoices Table */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="min-w-[600px]">
                <table className="w-full text-white">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Invoice #</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Invoice Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Amount</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      getPaginatedInvoices().map((invoice) => (
                        <tr key={invoice._id} className="border-b border-gray-700">
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            ${invoice.amount.toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                            <div className="flex justify-end gap-2 sm:gap-4">
                              <button 
                                onClick={() => handleEditInvoice(invoice)}
                                className="text-blue-500 hover:text-blue-400"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteInvoice(invoice._id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoice Pagination Controls */}
              {filteredInvoices.length > 0 && (
                <div className="mt-4 flex justify-between items-center text-white">
                  <div className="text-sm">
                    Showing {((invoiceCurrentPage - 1) * invoiceItemsPerPage) + 1} to{' '}
                    {Math.min(invoiceCurrentPage * invoiceItemsPerPage, filteredInvoices.length)} of{' '}
                    {filteredInvoices.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvoicePageChange(invoiceCurrentPage - 1)}
                      disabled={invoiceCurrentPage === 1}
                      className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredInvoices.length / invoiceItemsPerPage) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleInvoicePageChange(index + 1)}
                        className={`px-3 py-1 rounded ${
                          invoiceCurrentPage === index + 1 
                            ? 'bg-red-600' 
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handleInvoicePageChange(invoiceCurrentPage + 1)}
                      disabled={invoiceCurrentPage === Math.ceil(filteredInvoices.length / invoiceItemsPerPage)}
                      className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* All Invoices Section */}
            <div className="mb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search invoice number or username..."
                  value={allInvoicesSearchTerm}
                  onChange={(e) => setAllInvoicesSearchTerm(e.target.value)}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="unitManager">Unit Manager</option>
                  <option value="user">User</option>
                </select>

                <input
                  type="date"
                  value={allInvoicesDateRange.startDate}
                  onChange={(e) => setAllInvoicesDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />

                <input
                  type="date"
                  value={allInvoicesDateRange.endDate}
                  onChange={(e) => setAllInvoicesDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-zinc-800 text-white rounded-md px-3 py-2 border border-zinc-700"
                />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="min-w-[600px]">
                <table className="w-full text-white">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Invoice #</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Created By</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Role</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Invoice Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAllInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      filteredAllInvoices.map((invoice) => (
                        <tr key={invoice._id} className="border-b border-gray-700">
                          <td className="px-3 sm:px-6 py-2 sm:py-4">{invoice.invoiceNumber}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">{invoice.createdBy?.username}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">{invoice.createdBy?.role}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">${invoice.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        {showInvoiceModal && (
          <Invoice
            onClose={() => setShowInvoiceModal(false)}
            onInvoiceAdded={() => {
              toast.success('Invoice created successfully');
              fetchInvoices();
            }}
          />
        )}

        {editingInvoice && (
          <Invoice
            invoice={editingInvoice}
            onClose={() => setEditingInvoice(null)}
            onInvoiceAdded={() => {
              toast.success('Invoice updated successfully');
              fetchInvoices();
              setEditingInvoice(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserHome;