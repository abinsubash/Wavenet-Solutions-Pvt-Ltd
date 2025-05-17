import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { signupUser } from "@/api/auth";
import { toast } from 'react-hot-toast';

interface SignupProps {
  onClose: () => void;
  onUserAdded?: () => void;  
}

const SignupSuperAdmin: React.FC<SignupProps> = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "admin",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string) => {
    let message = "";
    switch (name) {
      case "username":
        if (!/^[a-zA-Z0-9]{3,}$/.test(value)) {
          message =
            "Username must be at least 3 characters (letters/numbers only)";
        }
        break;
      case "email":
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
          message = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value)) {
          message =
            "Password must have 8+ characters with uppercase, lowercase, number & special character";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const message = validateField(name, value);
    setError((prev) => ({ ...prev, [name]: message }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors = {
      username: validateField("username", formData.username),
      email: validateField("email", formData.email),
      role: validateField("role", formData.role),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    };

    setError(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    
    if (!hasErrors) {
      try {
        // Remove confirmPassword before sending
        const { confirmPassword, ...signupData } = formData;
        
        const response = await signupUser(signupData);
        
        if (response.success) {
          toast.success('User registered successfully');
          onUserAdded?.(); // Refresh user list
          onClose();
        }
      } catch (error) {
        console.error("Signup failed:", error);
        toast.error(error instanceof Error ? error.message : "Signup failed");
        
        // Show error under email field if it's a duplicate email
        if (error instanceof Error && error.message.includes('email')) {
          setError(prev => ({
            ...prev,
            email: error.message
          }));
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-filter backdrop-brightness-75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 p-4 sm:p-6 rounded-lg w-full max-w-[95%] sm:max-w-md mx-auto my-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Create Admin
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Enter username"
              className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-white border border-zinc-700 text-sm sm:text-base focus:outline-none focus:border-red-500"
              value={formData.username}
              onChange={handleChange}
            />
            {error.username && (
              <small className="text-red-500 text-xs sm:text-sm mt-1 block">
                {error.username}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-white border border-zinc-700 text-sm sm:text-base focus:outline-none focus:border-red-500"
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && (
              <small className="text-red-500 text-xs sm:text-sm mt-1 block">
                {error.email}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Role</label>
            <select
              name="role"
              className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-white border border-zinc-700 text-sm sm:text-base focus:outline-none focus:border-red-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full p-2 sm:p-3 pr-10 rounded bg-zinc-800 text-white border border-zinc-700 text-sm sm:text-base focus:outline-none focus:border-red-500"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error.password && (
              <small className="text-red-500 text-xs sm:text-sm mt-1 block">
                {error.password}
              </small>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="w-full p-2 sm:p-3 rounded bg-zinc-800 text-white border border-zinc-700 text-sm sm:text-base focus:outline-none focus:border-red-500"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {error.confirmPassword && (
              <small className="text-red-500 text-xs sm:text-sm mt-1 block">
                {error.confirmPassword}
              </small>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm sm:text-base transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-700 hover:bg-red-600 px-4 py-2 text-sm sm:text-base transition-colors"
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupSuperAdmin;
