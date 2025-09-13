import React, { useState } from "react";
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine } from "react-icons/ri";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Mật khẩu mới phải ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    // Giả lập gọi API đổi mật khẩu
    setTimeout(() => {
      setMessage("✅ Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Đổi mật khẩu
        </h2>

        {message && (
          <div className="mb-4 text-center text-sm text-red-400">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 pr-10 outline-none"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <RiLockPasswordLine className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 pr-10 outline-none"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 pr-10 outline-none"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
