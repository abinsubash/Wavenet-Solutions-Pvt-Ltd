export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  groupedWith?: string[];
}

export interface Admin {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  groupedWith?: string[];
}