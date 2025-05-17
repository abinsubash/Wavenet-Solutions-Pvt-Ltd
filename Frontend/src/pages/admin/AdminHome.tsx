import React, { useEffect, useState, useCallback } from "react";
import SignupAdmin from "@/components/modal/SignupAdmin";
import Invoice from "@/components/modal/Invoice";
import GroupModal from "@/components/modal/GroupModal";
import type { Invoice as InvoiceType } from "../../api/invoice";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../store/auth.slice";
import toast from "react-hot-toast";
import { Users, FileText, Group, LogOut, Plus, Eye } from "lucide-react";
import { getAdminCreatedUsers, deleteUser, blockUser, getGroupedAdmins, removeFromGroup, getGroupedUsers } from "../../api/user";
import { getInvoices, deleteInvoice, blockInvoice } from '../../api/invoice';
import type { User } from "../../api/user";
import type { Admin } from '../../types/user.types';

interface AdminDocument {
  _doc: {
    _id: string;
    username: string;
    email: string;
    role: string;
    isBlocked: boolean;
    groupedWith?: string[];
  }
}

const AdminHome = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToBlock, setUserToBlock] = useState<{ id: string; isBlocked: boolean } | null>(null);
  const [activeSection, setActiveSection] = useState<'unitManagers' | 'invoices' | 'groups'>('unitManagers');
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
  const [groupedAdmins, setGroupedAdmins] = useState<Admin[]>([]);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleEditInvoice = (invoice: InvoiceType) => {
  setEditingInvoice(invoice);
  setShowInvoiceModal(true);
};
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAdminCreatedUsers();
      // Set users directly from response data without filtering
      if (response.success && response.data) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch unit managers");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navigateToInvoice = () => {
    setShowInvoiceModal(true);
  };

  const handleView = (id: string) => {
    try {
      navigate(`/admin/manage-users/${id}`);
    } catch (error) {
      toast.error('Navigation failed');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await blockUser(userId);
      if (response.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBlocked: !isBlocked } : user
          )
        );
        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBlocked: !isBlocked } : user
          )
        );
        toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      toast.error(`Failed to ${isBlocked ? 'unblock' : 'block'} user`);
    }
  };

  const getPaginatedData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPaginatedInvoices = () => {
    const indexOfLastItem = invoiceCurrentPage * invoiceItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - invoiceItemsPerPage;
    return filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handleInvoicePageChange = (pageNumber: number) => {
    setInvoiceCurrentPage(pageNumber);
  };

  // Add these with your other handlers
  const handleViewInvoice = (id: string) => {
    // Add view logic here
    console.log("View invoice:", id);
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

  // Update useEffect to fetch invoices when section changes
  useEffect(() => {
    if (activeSection === 'invoices') {
      fetchInvoices();
    }
  }, [activeSection]);

  // Add another useEffect to refresh invoices after creation
  useEffect(() => {
    if (!showInvoiceModal && activeSection === 'invoices') {
      fetchInvoices();
    }
  }, [showInvoiceModal]);

  // Update useEffect to apply filters when dependencies change
  useEffect(() => {
    filterInvoices();
    setInvoiceCurrentPage(1); // Reset to first page when filters change
  }, [filterInvoices, invoices, selectedYear, searchTerm, dateRange]);

  // Add new fetch function for grouped admins
  const fetchGroupedAdmins = async () => {
    try {
      const response = await getGroupedAdmins();
      if (response.success) {
        const admins = response.data.map((admin: AdminDocument) => ({
          _id: admin._doc._id,
          username: admin._doc.username,
          email: admin._doc.email,
          role: admin._doc.role,
          isBlocked: admin._doc.isBlocked,
          groupedWith: admin._doc.groupedWith
        }));
        setGroupedAdmins(admins);
      }
    } catch (error) {
      toast.error('Failed to fetch grouped admins');
    }
  };

  // Update useEffect to fetch grouped admins when section changes
  useEffect(() => {
    if (activeSection === 'groups') {
      fetchGroupedAdmins();
    }
  }, [activeSection]);

  const handleRemoveFromGroup = async (adminId: string) => {
    try {
      const response = await removeFromGroup(adminId);
      if (response.success) {
        setGroupedAdmins(prev => prev.filter(admin => admin._id !== adminId));
        toast.success('Admin removed from group');
      }
    } catch (error) {
      toast.error('Failed to remove admin from group');
    }
  };

  // Add with other handlers
  const handleViewGroupMember = (userId: string) => {
    navigate(`/admin/grouped/${userId}`);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed w-64 h-screen bg-zinc-900 p-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-500">Admin Panel</h2>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection('unitManagers')}
            className={`flex items-center w-full space-x-2 p-2 rounded-lg text-left ${
              activeSection === 'unitManagers' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Users size={20} />
            <span>Unit Managers</span>
          </button>

          <button
            onClick={() => setActiveSection('invoices')}
            className={`flex items-center w-full space-x-2 p-2 rounded-lg text-left ${
              activeSection === 'invoices' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <FileText size={20} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveSection('groups')}
            className={`flex items-center w-full space-x-2 p-2 rounded-lg text-left ${
              activeSection === 'groups' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <Group size={20} />
            <span>Groups</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 bg-black p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeSection === 'unitManagers' ? 'Unit Managers' : 
               activeSection === 'invoices' ? 'Invoices' : 'Groups'}
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

        {/* Content based on active section */}
        {activeSection === 'unitManagers' && (
          <>
            <div className="mb-4">
              <Button
                onClick={() => setIsSignup(true)}
                className="bg-red-700 hover:bg-red-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Unit Manager
              </Button>
            </div>
            
            {/* Existing table and pagination code */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="min-w-[600px]">
                <table className="w-full text-white">
                  <thead className="border-b border-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Username</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Email</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          No unit managers found
                        </td>
                      </tr>
                    ) : (
                      getPaginatedData().map((user) => (
                        <tr key={user._id} className="border-b border-gray-700">
                          <td className="px-3 sm:px-6 py-2 sm:py-4">{user.username}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">{user.email}</td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                user.isBlocked
                                  ? 'bg-red-500/20 text-red-500'
                                  : 'bg-green-500/20 text-green-500'
                              }`}
                            >
                              {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                            <div className="flex justify-end gap-2 sm:gap-4">
                              <button 
                                onClick={() => handleView(user._id)}
                                className="text-blue-500 hover:text-blue-400 flex items-center"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(user._id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleBlock(user._id, user.isBlocked)}
                                className={`${
                                  user.isBlocked
                                    ? 'text-green-500 hover:text-green-400'
                                    : 'text-yellow-500 hover:text-yellow-400'
                                }`}
                              >
                                {user.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div className="mt-4 flex justify-between items-center text-white">
                  <div className="text-sm">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} entries
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.ceil(filteredUsers.length / itemsPerPage) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1 
                            ? 'bg-red-600' 
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                      className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'invoices' && (
          <>
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

            {/* Invoice Table */}
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
        )}

        {activeSection === 'groups' && (
          <>
            <div className="mb-4">
              <Button
                onClick={() => setShowGroupModal(true)}
                className="bg-red-700 hover:bg-red-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Group
              </Button>
            </div>

            <div className="bg-zinc-900 rounded-lg p-4">
              {groupedAdmins.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No admins in your group</p>
              ) : (
                <div className="space-y-4">
                  {groupedAdmins.map((admin) => (
                    <div
                      key={admin._id}
                      className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <h3 className="text-white font-medium">{admin.username}</h3>
                        <p className="text-sm text-gray-400">{admin.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => handleViewGroupMember(admin._id)}
                          variant="ghost"
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveFromGroup(admin._id)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Existing modals */}
        {isSignup && (
          <SignupAdmin
            onClose={() => setIsSignup(false)}
            onUserAdded={fetchUsers}
          />
        )}

        {showInvoiceModal && (
          <Invoice
            onClose={() => {
              setShowInvoiceModal(false);
            }}
            onInvoiceAdded={() => {
              toast.success('Invoice created successfully');
              fetchInvoices(); // Add this function to refresh invoices
            }}
          />
        )}

        {/* Add this with your other modals */}
        {editingInvoice && (
          <Invoice
            invoice={editingInvoice}
            onClose={() => {
              setEditingInvoice(null);
            }}
            onInvoiceAdded={() => {
              toast.success('Invoice updated successfully');
              fetchInvoices();
              setEditingInvoice(null);
            }}
          />
        )}

        {showGroupModal && (
          <GroupModal
            onClose={() => {
              setShowGroupModal(false);
            }}
            onAdminAdded={() => {
              fetchGroupedAdmins(); // Refresh the grouped admins list
              setShowGroupModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminHome;