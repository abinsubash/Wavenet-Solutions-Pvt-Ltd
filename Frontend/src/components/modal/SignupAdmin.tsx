import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { createUnitManager } from "@/api/auth";
import { toast } from 'react-hot-toast';

interface SignupProps {
  onClose: () => void;
  onUserAdded?: () => void;
}

const SignupAdmin: React.FC<SignupProps> = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "unitManager", // Default role set to unitManager
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    let message = "";
    switch (name) {
      case "username":
        if (!/^[a-zA-Z0-9]{3,}$/.test(value)) {
          message = "Username must be at least 3 characters (letters/numbers only)";
        }
        break;
      case "email":
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          message = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
          message = "Password must have 8+ characters with uppercase, lowercase, number & special character";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          message = "Passwords do not match";
        }
        break;
    }
    return message;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const message = validateField(name, value);
    setError(prev => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await createUnitManager(userData);
      toast.success('Unit Manager created successfully');
      onUserAdded?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create Unit Manager');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Create Unit Manager</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       placeholder:text-gray-500"
              placeholder="Enter username"
            />
            {error.username && (
              <p className="mt-1 text-sm text-red-500">{error.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                       text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       placeholder:text-gray-500"
              placeholder="Enter email"
            />
            {error.email && (
              <p className="mt-1 text-sm text-red-500">{error.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value="Unit Manager"
              readOnly
              className="mt-1 block w-full px-3 py-2 bg-zinc-700 border border-zinc-700 rounded-md 
                       text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                         text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         placeholder:text-gray-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error.password && (
              <p className="mt-1 text-sm text-red-500">{error.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md 
                         text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                         placeholder:text-gray-500"
                placeholder="Confirm password"
              />
            </div>
            {error.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{error.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm sm:text-base transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || Object.values(error).some(err => err !== "") || 
                       Object.values(formData).some(value => value === "")}
              className="bg-red-700 hover:bg-red-600 px-4 py-2 text-sm sm:text-base transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupAdmin;