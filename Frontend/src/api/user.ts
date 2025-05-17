import axios from 'axios';
import { createAuthenticatedRequest } from '../utils/api';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdBy: string;  // Add this line
}

export const getAllUsers = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/auth/users');

    // Check for new access token
    const newToken = response.headers['authorization'];
    if (newToken) {
      localStorage.setItem('token', newToken.split(' ')[1]);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
    throw error;
  }
};

export const blockUser = async (userId: string) => {
  try {
    const response = await axios.patch(`https://wavenet-solutions-pvt-ltd.onrender.com/api/auth/users/${userId}/block`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`https://wavenet-solutions-pvt-ltd.onrender.com/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.patch(`/auth/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
    throw error;
  }
};

export const getAdminCreatedUsers = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/auth/admin/users');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/admin/allAdmin');
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const addToGroup = async (userId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post(`/admin/addToGroup/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getGroupedAdmins = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/admin/grouped');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFromGroup = async (userId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.delete(`/admin/group/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUnitManagers = async () => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get('/users/getAllUnitManager');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addToUnitManagerGroup = async (managerId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post(`/unit-manager/addToGroup/${managerId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getGroupedUsers = async (userId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get(`/users/grouped/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getUsers = async(userId:string)=>{
  try{

    const api = createAuthenticatedRequest()
    const response = await api.get(`/unit-Manager/${userId}`)
    return response.data

  }catch(error){
    throw error
  }
}