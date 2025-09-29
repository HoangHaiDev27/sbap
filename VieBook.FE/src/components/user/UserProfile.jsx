import React, { useEffect, useState } from "react";
import { changePassword, isBookOwner } from "../../api/authApi";
import { becomeOwner, upsertMyProfile } from "../../api/userApi";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // State toggle hiển thị mật khẩu trong popup
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State cho form đổi mật khẩu
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "0901234567",
    dob: "1990-05-15",
    gender: "Nam",
    job: "Kỹ sư phần mềm",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    password: "12345678",
  });

  const [tempData, setTempData] = useState(formData);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phoneNumber: "",
    bankNumber: "",
    bankName: "",
    dateOfBirth: "",
  });
  const [isOwner, setIsOwner] = useState(isBookOwner());

  useEffect(() => {
    const onAuthChanged = () => setIsOwner(isBookOwner());
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  const handleChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setFormData(tempData);
    setIsEditing(false);
  };

  const handleBecomeOwner = async () => {
    try {
      const res = await becomeOwner();
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: res?.message || "Đăng ký Book Owner thành công" } }));
      setIsOwner(true);
    } catch (err) {
      // Nếu lỗi do hồ sơ chưa hoàn chỉnh, mở form điền thông tin
      setShowCompleteProfile(true);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Vui lòng cập nhật thông tin cá nhân trước" } }));
    }
  };

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async () => {
    try {
      const payload = {
        phoneNumber: profileForm.phoneNumber,
        bankNumber: profileForm.bankNumber,
        bankName: profileForm.bankName,
      };
      if (profileForm.dateOfBirth) {
        payload.dateOfBirth = new Date(profileForm.dateOfBirth);
      }
      await upsertMyProfile(payload);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Cập nhật hồ sơ thành công" } }));
      setShowCompleteProfile(false);
      // Retry become owner after profile completion
      await handleBecomeOwner();
    } catch (error) {
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: error.message || "Cập nhật hồ sơ thất bại" } }));
    }
  };

  const handleCancel = () => {
    setTempData(formData);
    setIsEditing(false);
  };

  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setChangePasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (changePasswordError) {
      setChangePasswordError("");
    }
    
    // Update password strength for new password field
    if (name === "newPassword") {
      setPasswordStrength({
        hasMinLength: value.length >= 6,
        hasLetter: /[a-zA-Z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: false // No longer required
      });
    }
  };

  // Validation function for password strength
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }
    
    if (!/[a-zA-Z]/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 chữ cái");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Mật khẩu phải chứa ít nhất 1 chữ số");
    }
    
    return errors;
  };

  const handleChangePassword = async () => {
    // Validation
    if (!changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword) {
      setChangePasswordError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setChangePasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(changePasswordData.newPassword);
    if (passwordErrors.length > 0) {
      setChangePasswordError(passwordErrors.join(". "));
      return;
    }

    setIsChangingPassword(true);
    setChangePasswordError("");

    try {
      await changePassword(changePasswordData.currentPassword, changePasswordData.newPassword);
      
      // Reset form and close modal
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordStrength({
        hasMinLength: false,
        hasLetter: false,
        hasNumber: false,
        hasSpecialChar: false
      });
      setShowChangePasswordModal(false);
      
      // Show success message
      window.dispatchEvent(
        new CustomEvent("app:toast", { 
          detail: { type: "success", message: "Đổi mật khẩu thành công" } 
        })
      );
    } catch (error) {
      setChangePasswordError(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setChangePasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setChangePasswordError("");
    setPasswordStrength({
      hasMinLength: false,
      hasLetter: false,
      hasNumber: false,
      hasSpecialChar: false
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-white relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        {!isEditing ? (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors"
            >
              <i className="ri-edit-line mr-2"></i>
              Chỉnh sửa
            </button>
            {!isOwner && (
              <button
                onClick={handleBecomeOwner}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors"
              >
                <i className="ri-vip-crown-2-line mr-2"></i>
                Trở thành Book Owner
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto"
            >
              <i className="ri-check-line mr-2"></i>
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto"
            >
              <i className="ri-close-line mr-2"></i>
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Họ và tên", key: "fullName" },
          { label: "Email", key: "email" },
          { label: "Số điện thoại", key: "phone" },
          { label: "Ngày sinh", key: "dob", type: "date" },
          { label: "Giới tính", key: "gender" },
          { label: "Nghề nghiệp", key: "job" },
          { label: "Địa chỉ", key: "address", colSpan: true },
        ].map((field) => (
          <div key={field.key} className={field.colSpan ? "md:col-span-2" : ""}>
            <p className="text-gray-400">{field.label}</p>
            {isEditing ? (
              <input
                type={field.type || "text"}
                name={field.key}
                value={tempData[field.key]}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="font-medium">{formData[field.key]}</p>
            )}
          </div>
        ))}

        {/* Mật khẩu */}
        <div className="md:col-span-2">
          <p className="text-gray-400">Mật khẩu</p>
          <div className="mt-1 flex items-center bg-gray-700 rounded-lg px-3 py-2 w-1/2">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              readOnly
              className="bg-transparent flex-1 focus:outline-none text-white"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <i className={showPassword ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"}></i>
            </button>
            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="ml-3 text-orange-400 hover:text-orange-300"
              title="Đổi mật khẩu"
            >
              <i className="ri-key-2-line text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Popup đổi mật khẩu */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
            {/* Header */}
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              🔒 Đổi mật khẩu
            </h2>

            {/* Error message */}
            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {changePasswordError}
              </div>
            )}

            {/* Mật khẩu hiện tại */}
            <div className="relative mb-4">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={changePasswordData.currentPassword}
                onChange={handleChangePasswordInput}
                placeholder="Mật khẩu hiện tại"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                disabled={isChangingPassword}
              >
                <i className={showCurrent ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Mật khẩu mới */}
            <div className="relative mb-2">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={changePasswordData.newPassword}
                onChange={handleChangePasswordInput}
                placeholder="Mật khẩu mới"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                disabled={isChangingPassword}
              >
                <i className={showNew ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Password strength indicator */}
            {changePasswordData.newPassword && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300 mb-2">Yêu cầu mật khẩu:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <i className={`ri-${passwordStrength.hasMinLength ? 'check-line text-green-400' : 'close-line text-red-400'} mr-2`}></i>
                    <span className={passwordStrength.hasMinLength ? 'text-green-300' : 'text-gray-400'}>
                      Ít nhất 6 ký tự
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <i className={`ri-${passwordStrength.hasLetter ? 'check-line text-green-400' : 'close-line text-red-400'} mr-2`}></i>
                    <span className={passwordStrength.hasLetter ? 'text-green-300' : 'text-gray-400'}>
                      Chứa ít nhất 1 chữ cái
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <i className={`ri-${passwordStrength.hasNumber ? 'check-line text-green-400' : 'close-line text-red-400'} mr-2`}></i>
                    <span className={passwordStrength.hasNumber ? 'text-green-300' : 'text-gray-400'}>
                      Chứa ít nhất 1 chữ số
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Xác nhận mật khẩu */}
            <div className="relative mb-6">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={changePasswordData.confirmPassword}
                onChange={handleChangePasswordInput}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                disabled={isChangingPassword}
              >
                <i className={showConfirm ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseChangePasswordModal}
                className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg text-white 
                           transition transform hover:scale-105 disabled:opacity-50"
                disabled={isChangingPassword}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg text-white font-medium
                           transition transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Đang xử lý...
                  </>
                ) : (
                  "Lưu"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showCompleteProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg text-white">
            <h3 className="text-lg font-semibold mb-4">Hoàn thành hồ sơ để trở thành Book Owner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Số điện thoại</label>
                <input name="phoneNumber" value={profileForm.phoneNumber} onChange={handleProfileFieldChange} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Ngày sinh</label>
                <input type="date" name="dateOfBirth" value={profileForm.dateOfBirth} onChange={handleProfileFieldChange} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Số tài khoản</label>
                <input name="bankNumber" value={profileForm.bankNumber} onChange={handleProfileFieldChange} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Tên ngân hàng</label>
                <input name="bankName" value={profileForm.bankName} onChange={handleProfileFieldChange} className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowCompleteProfile(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Hủy</button>
              <button onClick={handleSubmitProfile} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Lưu và đăng ký Owner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
