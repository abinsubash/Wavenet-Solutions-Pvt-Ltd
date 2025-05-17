import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getGroupedUsers } from '@/api/user';
import toast from 'react-hot-toast';

interface GroupedUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const GroupedUser = () => {
  const [users, setUsers] = useState<GroupedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchGroupedUsers();
  }, [id]);

  const fetchGroupedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getGroupedUsers(id as string);
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch grouped users');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h2 className="text-2xl font-bold text-white mb-6">Grouped Users</h2>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-center text-gray-400">No users found in this group</p>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <span className="text-xs text-gray-500">{user.role}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                  }`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedUser;