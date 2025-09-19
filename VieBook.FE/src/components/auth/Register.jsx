import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { RiHomeLine } from "react-icons/ri";
import { register } from "../../api/authApi"; // 👈 import API

export default function Register({ setActiveTab }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }
    if (!agreeTerms) {
      setMessage({ type: "error", text: "Vui lòng đồng ý với điều khoản sử dụng!" });
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData.fullName, formData.email, formData.password);
      setMessage({
        type: "success",
        text: res.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
      });
      setTimeout(() => setActiveTab("login"), 2000); // tự động chuyển tab login
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Đăng ký thất bại!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <a href="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-[1.8em] w-auto" />
          <span className="text-2xl font-bold text-orange-500">VieBook</span>
        </a>
      </div>

      {/* Form Title */}
      <h2 className="text-2xl font-semibold text-center text-white mb-3">
        Tạo tài khoản mới
      </h2>
      <p className="text-center text-gray-400 mb-6 text-sm">
        Nhanh chóng và dễ dàng để bắt đầu trải nghiệm VieBook
      </p>

      {/* Alert message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-500/20 text-red-400 border border-red-500/40"
              : "bg-green-500/20 text-green-400 border border-green-500/40"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập họ tên của bạn"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự, bao gồm chữ và số"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start text-sm">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            required
          />
          <span className="ml-2 text-gray-400">
            Tôi đồng ý với{" "}
            <button type="button" className="text-orange-500 hover:underline">
              Điều khoản sử dụng
            </button>{" "}
            và{" "}
            <button type="button" className="text-orange-500 hover:underline">
              Chính sách bảo mật
            </button>
          </span>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-medium transition duration-200 ${
            loading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-400">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className="text-orange-500 hover:text-orange-400 font-medium"
          >
            Đăng nhập ngay
          </button>
        </div>
      </form>

      {/* Back to Homepage */}
      <div className="text-center my-5">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
        >
          <RiHomeLine className="w-4 h-4 mr-1" />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
