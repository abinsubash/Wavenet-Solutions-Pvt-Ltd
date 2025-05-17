import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { addToGroup, getAdmins } from '@/api/user';
import { useAppSelector } from '../../hooks/hooks';
import toast from 'react-hot-toast';

interface GroupModalProps {
  onClose: () => void;
  onAdminAdded: () => void;
}

interface Admin {
  _id: string;  // Remove Types.ObjectId
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const GroupModal: React.FC<GroupModalProps> = ({ onClose, onAdminAdded }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await getAdmins();
      if (response.success) {
        const filteredAdmins = response.data.filter(
          (admin: Admin) => admin._id !== user?._id // Changed from id to _id
        );
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      toast.error('Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (adminId: string) => {
    try {
      const response = await addToGroup(adminId);
      if (response.success) {
        toast.success('Admin added to group');
        setAdmins(prevAdmins => prevAdmins.filter(admin => admin._id !== adminId));
        onAdminAdded();
      }
    } catch (error) {
      toast.error('Failed to add admin');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to Group</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            ×
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-4">
            {admins.length === 0 ? (
              <p className="text-center text-gray-400">No admins found</p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-medium">{admin.username}</h3>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                  </div>
                  <Button
                    onClick={() => handleAddAdmin(admin._id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupModal;