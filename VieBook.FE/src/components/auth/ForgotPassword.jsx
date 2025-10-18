import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import {
  RiHomeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockPasswordLine,
} from "react-icons/ri";
import { forgotPassword, verifyOtp, resetPassword } from "../../api/authApi";

export default function ForgotPassword({ setActiveTab }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: string }

  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const res = await forgotPassword(email);
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setStep(2);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setMessage({ type: "error", text: "Mã OTP phải đủ 6 kí tự" });
      return;
    }

    const res = await verifyOtp(email, verificationCode);
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setStep(3);
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    const res = await resetPassword(email, newPassword);
    if (res.success) {
      setMessage({ type: "success", text: res.message });
      setActiveTab("login");
    } else {
      setMessage({ type: "error", text: res.message });
    }
  };

  const renderMessage = () =>
    message && (
      <div
        className={`p-3 mb-4 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-800 border border-green-600 text-green-200"
            : "bg-red-800 border border-red-600 text-red-200"
        }`}
      >
        {message.text}
      </div>
    );

  const FooterNav = () => (
    <div className="text-center my-4">
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
  );

  const renderStep = () => {
    const renderSteps = () => (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step >= 1 ? "bg-orange-500 text-white" : "bg-gray-600 text-gray-400"
            }`}
          >
            1
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step >= 2 ? "bg-orange-500 text-white" : "bg-gray-600 text-gray-400"
            }`}
          >
            2
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              step >= 3 ? "bg-orange-500 text-white" : "bg-gray-600 text-gray-400"
            }`}
          >
            3
          </div>
        </div>
      </div>
    );

    switch (step) {
      case 1:
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="p-6 flex justify-center">
              <a href="/" className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
                <span className="text-2xl font-bold text-orange-500">VieBook</span>
              </a>
            </div>

            {renderSteps()}
            {renderMessage()}

            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Quên mật khẩu?
            </h2>
            <p className="text-center text-gray-400 text-sm mb-8">
              Nhập email để nhận mã xác thực mật khẩu
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition">
                Gửi mã xác thực
              </button>
              <FooterNav />
              {/* Nút về trang chủ */}
              <div className="text-center my-5">
                <button
                  onClick={() => navigate("/")}
                  className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
                >
                  <RiHomeLine className="w-4 h-4 mr-1" />
                  Về trang chủ
                </button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="p-6 flex justify-center">
              <a href="/" className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
                <span className="text-2xl font-bold text-orange-500">VieBook</span>
              </a>
            </div>

            {renderSteps()}
            {renderMessage()}

            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Nhập mã xác thực
            </h2>

            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-lg tracking-widest py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                maxLength={6}
                required
              />
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition">
                Xác thực mã
              </button>
              <FooterNav />
              {/* Nút về trang chủ */}
            <div className="text-center my-5">
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
              >
                <RiHomeLine className="w-4 h-4 mr-1" />
                Về trang chủ
              </button>
            </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="p-6 flex justify-center">
              <a href="/" className="flex items-center space-x-3">
                <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
                <span className="text-2xl font-bold text-orange-500">VieBook</span>
              </a>
            </div>

            {renderSteps()}
            {renderMessage()}

            <h2 className="text-2xl font-semibold text-center text-white mb-4">
              Đặt mật khẩu mới
            </h2>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showNewPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                </button>
              </div>

              <div className="relative">
                <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                </button>
              </div>

              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition">
                Đặt lại mật khẩu
              </button>
              <FooterNav />
              {/* Nút về trang chủ */}
            <div className="text-center my-5">
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-gray-300 text-sm flex items-center mx-auto"
              >
                <RiHomeLine className="w-4 h-4 mr-1" />
                Về trang chủ
              </button>
            </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
}
