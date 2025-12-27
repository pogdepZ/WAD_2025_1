import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { authService } from '../../services/api';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      
      // 1. Debug: Xem Backend trả về cái gì
      console.log("Login Response:", res.data); 

      // Lưu token vào Session Storage
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success(`Xin chào ${res.data.user.name}!`);

      // Điều hướng dựa trên Role
      const role = res.data.user.role;
      setTimeout(() => {
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'WAITER') navigate('/waiter');
        else if (role === 'KITCHEN') navigate('/kitchen');
        else navigate('/');
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.error || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-4 font-sans">
      <Toaster position="top-right" />

      {/* Login Box */}
      <div className="bg-white w-full max-w-[450px] p-10 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🍴</div>
          <h1 className="text-2xl font-bold text-[#2c3e50] mb-1">Smart Restaurant</h1>
          <p className="text-[#7f8c8d] text-sm">System Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">Email</label>
            <input 
              {...register("email", { required: "Vui lòng nhập email" })}
              type="email" 
              placeholder="admin@restaurant.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e74c3c] focus:ring-2 focus:ring-[#e74c3c]/20 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600">Password</label>
            <input 
              {...register("password", { required: "Vui lòng nhập mật khẩu" })}
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#e74c3c] focus:ring-2 focus:ring-[#e74c3c]/20 outline-none transition-all text-gray-700 bg-gray-50 focus:bg-white"
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-[#e74c3c] focus:ring-[#e74c3c] border-gray-300" />
              <span className="text-sm text-[#7f8c8d]">Remember me</span>
            </label>
            <a href="#" className="text-sm text-[#e74c3c] hover:underline font-medium">
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#e74c3c] hover:bg-[#c0392b] text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-[#95a5a6]">
          &copy; 2025 Smart Restaurant. All rights reserved.
        </div>
      </div>
    </div>
  );
}