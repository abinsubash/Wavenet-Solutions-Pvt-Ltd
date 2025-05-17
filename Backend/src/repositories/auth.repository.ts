import { UserModel } from '../model/user.model';
import { Types, Document } from 'mongoose';
import { IUser, UserRole } from '../types/user.types';

type UserData = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isBlocked: boolean;
};

export class AuthRepository {
  async create(userData: UserData) {
    const user = await UserModel.create(userData);
    if (!user) throw new Error('Failed to create user');
    return user.toObject();
  }

  async findUserByEmail(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return user.toObject();
  }

  async checkBlockStatus(email: string) {
    const user = await UserModel.findOne({ email });
    return user?.isBlocked || false;
  }

  async getAllUsers() {
    const users = await UserModel.find({ role: { $ne: 'superAdmin' } });
    return users.map(user => user.toObject());
  }

  async findByEmail(email: string) {
    const user = await UserModel.findOne({ email });
    return user ? user.toObject() : null;
  }

  async findByEmailAndRole(email: string, role?: string) {
    if (!role) return null;

    const user = await UserModel.findOne({
      email,
      role: { $regex: new RegExp(role, 'i') }
    });

    return user ? user.toObject() : null;
  }

  async createUnitManager(userData: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    createdBy: string;
  }) {
    try {
      const unitManager = new UserModel({
        ...userData,
        isBlocked: false // Remove redundant role assignment since it's already in userData
      });
      return await unitManager.save();
    } catch (error) {
      throw error;
    }
  }

  async findById(userId: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(userId) as IUser | null;
    } catch (error) {
      throw error;
    }
  }

  async save(user: IUser): Promise<IUser> {
    try {
      return await user.save() as IUser;
    } catch (error) {
      throw error;
    }
  }

  async delete(userId: string) {
    try {
      return await UserModel.findByIdAndDelete(userId);
    } catch (error) {
      throw error;
    }
  }

  async getAllAdminCreated(adminId: string) {
    try {
      const users = await UserModel.find({ 
        createdBy: adminId,
      }).populate('createdBy', 'username email');
      
      return users.map(user => user.toObject());
    } catch (error) {
      throw error;
    }
  }

  async findUsersByCreator(creatorId: string, ) {
    try {
      console.log('This is user datashowing',creatorId)
      const users = await UserModel.find({ 
        createdBy: new Types.ObjectId(creatorId),
      })
      .select('-password')
      .sort({ createdAt: -1 });

      console.log('Found users:', users); // For debugging

      if (!users.length) {
        console.log(`No users found for creator ${creatorId} with role user`);
        return [];
      }

      return users;
    } catch (error) {
      console.error('Error in findUsersByCreator:', error);
      throw error;
    }
  }

  async getAllAdmins(currentUserId: string) {
    try {
      // First get the current user to access their groupedWith array
      const currentUser = await UserModel.findById(currentUserId);
      
      if (!currentUser) {
        throw new Error('Current user not found');
      }

      // Get all non-blocked admins
      const admins = await UserModel.find({ 
        role: 'admin',
        isBlocked: false,
        _id: { $ne: currentUserId }
      }).select('-password');

      // Filter out admins who are already in the user's groupedWith array
      const filteredAdmins = admins.filter(admin => 
        !currentUser.groupedWith?.some(groupedId => 
          groupedId.toString() === (admin._id as Types.ObjectId).toString()
        )
      );

      return filteredAdmins.map(admin => admin.toObject());
    } catch (error) {
      throw error;
    }
  }

  async addToGroupedWith(userId: string, adminId: string) {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        { 
          $addToSet: { groupedWith: adminId } 
        },
        { new: true }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getGroupedAdmins(userId: string) {
    try {
      const user = await UserModel.findById(userId)
        .populate('groupedWith', '-password -refreshToken -createdAt -updatedAt')
        .select('groupedWith');

      if (!user) {
        throw new Error('User not found');
      }

      return user.groupedWith || [];
    } catch (error) {
      throw error;
    }
  }

  async removeFromGroupedWith(userId: string, adminId: string) {
    try {
      await UserModel.findByIdAndUpdate(
        userId,
        { 
          $pull: { groupedWith: adminId } 
        },
        { new: true }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getAllUnitManagers(currentUserId: string) {
    try {
      // First get the current user to access their groupedWith array
      const currentUser = await UserModel.findById(currentUserId);
      
      if (!currentUser) {
        throw new Error('Current user not found');
      }

      // Get all non-blocked unit managers
      const unitManagers = await UserModel.find({ 
        role: 'unitManager',
        isBlocked: false,
        _id: { $ne: currentUserId }
      }).select('-password');

      // Filter out unit managers who are already in the user's groupedWith array
      const filteredUnitManagers = unitManagers.filter(unitManager => 
        !currentUser.groupedWith?.some(groupedId => 
          groupedId.toString() === (unitManager._id as Types.ObjectId).toString()
        )
      );

      return filteredUnitManagers.map(unitManager => unitManager.toObject());
    } catch (error) {
      throw error;
    }
  }

  async getGroupedUsers(userId: string) {
    try {
      // Convert string IDs to ObjectIds
      const users = await UserModel.find({
        createdBy: userId,
      }).select('-password');
      console.log('this is usersBYkkkkkkkkkkkkkkkkk',users)
      return users;

    } catch (error) {
      throw error;
    }
  }

  async getUnitManagerCreatedUsers(unitManagerId: string) {
    try {
      const users = await UserModel.find({
        createdBy: new Types.ObjectId(unitManagerId),
        isDeleted: false
      }).select('-password')
        .populate('createdBy', 'username email role');
      
      return users;
    } catch (error) {
      throw error;
    }
  }
}