import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/hooks'
import { setCredentials } from '../../store/auth.slice'
import { loginUser } from '../../api/auth'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import axios from 'axios'

interface FormData {
  email: string
  role: string
  password: string
}

interface FormErrors {
  email?: string
  role?: string
  password?: string
}

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [form, setForm] = useState<FormData>({ email: '', role: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          return 'Please enter a valid email address'
        }
        break
      case 'role':
        if (!value) return 'Role is required'
        break
      case 'password':
        if (!value) return 'Password is required'
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
          return 'Password must have 8+ characters with uppercase, lowercase, number & special character'
        }
        break
    }
    return ''
  }

  const handleChange = (
    name: string,
    value: string,
  ) => {
    setForm(prev => ({ ...prev, [name]: value }))
    const message = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: message }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await loginUser(form);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));

        toast.success('Login successful');
        
        // Updated role check and navigation
        switch (response.data.user.role.toLowerCase()) {
          case 'admin':
            navigate('/admin/home');
            break;
          case 'unitmanager':
            navigate('/unit-manager/home');
            break;
          case 'user':
            navigate('/user/home');
            break;
          default:
            navigate('/login');
            toast.error('Invalid role');
        }
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      toast.error(errorMessage)
      
      if (error.response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          email: 'Invalid credentials'
        }))
      }
    } else {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 shadow-lg border border-zinc-800">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-800 px-3 py-2 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-300">
              Role
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full border border-zinc-700 bg-zinc-800 px-3 py-2 rounded-md 
                           text-white text-left focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {form.role || 'Select role'}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-800 rounded-md shadow-md border border-zinc-700 p-1">
                {[ 'admin', 'unitManager', 'user'].map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onSelect={() => handleChange('role', role)}
                    className="px-3 py-2 text-white hover:bg-zinc-700 cursor-pointer rounded-sm"
                  >
                    {role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {errors.role && (
              <p className="mt-1 text-sm text-red-500">{errors.role}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-800 px-3 py-2 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 text-white py-2 rounded-md hover:bg-red-700 
                     transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
