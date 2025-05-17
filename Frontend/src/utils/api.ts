import axios from 'axios';

export const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  return axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Add this line
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Refresh-Token': refreshToken,
      'Content-Type': 'application/json'
    }
  });
};