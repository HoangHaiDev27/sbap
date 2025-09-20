import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { RiHomeLine } from "react-icons/ri";
import { login as loginRequest, googleLogin } from "../../api/authApi";
import GoogleIdentityLogin from "./GoogleIdentityLogin";
export default function Login({ setActiveTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (idToken) => {
    try {
      console.log('Google Identity login success, idToken:', idToken?.substring(0, 20) + '...');
      const res = await googleLogin(idToken);
      console.log('Google login response:', res);
      
      const roles = (res?.roles || res?.Roles || []).map((r) => String(r || '').toLowerCase());
      console.log('User roles:', roles);
      
      if (roles.includes('admin')) {
        navigate('/admin');
      } else if (roles.includes('staff')) {
        navigate('/staff');
      } else if (roles.includes('owner')) {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.warn("[Google Login] error", err);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Đăng nhập Google thất bại" } }));
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google OAuth error:", error);
    window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: error || "Lỗi đăng nhập Google" } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginRequest(email, password);
      const roles = (res?.roles || res?.Roles || []).map((r) => String(r || '').toLowerCase());
      if (roles.includes('admin')) {
        navigate('/admin');
      } else if (roles.includes('staff')) {
        navigate('/staff');
      } else if (roles.includes('owner')) {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.warn("[Login] error", err);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Đăng nhập thất bại" } }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto ">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <a href="/" className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="h-[1.5em] w-auto scale-300"
          />
          <span className="text-2xl font-bold text-orange-500">VieBook</span>
        </a>
      </div>


      {/* Form Title */}
      <h2 className="text-2xl font-semibold text-center text-white mb-4">
        Đăng nhập
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Mật khẩu</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-400">Ghi nhớ đăng nhập</span>
          </label>
          <button
            type="button"
            onClick={() => setActiveTab("forgot")}
            className="text-sm text-orange-500 hover:text-orange-400"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Đăng nhập
        </button>

        {/* Divider */}
        <div className="text-center text-gray-400 text-sm">
          hoặc đăng nhập với
        </div>

        {/* Social Login (Chỉ giữ Google) */}
        <div className="flex">
          <GoogleIdentityLogin 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-gray-400">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Đăng ký ngay
          </button>
        </div>
      </form>

      {/* Back to Homepage */}
      <div className="text-center my-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
        >
          <RiHomeLine className="w-5 h-5 mr-1" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
