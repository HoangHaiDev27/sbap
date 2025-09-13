import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { RiHomeLine } from "react-icons/ri";

export default function ForgotPassword({ setActiveTab }) {
  const [step, setStep] = useState(1); // 1: Email input, 2: Verification code, 3: Reset password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle sending verification code
    console.log("Sending verification code to:", email);
    setStep(2);
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    // Handle verification code validation
    console.log("Verifying code:", verificationCode);
    setStep(3);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    // Handle password reset
    console.log("Resetting password");
    // Redirect to login after successful reset
    setActiveTab("login");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <img
                src={logo}
                alt="VieBook Logo"
                className="w-20 h-20 mx-auto "
            />

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  1
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm">
                  2
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm">
                  3
                </div>
              </div>
            </div>

            {/* Form Title */}
            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Quên mật khẩu?
            </h2>
            <p className="text-center text-gray-400 text-sm mb-8">
              Nhập email để nhận mã xác phục mật khẩu
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Địa chỉ email</label>
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Gửi mã xác thực
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Quay lại đăng nhập
                </button>
              </div>
            </form>

            {/* Back to Homepage */}
             <div className="text-center mt-5">
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

      case 2:
        return (
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src={logo}
                alt="VieBook Logo"
                className="w-20 h-20 mx-auto "
                />
              <p className="text-gray-400 text-sm">Xác thực mã</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  1
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  2
                </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-gray-400 text-sm">
                  3
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-800 border border-green-600 rounded-lg p-3 mb-6">
              <p className="text-green-200 text-sm text-center">
                Mã xác nhận đã được gửi đến email của bạn {email}
              </p>
            </div>

            {/* Form Title */}
            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Nhập mã xác thực
            </h2>
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              {/* Verification Code Field */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mã xác thực (6 số)</label>
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
                        d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0H9"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Resend Code */}
             <div className="text-center flex items-center justify-center space-x-1">
                <p className="text-gray-400 text-sm">Không nhận được mã?</p>
                <button
                  type="button"
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium"
                >
                  Gửi lại mã xác thực
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Xác thực mã
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Quay lại đăng nhập
                </button>
              </div>
            </form>

            {/* Back to Homepage */}
             <div className="text-center mt-5">
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

      case 3:
        return (
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src={logo}
                alt="VieBook Logo"
                className="w-20 h-20 mx-auto "
                />
              <p className="text-gray-400 text-sm">Đặt mật khẩu mới</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  1
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  2
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  3
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="bg-green-800 border border-green-600 rounded-lg p-3 mb-4">
              <p className="text-green-200 text-sm text-center">
                Mã xác nhận đã được gửi đến email cá nhân của bạn
              </p>
            </div>

            {/* Form Title */}
            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Đặt mật khẩu mới
            </h2>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mật khẩu mới</label>
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
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {showNewPassword ? (
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

              {/* Confirm New Password Field */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Xác nhận mật khẩu</label>
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
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Đặt lại mật khẩu
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Quay lại đăng nhập
                </button>
              </div>
            </form>

            {/* Back to Homepage */}
             <div className="text-center mt-5">
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

      default:
        return null;
    }
  };

  return renderStep();
}