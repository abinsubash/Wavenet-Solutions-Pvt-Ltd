import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { getGroupedUsers } from '@/api/user';
import toast from 'react-hot-toast';

interface GroupedAdmin {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const GroupedAdmin = () => {
  const [admins, setAdmins] = useState<GroupedAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchGroupedAdmins();
  }, [id]);

  const fetchGroupedAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await getGroupedUsers(id as string);
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch grouped admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUsers = (adminId: string) => {
    navigate(`/unit-manager/grouped/${adminId}`);
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

        <h2 className="text-2xl font-bold text-white mb-6">Grouped Admins</h2>

        {isLoading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {admins.length === 0 ? (
              <p className="text-center text-gray-400">No admins found in this group</p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin._id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white font-medium">{admin.username}</h3>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                    <span className="text-xs text-gray-500">{admin.role}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => handleViewUsers(admin._id)}
                      variant="ghost"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <span className={`px-2 py-1 rounded text-xs ${
                      admin.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                    }`}>
                      {admin.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedAdmin;