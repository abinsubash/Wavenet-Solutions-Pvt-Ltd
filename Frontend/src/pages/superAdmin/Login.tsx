import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../hooks/hooks';
import { setCredentials } from '../../store/auth.slice';
import { loginSuperAdmin } from '@/api/auth';

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const validateField = (name: string, value: string): string => {
    let message = '';
    switch (name) {
      case 'email':
        if (!value) {
          message = 'Email is required';
        } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          message = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          message = 'Password is required';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
          message = 'Password must have 8+ characters with uppercase, lowercase, number & special character';
        }
        break;
    }
    return message;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const message = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {} as Partial<LoginFormData>;
    Object.entries(formData).forEach(([key, value]) => {
      const message = validateField(key, value);
      if (message) {
        newErrors[key as keyof LoginFormData] = message;
      }
    });

    setErrors(newErrors);

    // If no errors, proceed with login
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await loginSuperAdmin(formData);
        
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }));
        
        toast.success('Login successful');
        navigate('/super-admin/home');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Login failed');
        setErrors((prev) => ({
          ...prev,
          email: 'Invalid credentials'
        }));
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-400">
            Please enter your credentials to login
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                
                className="mt-1 block w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white 
                         focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         placeholder:text-gray-500"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  
                  className="block w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white 
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                           placeholder:text-gray-500"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md 
                     transition-colors duration-200 ease-in-out"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;