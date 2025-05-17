import { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'unitManager' | 'user';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  role: UserRole;
  isBlocked: boolean;
  createdBy?: string;
  groupedWith?: Types.ObjectId[];
  __v?: number;
}

export interface AdminResponse {
  _id: Types.ObjectId;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdBy?: string;
  groupedWith?: Types.ObjectId[];
}