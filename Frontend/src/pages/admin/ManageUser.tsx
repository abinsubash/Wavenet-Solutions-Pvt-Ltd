import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getUsers, deleteUser, blockUser } from '@/api/user';
import toast from 'react-hot-toast';
import { Trash2, Ban } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const ManageUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { id } = useParams();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers(id as string);
      console.log(response)
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(user => user._id !== userId));
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
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isBlocked: !isBlocked } : user
        ));
        toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Users</h2>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="bg-zinc-900 rounded-lg overflow-hidden">
              <table className="w-full text-white">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left">Username</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((user) => (
                    <tr key={user._id} className="border-t border-zinc-800">
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                        }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleBlock(user._id, user.isBlocked)}
                            variant="ghost"
                            className={user.isBlocked ? "text-green-500" : "text-yellow-500"}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(user._id)}
                            variant="ghost"
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  className={currentPage === page ? "bg-red-600" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUser;