import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getUnitManagers, addToUnitManagerGroup } from '@/api/user';
import { useAppSelector } from '../../hooks/hooks';
import toast from 'react-hot-toast';

interface UnitManagerGroupModalProps {
  onClose: () => void;
  onUnitManagerAdded: () => void;
}

interface UnitManager {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const UnitManagerGroupModal: React.FC<UnitManagerGroupModalProps> = ({ onClose, onUnitManagerAdded }) => {
  const [unitManagers, setUnitManagers] = useState<UnitManager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchUnitManagers();
  }, []);

  const fetchUnitManagers = async () => {
    try {
      setIsLoading(true);
      const response = await getUnitManagers();
      console.log(response)
      if (response.success) {
        const filteredManagers = response.data.filter(
          (manager: UnitManager) => manager._id !== user?._id
        );
        setUnitManagers(filteredManagers);
      }
    } catch (error) {
      toast.error('Failed to fetch unit managers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnitManager = async (managerId: string) => {
    try {
      const response = await addToUnitManagerGroup(managerId);
      if (response.success) {
        toast.success('Unit manager added to group');
        setUnitManagers(prev => prev.filter(manager => manager._id !== managerId));
        onUnitManagerAdded();
      }
    } catch (error) {
      toast.error('Failed to add unit manager');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add Unit Manager to Group</h2>
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
            {unitManagers.length === 0 ? (
              <p className="text-center text-gray-400">No unit managers found</p>
            ) : (
              unitManagers.map((manager) => (
                <div
                  key={manager._id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <h3 className="text-white font-medium">{manager.username}</h3>
                    <p className="text-sm text-gray-400">{manager.email}</p>
                  </div>
                  <Button
                    onClick={() => handleAddUnitManager(manager._id)}
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

export default UnitManagerGroupModal;