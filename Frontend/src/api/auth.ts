import axios from "axios";

const API_URL = "https://wavenet-solutions-pvt-ltd.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

interface SignupData {
  username: string;
  email: string;
  role: string;
  password: string;
}

export const signupUser = async (userData: SignupData) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/signup`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Signup failed");
    }
    throw error;
  }
};

interface LoginCredentialsSuperAdmin {
  email: string;
  password: string;
}

export const loginSuperAdmin = async (credentials: LoginCredentialsSuperAdmin) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
};

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await axios.post('https://wavenet-solutions-pvt-ltd.onrender.com/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Your account has been blocked');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get('https://wavenet-solutions-pvt-ltd.onrender.com/api/auth/users');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
    throw error;
  }
};

export const createUnitManager = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.post('/auth/admin/create-unit-manager', userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create unit manager');
    }
    throw error;
  }
};

export const createAuthenticatedRequest = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  console.log('Token:', token);
  console.log('Refresh Token:', refreshToken);

  return axios.create({
    baseURL: 'https://wavenet-solutions-pvt-ltd.onrender.com/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Refresh-Token': refreshToken,
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });
};