import React, { useState, useEffect, useCallback } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { RiHomeLine } from "react-icons/ri";
import { register, checkEmailExists } from "../../api/authApi";

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
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const navigate = useNavigate();

  // Debounce function để tránh gọi API quá nhiều lần
  const debounce = useCallback((func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Function kiểm tra full name (username)
  const validateFullName = useCallback((fullName) => {
    if (!fullName || fullName.trim().length === 0) {
      setFullNameError("");
      return;
    }

    const trimmedName = fullName.trim();
    
    // Kiểm tra độ dài (sau khi trim)
    if (trimmedName.length < 2) {
      setFullNameError("Họ tên phải có ít nhất 2 ký tự");
      return;
    }
    
    if (trimmedName.length > 50) {
      setFullNameError("Họ tên không được vượt quá 50 ký tự");
      return;
    }

    // Kiểm tra ký tự hợp lệ (chỉ cho phép chữ cái, dấu cách, dấu gạch ngang và dấu chấm)
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯăâđêôơư\s\-\.]+$/;
    if (!nameRegex.test(trimmedName)) {
      setFullNameError("Họ tên chỉ được chứa chữ cái, dấu cách, dấu gạch ngang và dấu chấm");
      return;
    }

    // Kiểm tra không được có nhiều dấu cách liên tiếp
    if (/\s{2,}/.test(trimmedName)) {
      setFullNameError("Họ tên không được có nhiều dấu cách liên tiếp");
      return;
    }

    // Kiểm tra không được chỉ có dấu cách hoặc ký tự đặc biệt
    if (/^[\s\-\.]+$/.test(trimmedName)) {
      setFullNameError("Họ tên phải chứa ít nhất một chữ cái");
      return;
    }

    setFullNameError("");
  }, []);

  // Function kiểm tra email
  const checkEmail = useCallback(async (email) => {
    if (!email || !email.includes('@')) {
      setEmailError("");
      return;
    }

    // Kiểm tra định dạng email chuẩn
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Định dạng email không hợp lệ");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const result = await checkEmailExists(email);
      if (result.exists) {
        setEmailError("Email này đã được sử dụng");
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailError("");
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Debounced version của checkEmail
  const debouncedCheckEmail = useCallback(
    debounce(checkEmail, 500),
    [debounce, checkEmail]
  );

  // Debounced version của validateFullName
  const debouncedValidateFullName = useCallback(
    debounce(validateFullName, 300),
    [debounce, validateFullName]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Kiểm tra full name khi user nhập
    if (name === "fullName") {
      setFullNameError(""); // Clear error trước khi check
      debouncedValidateFullName(value);
    }

    // Kiểm tra email khi user nhập
    if (name === "email") {
      setEmailError(""); // Clear error trước khi check
      debouncedCheckEmail(value);
    }
  };

  const showToast = (type, message) => {
    window.dispatchEvent(
      new CustomEvent("app:toast", { detail: { type, message } })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra full name error trước
    if (fullNameError) {
      showToast("error", fullNameError);
      return;
    }

    // Kiểm tra full name không được rỗng
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      showToast("error", "Vui lòng nhập họ tên");
      return;
    }

    // Kiểm tra email error trước
    if (emailError) {
      showToast("error", emailError);
      return;
    }

    // Kiểm tra nếu đang check email
    if (isCheckingEmail) {
      showToast("error", "Đang kiểm tra email, vui lòng chờ...");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      showToast(
        "error",
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ thường, chữ in hoa và số!"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("error", "Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!agreeTerms) {
      showToast("error", "Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    setLoading(true);
    try {
      // Tự động trim họ tên trước khi gửi
      const trimmedFullName = formData.fullName.trim();
      const res = await register(
        trimmedFullName,
        formData.email,
        formData.password
      );
      showToast(
        "success",
        res.message ||
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực."
      );
      setTimeout(() => setActiveTab("login"), 2000);
    } catch (err) {
      showToast("error", err.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="p-4 flex justify-center">
        <a href="/" className="flex items-center space-x-3">
          <img src={logo} alt="Logo" className="h-[1.8em] w-auto scale-300" />
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Họ tên</label>
          <div className="relative">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ tên của bạn"
              className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 pr-10 ${
                fullNameError 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-600 focus:ring-orange-500"
              }`}
              required
            />
            {/* Success icon */}
            {formData.fullName && !fullNameError && formData.fullName.trim().length >= 2 && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {/* Error icon */}
            {fullNameError && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {/* Error message */}
          {fullNameError && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fullNameError}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className={`w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 pr-10 ${
                emailError 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-600 focus:ring-orange-500"
              }`}
              required
            />
            {/* Loading spinner */}
            {isCheckingEmail && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              </div>
            )}
            {/* Success icon */}
            {!isCheckingEmail && formData.email && !emailError && formData.email.includes('@') && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {/* Error icon */}
            {!isCheckingEmail && emailError && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {/* Error message */}
          {emailError && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {emailError}
            </p>
          )}
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                )}
              </svg>
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showConfirmPassword ? (
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                )}
              </svg>
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
      <div className="text-center my-3">
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