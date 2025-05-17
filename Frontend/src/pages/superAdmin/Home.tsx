import React, { useEffect, useState, useCallback } from "react";
import SignupSuperAdmin from "@/components/modal/SignupSuperAdmin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logout } from "../../store/auth.slice";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { getAllUsers, blockUser, deleteUser, updateUserRole } from "../../api/user";
import type { User } from "../../api/user";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { createAuthenticatedRequest } from "@/api/auth";

const Home = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToBlock, setUserToBlock] = useState<{ id: string; isBlocked: boolean } | null>(null);
  const [userToEdit, setUserToEdit] = useState<{
    _id: string;
    username: string;
    role: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // You can adjust this number
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
        setFilteredUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // First, modify the filterUsers callback
  const filterUsers = useCallback(() => {
    // First filter by role
    let filtered = selectedRole === "all" 
      ? users 
      : users.filter(user => user.role === selectedRole);
    
    // Then slice for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Update filtered users with the full filtered array
    setFilteredUsers(filtered);
  }, [selectedRole, users]);

  // Add this new function to get paginated data
  const getPaginatedData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  useEffect(() => {
    filterUsers();
  }, [filterUsers, selectedRole, users, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/super-admin/login");
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    try {
      const response = await blockUser(userId);
      
      // Update the users list without fetching from server
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId 
            ? { ...user, isBlocked: !user.isBlocked }
            : user
        )
      );

      toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      
      // Update the users list without fetching from server
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = async (userId: string, newRole: string) => {
    try {
      const api = createAuthenticatedRequest();
      const response = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      
      if (response.data.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
        
        // Check for new tokens in response headers
        const newToken = response.headers['authorization'];
        const newRefreshToken = response.headers['x-refresh-token'];
        
        if (newToken) {
          localStorage.setItem('token', newToken.split(' ')[1]);
        }
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        toast.success('Role updated successfully');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update role');
    } finally {
      setUserToEdit(null);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Calculate pagination data
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full min-h-screen bg-black p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-400">Welcome, {user?.username}</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Button
            onClick={() => setIsSignup(true)}
            className="bg-red-700 hover:bg-red-800 rounded-lg px-4 sm:px-6 py-2 flex-1 sm:flex-none"
          >
            Create Admin
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-700 text-red-700 hover:bg-red-700/10 hover:text-white rounded-lg px-4 sm:px-6 py-2 flex-1 sm:flex-none"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6">
        <Select
          value={selectedRole}
          onValueChange={(value) => setSelectedRole(value)}
        >
          <SelectTrigger className="w-[180px] bg-zinc-900 text-white border-zinc-700">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 text-white border-zinc-700">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="unitManager">Unit Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <div className="bg-zinc-900 rounded-lg p-2 sm:p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          <table className="w-full text-white">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-sm sm:text-base">
                  #
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-sm sm:text-base">
                  Username
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-sm sm:text-base">
                  Role
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-sm sm:text-base">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-sm sm:text-base">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-sm sm:text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">No users found</td>
                </tr>
              ) : (
                getPaginatedData().map((user, index) => (
                  <tr key={user._id} className="border-b border-gray-700">
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base">
                      {user.username}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base">
                      {user.role}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base">
                      {user.email}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm sm:text-base">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isBlocked 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-green-500/20 text-green-500'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 text-right">
                      <div className="flex justify-end gap-2 sm:gap-4">
                        <button 
                          onClick={() => setUserToEdit({
                            _id: user._id,
                            username: user.username,
                            role: user.role
                          })}
                          className="text-blue-500 hover:text-blue-400 text-sm sm:text-base"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setUserToDelete(user._id)}
                          className="text-red-500 hover:text-red-400 text-sm sm:text-base"
                        >
                          Delete
                        </button>
                        <button 
                          onClick={() => setUserToBlock({ id: user._id, isBlocked: user.isBlocked })}
                          className={`${
                            user.isBlocked 
                              ? 'text-green-500 hover:text-green-400' 
                              : 'text-yellow-500 hover:text-yellow-400'
                          } text-sm sm:text-base`}
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
        <div className="mt-4 flex justify-between items-center text-white">
          <div className="text-sm">
            Showing {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} entries
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
      </div>

      {/* Modal */}
      {isSignup && (
        <SignupSuperAdmin 
          onClose={() => setIsSignup(false)} 
          onUserAdded={() => {
            fetchUsers();  
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  handleDeleteUser(userToDelete);
                  setUserToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={!!userToBlock} onOpenChange={() => setUserToBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {userToBlock?.isBlocked ? 'unblock' : 'block'} this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToBlock) {
                  handleBlockUser(userToBlock.id, userToBlock.isBlocked);
                  setUserToBlock(null);
                }
              }}
              className={userToBlock?.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              {userToBlock?.isBlocked ? 'Unblock' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <AlertDialog open={!!userToEdit} onOpenChange={() => setUserToEdit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Change role for user: {userToEdit?.username}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={userToEdit?.role}
              onValueChange={(value) => {
                if (userToEdit) {
                  handleEditUser(userToEdit._id, value);
                }
              }}
            >
              <SelectTrigger className="w-full bg-zinc-900 text-white border-zinc-700">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 text-white border-zinc-700">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="unitManager">Unit Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
