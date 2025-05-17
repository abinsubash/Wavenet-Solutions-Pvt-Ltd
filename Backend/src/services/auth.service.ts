import { AuthRepository } from "../repositories/auth.repository";
import { hashPassword, comparePassword } from "../utils/bcrypt.util";
import { SignupInput, LoginInput } from "../schemas/auth.schema";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { IUser, UserRole, AdminResponse } from '../types/user.types';
import { Types, Document } from 'mongoose';
import { string } from "zod";

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async signup(userData: SignupInput) {
    const existingUser = await this.authRepository.findUserByEmail(
      userData.email
    );
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(userData.password);

    const newUser = await this.authRepository.create({
      ...userData,
      password: hashedPassword,
      isBlocked: false,
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(loginData: LoginInput) {
    const user = await this.authRepository.findByEmail(loginData.email);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    // Check if user is blocked before password verification
    if (user.isBlocked) {
      throw createHttpError(403, "Your account has been blocked");
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      loginData.password,
      user.password
    );
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid credentials");
    }

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAllUsers() {
    const users = await this.authRepository.getAllUsers();
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
  async loginUser(loginData: LoginInput) {
    // Find user by email
    const user = await this.authRepository.findByEmail(loginData.email);

    if (!user) {
      throw createHttpError(401, "Invalid email or password");
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw createHttpError(403, "Your account has been blocked. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid email or password");
    }

    // Validate role if provided
    if (loginData.role && user.role !== loginData.role) {
      throw createHttpError(403, "Invalid role for this user");
    }

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async toggleUserBlock(userId: string): Promise<IUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    user.isBlocked = !user.isBlocked;
    return await this.authRepository.save(user) as IUser;
  }

  async deleteUser(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    await this.authRepository.delete(userId);
  }

  // Update createUnitManager method to handle both unit managers and users
  createUnitManager = async (userData: {
    username: string;
    email: string;
    password: string;
    createdBy: string;
    role: UserRole;
  }) => {
    try {
      // Check if email already exists
      const existingUser = await this.authRepository.findByEmail(userData.email);
      if (existingUser) {
        throw createHttpError(400, "Email already exists");
      }

      // Get creator's role to enforce role hierarchy
      const creator = await this.authRepository.findById(userData.createdBy);
      if (!creator) {
        throw createHttpError(404, "Creator not found");
      }

      // Validate role based on creator's role
      if (creator.role === 'unitManager' && userData.role !== 'user') {
        throw createHttpError(403, "Unit managers can only create users with 'user' role");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user
      const newUser = await this.authRepository.createUnitManager({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  };

  // Add method to get users created by unit manager
  async getAllUnitManagerCreated(unitManagerId: string) {
    try {
      const users = await this.authRepository.findUsersByCreator(unitManagerId);
      console.log(users)
      if (!users) {
        throw createHttpError(404, "No users found");
      }
      return users.map(user => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });
    } catch (error) {
      throw error;
    }
  }

  async getUnitManagerCreatedUsers(unitManagerId: string) {
    try {
      const users = await this.authRepository.getUnitManagerCreatedUsers(unitManagerId);
      
      return users.map(user => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });
    } catch (error) {
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: UserRole): Promise<IUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    // Validate role
    if (!['admin', 'unitManager', 'user'].includes(newRole)) {
      throw createHttpError(400, "Invalid role");
    }

    user.role = newRole;
    return await this.authRepository.save(user) as IUser;
  }

  async getAllAdminCreated(adminId: string) {
    try {
      const users = await this.authRepository.getAllAdminCreated(adminId);
      if (!users) {
        throw createHttpError(404, "No users found");
      }
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getAllAdmins(id:string) {
    try {
      const admins = await this.authRepository.getAllAdmins(id);
      return admins.map(admin => {
        const { password, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      });
    } catch (error) {
      throw error;
    }
  }

  async addToGroup(currentUserId: string, adminToAddId: string) {
    try {
      // Add adminToAdd to current user's group
      await this.authRepository.addToGroupedWith(currentUserId, adminToAddId);
      
      // Add current user to adminToAdd's group
      await this.authRepository.addToGroupedWith(adminToAddId, currentUserId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async removeFromGroup(currentUserId: string, adminToRemoveId: string) {
    try {
      // Remove adminToRemove from current user's group
      await this.authRepository.removeFromGroupedWith(currentUserId, adminToRemoveId);
      
      // Remove current user from adminToRemove's group
      await this.authRepository.removeFromGroupedWith(adminToRemoveId, currentUserId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getGroupedAdmins(userId: string): Promise<AdminResponse[]> {
    try {
      const groupedAdmins = await this.authRepository.getGroupedAdmins(userId);
      
      return groupedAdmins.map(admin => {
        // Cast admin to proper type that includes Document properties
        const adminDoc = admin as unknown as Document & {
          _id: Types.ObjectId;
          username: string;
          email: string;
          password: string;
          refreshToken?: string;
          role: string;
          isBlocked: boolean;
        };

        const { password, refreshToken, ...adminWithoutPassword } = adminDoc;
        return adminWithoutPassword as AdminResponse;
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllUnitManagers(Id: string) {
    try {
      const unitManagers = await this.authRepository.getAllUnitManagers(Id);
      
      return unitManagers.map(manager => {
        // Check if manager is a Mongoose document
        if (manager.toObject) {
          const managerObj = manager.toObject();
          const { password, ...managerWithoutSensitiveInfo } = managerObj;
          return managerWithoutSensitiveInfo;
        } else {
          // If it's a plain object, destructure directly
          const { password, ...managerWithoutSensitiveInfo } = manager;
          return managerWithoutSensitiveInfo;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async addUnitManagerToGroup(currentUserId: string, unitManagerToAddId: string) {
    try {
      // Add unitManager to current user's group
      await this.authRepository.addToGroupedWith(currentUserId, unitManagerToAddId);
      
      // Add current user to unitManager's group
      await this.authRepository.addToGroupedWith(unitManagerToAddId, currentUserId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getGroupedUsers(userId: string) {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Convert ObjectId array to string array

      const groupedUsers = await this.authRepository.getGroupedUsers(userId);
      
      return groupedUsers.map(user => {
        const { password, ...userWithoutPassword } = user.toObject();
        return userWithoutPassword;
      });
    } catch (error) {
      throw error;
    }
  }
}
