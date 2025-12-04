import React, { useEffect, useState } from "react";
import { changePassword, isBookOwner } from "../../api/authApi";
import { becomeOwner, upsertMyProfile, getCurrentUser } from "../../api/userApi";
import { uploadAvatar } from "../../api/uploadApi";
import { useUserStore } from "../../hooks/stores/userStore";
import OwnerApplicationStepper from "./OwnerApplicationStepper";
import { getSupportedBanks } from "../../api/vietQrApi";

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
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    avatarUrl: "",
    bankNumber: "",
    bankName: "",
    address: "",
    wallet: 0,
    isPhoneVerified: false,
    phoneVerifiedAt: null
  });

  const [tempData, setTempData] = useState(formData);
  const [showOwnerStepper, setShowOwnerStepper] = useState(false);
  const [initialProfile, setInitialProfile] = useState({});
  const [isOwner, setIsOwner] = useState(isBookOwner());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  
  // Get user store
  const { user, fetchUser, updateUserData } = useUserStore();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadBanks();
  }, []);

  useEffect(() => {
    const onAuthChanged = () => setIsOwner(isBookOwner());
    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  const loadBanks = async () => {
    try {
      setLoadingBanks(true);
      const bankList = await getSupportedBanks();
      setBanks(bankList);
    } catch (err) {
      console.error("Error loading banks:", err);
    } finally {
      setLoadingBanks(false);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Try to use store data first, fallback to fetch if not available
      let userData = user;
      if (!userData) {
        userData = await fetchUser();
      }
      console.log("User data received:", userData); // Debug log
      const profileData = {
        fullName: userData.userProfile?.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.userProfile?.phoneNumber || "",
        dateOfBirth: userData.userProfile?.dateOfBirth ? 
          new Date(userData.userProfile.dateOfBirth).toISOString().split('T')[0] : "",
        avatarUrl: userData.userProfile?.avatarUrl || "",
        bankNumber: userData.userProfile?.bankNumber || "",
        bankName: userData.userProfile?.bankName || "",
        address: userData.userProfile?.address || "",
        wallet: userData.wallet || 0,
        isPhoneVerified: userData.userProfile?.isPhoneVerified || false,
        phoneVerifiedAt: userData.userProfile?.phoneVerifiedAt
      };
      console.log("Profile data mapped:", profileData); // Debug log
      setFormData(profileData);
      setTempData(profileData);
    } catch (error) {
      console.error("Error loading user data:", error);
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "error", message: "Không thể tải thông tin người dùng" } 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempData({ 
      ...tempData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "error", message: "Vui lòng chọn file ảnh" } 
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "error", message: "Kích thước file không được vượt quá 5MB" } 
      }));
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadAvatar(file);
      setTempData({ ...tempData, avatarUrl: result.imageUrl });
      
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "success", message: "Upload avatar thành công" } 
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "error", message: error.message || "Upload avatar thất bại" } 
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validation
      const errors = {};
      
      if (!tempData.fullName.trim()) {
        errors.fullName = "Vui lòng nhập họ và tên";
      }
      
      // Ne pas valider phoneNumber si l'utilisateur est bookOwner (ne peut pas le modifier)
      if (!isOwner) {
        if (!tempData.phoneNumber.trim()) {
          errors.phoneNumber = "Vui lòng nhập số điện thoại";
        } else {
          // Validate phone number format
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(tempData.phoneNumber.replace(/\s/g, ''))) {
            errors.phoneNumber = "Số điện thoại phải có 10-11 chữ số";
          }
        }
      }

      // Validate date of birth - không cho phép chọn ngày sinh ở tương lai
      if (tempData.dateOfBirth) {
        const selectedDate = new Date(tempData.dateOfBirth);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        if (selectedDate > today) {
          errors.dateOfBirth = "Không thể chọn ngày sinh ở tương lai";
        }
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      const updateData = {
        fullName: tempData.fullName,
        // Ne pas mettre à jour phoneNumber si l'utilisateur est bookOwner
        phoneNumber: isOwner ? undefined : tempData.phoneNumber,
        dateOfBirth: tempData.dateOfBirth ? new Date(tempData.dateOfBirth) : null,
        avatarUrl: tempData.avatarUrl,
        bankNumber: tempData.bankNumber,
        bankName: tempData.bankName,
        address: tempData.address
      };
      
      await upsertMyProfile(updateData);
      
      // Force reload data from server to ensure consistency and notify other components
      // First update the store, then reload component data from store
      const updatedUser = await updateUserData();
      
      // Use the updated user data directly instead of calling loadUserData which might use cached data
      if (updatedUser) {
        const profileData = {
          fullName: updatedUser.userProfile?.fullName || "",
          email: updatedUser.email || "",
          phoneNumber: updatedUser.userProfile?.phoneNumber || "",
          dateOfBirth: updatedUser.userProfile?.dateOfBirth ? 
            new Date(updatedUser.userProfile.dateOfBirth).toISOString().split('T')[0] : "",
          avatarUrl: updatedUser.userProfile?.avatarUrl || "",
          bankNumber: updatedUser.userProfile?.bankNumber || "",
          bankName: updatedUser.userProfile?.bankName || "",
          address: updatedUser.userProfile?.address || "",
          wallet: updatedUser.wallet || 0,
          isPhoneVerified: updatedUser.userProfile?.isPhoneVerified || false,
          phoneVerifiedAt: updatedUser.userProfile?.phoneVerifiedAt
        };
        setFormData(profileData);
        setTempData(profileData);
      } else {
        // Fallback: reload from store
        await loadUserData();
      }
      
      setIsEditing(false);
      
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "success", message: "Cập nhật thông tin thành công" } 
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent("app:toast", { 
        detail: { type: "error", message: error.message || "Cập nhật thất bại" } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeOwner = async () => {
    try {
      const res = await becomeOwner();
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: res?.message || "Đăng ký Book Owner thành công" } }));
      setIsOwner(true);
    } catch (err) {
      // Nếu lỗi do hồ sơ chưa hoàn chỉnh, mở Stepper đăng ký Owner
      setInitialProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      });
      setShowOwnerStepper(true);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Vui lòng cập nhật thông tin cá nhân trước" } }));
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

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-3">Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-white relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        {!isEditing ? (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsEditing(true);
                setValidationErrors({});
              }}
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
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto disabled:opacity-50"
            >
              {saving ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="ri-check-line mr-2"></i>
                  Lưu
                </>
              )}
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

      {/* Avatar Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            {tempData.avatarUrl ? (
              <img 
                src={tempData.avatarUrl} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center border-2 border-orange-500">
                <i className="ri-user-line text-2xl text-gray-400"></i>
              </div>
            )}
            {isEditing && (
              <div className="absolute -bottom-1 -right-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 transition-colors cursor-pointer ${
                    uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Thay đổi avatar"
                >
                  {uploadingAvatar ? (
                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                  ) : (
                    <i className="ri-camera-line text-sm"></i>
                  )}
                </label>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{formData.fullName || "Chưa cập nhật"}</h3>
            <p className="text-gray-400">{formData.email}</p>
            {formData.isPhoneVerified && (
              <div className="flex items-center gap-1 text-green-400 text-sm mt-1">
                <i className="ri-phone-line"></i>
                <span>Đã xác thực số điện thoại</span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Họ và tên", key: "fullName", required: true },
          { label: "Email", key: "email", readOnly: true },
          { label: "Số điện thoại", key: "phoneNumber", required: true, readOnlyIfOwner: true },
          { label: "Ngày sinh", key: "dateOfBirth", type: "date" },
          { label: "Số tài khoản ngân hàng", key: "bankNumber" },
          { label: "Tên ngân hàng", key: "bankName", isSelect: true },
          { label: "Địa chỉ", key: "address", type: "textarea", colSpan: true },
        ].map((field) => (
          <div key={field.key} className={field.colSpan ? "md:col-span-2" : ""}>
            <p className="text-gray-400 flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-red-400">*</span>}
            </p>
            {isEditing ? (
              <div>
                {field.key === 'address' && console.log('Address field in editing mode:', tempData[field.key])}
                {field.type === "textarea" ? (
                  <textarea
                    name={field.key}
                    value={tempData[field.key]}
                    onChange={handleChange}
                    rows={3}
                    className={`mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 resize-none ${
                      validationErrors[field.key] ? 'ring-red-500 border-red-500' : 'focus:ring-orange-500'
                    }`}
                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                  />
                ) : field.isSelect && field.key === "bankName" ? (
                  <div>
                    {loadingBanks ? (
                      <div className="mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-gray-400 text-sm">
                        Đang tải danh sách ngân hàng...
                      </div>
                    ) : (
                      <select
                        name={field.key}
                        value={tempData[field.key] || ""}
                        onChange={handleChange}
                        className={`mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                          validationErrors[field.key] ? 'ring-red-500 border-red-500' : 'focus:ring-orange-500'
                        }`}
                      >
                        <option value="">-- Chọn ngân hàng --</option>
                        {banks.map((bank) => (
                          <option key={bank.acqId} value={bank.name || bank.shortName}>
                            {bank.name || bank.shortName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.key}
                    value={tempData[field.key]}
                    onChange={handleChange}
                    readOnly={field.readOnly || (field.readOnlyIfOwner && isOwner)}
                    max={field.type === "date" ? new Date().toISOString().split('T')[0] : undefined}
                    className={`mt-1 w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                      validationErrors[field.key] ? 'ring-red-500 border-red-500' : 'focus:ring-orange-500'
                    } ${(field.readOnly || (field.readOnlyIfOwner && isOwner)) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder={field.key === "phoneNumber" ? "Nhập số điện thoại (10-11 chữ số)" : `Nhập ${field.label.toLowerCase()}`}
                    pattern={field.key === "phoneNumber" ? "[0-9]{10,11}" : undefined}
                  />
                )}
                {validationErrors[field.key] && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    {validationErrors[field.key]}
                  </p>
                )}
              </div>
            ) : (
              <p className="font-medium">
                {field.key === 'address' && console.log('Address field value:', formData[field.key])}
                {formData[field.key] || <span className="text-gray-500 italic">Chưa cập nhật</span>}
              </p>
            )}
          </div>
        ))}


        {/* Profile Completion Status */}
        {!isEditing && (
          <div className="md:col-span-2">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Trạng thái hồ sơ</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${formData.fullName ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={formData.fullName ? 'text-green-300' : 'text-red-300'}>
                  {formData.fullName ? 'Họ tên đã cập nhật' : 'Chưa cập nhật họ tên'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <div className={`w-2 h-2 rounded-full ${formData.phoneNumber ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className={formData.phoneNumber ? 'text-green-300' : 'text-red-300'}>
                  {formData.phoneNumber ? 'Số điện thoại đã cập nhật' : 'Chưa cập nhật số điện thoại'}
                </span>
              </div>
              {formData.isPhoneVerified && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-green-300">Số điện thoại đã xác thực</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Password Section */}
        <div className="md:col-span-2">
          <p className="text-gray-400">Mật khẩu</p>
          <div className="mt-1 flex items-center bg-gray-700 rounded-lg px-3 py-2 w-1/2">
            <input
              type="password"
              value="••••••••"
              readOnly
              className="bg-transparent flex-1 focus:outline-none text-white"
            />
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
      {showOwnerStepper && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <OwnerApplicationStepper
            initialProfile={initialProfile}
            onClose={() => setShowOwnerStepper(false)}
            onSuccess={() => {
              setShowOwnerStepper(false);
              setIsOwner(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
