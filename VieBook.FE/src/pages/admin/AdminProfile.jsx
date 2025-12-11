import React, { useState, useEffect } from "react";
import { getAdminById, updateAdmin } from "../../api/adminApi";
import { changePassword } from "../../api/authApi";
import { useAdminStore } from "../../hooks/stores/useAdminStore";

export default function AdminProfile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { updateAdmin: updateAdminStore } = useAdminStore(); // ✅ store

  const defaultAvatar =
    "https://res.cloudinary.com/dwduk4vjl/image/upload/v1759596363/avatarImages/lb7harseupgw3uwprpjc.jpg";

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  const [adminInfo, setAdminInfo] = useState({
    id: null,
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatarUrl: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");

  // ✅ Lấy admin info
  useEffect(() => {
    const authUserStr = localStorage.getItem("auth_user");
    if (!authUserStr) return;

    try {
      const authUser = JSON.parse(authUserStr);
      const adminId = authUser.userId;

      const fetchAdminInfo = async () => {
        try {
          const data = await getAdminById(adminId);
          const newAdminInfo = {
            id: adminId,
            fullName: data.fullName || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            avatarUrl: data.avatarUrl || defaultAvatar,
          };
          setAdminInfo(newAdminInfo);
          setAvatarUrl(newAdminInfo.avatarUrl);
          
          // ✅ Cập nhật Zustand store để Header/Footer tự re-render
          updateAdminStore(newAdminInfo);

        } catch (err) {
          console.error("Lấy thông tin admin lỗi:", err);
        }
      };
      fetchAdminInfo();
    } catch (err) {
      console.error("Parse auth_user lỗi:", err);
    }
  }, [updateAdminStore]);

  // ✅ Xử lý lưu thông tin admin
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("FullName", adminInfo.fullName);
      formData.append("Email", adminInfo.email);
      formData.append("PhoneNumber", adminInfo.phoneNumber);
      formData.append("Address", adminInfo.address);

      if (avatarFile) formData.append("avatarFile", avatarFile);

      const res = await updateAdmin(adminInfo.id, formData);
      const updated = res.data;

      const newAdmin = {
        ...adminInfo,
        ...updated,
        avatarUrl: updated.avatarUrl || avatarUrl,
      };

      setAdminInfo(newAdmin);
      setAvatarUrl(newAdmin.avatarUrl);
      setShowEditModal(false);
      setAvatarFile(null);

      updateAdminStore(newAdmin);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Cập nhật thông tin thành công" },
        })
      );
    } catch (error) {
      console.error(error);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: error.message || "Cập nhật thất bại" },
        })
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminInfo((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Đổi mật khẩu
  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (changePasswordError) setChangePasswordError("");
  };

  const handleChangePass = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setChangePasswordError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setChangePasswordError("Mật khẩu mới và xác nhận không khớp");
      return;
    }
    if (passwords.newPassword.length < 6) {
      setChangePasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    const strongPassRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!strongPassRegex.test(passwords.newPassword)) {
      setChangePasswordError(
        "Mật khẩu phải có ít nhất 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 số"
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassModal(false);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Đổi mật khẩu thành công" },
        })
      );
    } catch (error) {
      setChangePasswordError(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="pt-20 sm:pt-24 px-4 sm:px-6 pb-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen relative">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h2>
        <p className="text-sm sm:text-base text-gray-600">Quản lý thông tin tài khoản và cài đặt bảo mật</p>
      </div>

      {/* Thông tin cơ bản */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Thông tin cơ bản</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                onClick={() => setShowEditModal(true)}
              >
                <span>✏️</span>
                <span>Chỉnh sửa</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 active:bg-green-800 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px]"
                onClick={() => setShowChangePassModal(true)}
              >
                <span>🔒</span>
                <span>Đổi mật khẩu</span>
              </button>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 border-b border-gray-200">
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {adminInfo.fullName || "Chưa có tên"}
              </h4>
              <p className="text-gray-600 text-sm sm:text-base mb-2">Quản trị viên hệ thống</p>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-100 to-red-50 text-red-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-red-200">
                <span>👑</span>
                <span>Admin</span>
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Họ và tên</p>
              <p className="text-base sm:text-lg text-gray-900 font-semibold break-words">{adminInfo.fullName || "Chưa có"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Email</p>
              <p className="text-base sm:text-lg text-gray-900 font-semibold break-words">{adminInfo.email || "support@wewe.vn"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Số điện thoại</p>
              <p className="text-base sm:text-lg text-gray-900 font-semibold break-words">{adminInfo.phoneNumber || "0345 510 055"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors sm:col-span-2">
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-1.5 uppercase tracking-wide">Địa chỉ</p>
              <p className="text-base sm:text-lg text-gray-900 font-semibold break-words">
                {adminInfo.address || "FPT University, Da Nang"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả công việc Admin */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Mô tả công việc của Quản trị viên</span>
          </h3>
          <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
            Với vai trò là <strong className="text-gray-900">Quản trị viên (Admin)</strong>, tôi có quyền và trách nhiệm quản lý toàn bộ hệ thống. 
            Dưới đây là những nhiệm vụ chính:
          </p>
          <ul className="list-none space-y-3 mb-6">
            {[
              "Quản lý và phân quyền người dùng trong hệ thống.",
              "Theo dõi hoạt động của Nhân viên, Chủ sách và Khách hàng.",
              "Quản lý tin tức, bài viết và các thông báo quan trọng.",
              "Đảm bảo tính bảo mật và an toàn dữ liệu.",
              "Thiết lập và duy trì các cài đặt hệ thống.",
              "Kiểm tra và xử lý các sự cố liên quan đến hệ thống."
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </span>
                <span className="flex-1 pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm sm:text-base text-blue-900 leading-relaxed">
              <span className="text-xl mr-2">💡</span>
              <strong>Lời khuyên:</strong> Luôn theo dõi thông báo và báo cáo thường xuyên để
              kịp thời phát hiện các vấn đề trong hệ thống.
            </p>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative text-gray-800 
                    max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                    animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Chỉnh sửa thông tin</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5">
              {/* Avatar Upload */}
              <div className="pb-5 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Ảnh đại diện
                </label>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar Preview */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Upload Area */}
                  <div className="flex-1 w-full">
                    <label
                      htmlFor="avatarUpload"
                      className="flex flex-col items-start justify-center w-full border border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-full p-4">
                        <div className="flex items-center gap-3">
                          <svg
                            className="w-5 h-5 text-gray-500 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {avatarFile ? "Thay đổi ảnh đại diện" : "Chọn ảnh đại diện"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {avatarFile 
                                ? "Nhấp để chọn ảnh khác" 
                                : "JPG, PNG hoặc GIF (tối đa 5MB)"
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <input
                        type="file"
                        id="avatarUpload"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            const file = e.target.files[0];
                            // Validate file size (5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              window.dispatchEvent(
                                new CustomEvent("app:toast", {
                                  detail: { 
                                    type: "error", 
                                    message: "Kích thước ảnh không được vượt quá 5MB" 
                                  },
                                })
                              );
                              return;
                            }
                            setAvatarFile(file);
                          }
                        }}
                      />
                    </label>

                    {/* File Info */}
                    {avatarFile && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {avatarFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAvatarFile(null)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                            aria-label="Xóa ảnh đã chọn"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Helper Text */}
                    {!avatarFile && (
                      <p className="mt-2 text-xs text-gray-500">
                        Khuyến nghị: ảnh vuông, tối thiểu 400x400px
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              {["fullName", "email", "phoneNumber", "address"].map((key) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  {key === "fullName"
                    ? <>Họ và tên <span className="text-red-500">*</span></>
                    : key === "email"
                    ? <>Email</>
                    : key === "phoneNumber"
                    ? <>Số điện thoại <span className="text-red-500">*</span></>
                    : <>Địa chỉ <span className="text-red-500">*</span></>}
                </label>

                <input
                  type={
                    key === "email"
                      ? "email"
                      : key === "phoneNumber"
                      ? "tel"
                      : "text"
                  }
                  name={key}
                  value={adminInfo[key] || ""}
                  onChange={handleChange}
                  disabled={key === "email"}
                  required={["fullName", "phoneNumber", "address"].includes(key)}
                  pattern={key === "phoneNumber" ? "^0\\d{8,10}$" : undefined}
                  title={
                    key === "phoneNumber"
                      ? "Số điện thoại phải bắt đầu bằng 0 và có từ 9 - 11 số"
                      : undefined
                  }
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                    key === "email" 
                      ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-600" 
                      : "bg-white border-gray-300 hover:border-gray-400 focus:shadow-md"
                  }`}
                  placeholder={
                    key === "fullName"
                      ? "Nhập họ và tên"
                      : key === "phoneNumber"
                      ? "0905123456"
                      : key === "address"
                      ? "Nhập địa chỉ"
                      : ""
                  }
                />
              </div>
            ))}

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-5 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium transition-all duration-200 min-h-[44px] text-base"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 font-medium transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] text-base"
                >
                  💾 Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {showChangePassModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowChangePassModal(false);
          }}
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative text-gray-800
                    animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🔒</span>
                <span>Đổi mật khẩu</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
                disabled={isChangingPassword}
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {changePasswordError && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-in slide-in-from-top duration-200">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <p className="text-sm sm:text-base text-red-700 font-medium">{changePasswordError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {["currentPassword", "newPassword", "confirmPassword"].map((key) => {
                  const label =
                    key === "currentPassword"
                      ? "Mật khẩu hiện tại"
                      : key === "newPassword"
                      ? "Mật khẩu mới"
                      : "Xác nhận mật khẩu mới";
                  const placeholder =
                    key === "currentPassword"
                      ? "Nhập mật khẩu hiện tại"
                      : key === "newPassword"
                      ? "Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      : "Nhập lại mật khẩu mới";
                  const show =
                    key === "currentPassword"
                      ? showCurrent
                      : key === "newPassword"
                      ? showNew
                      : showConfirm;
                  const toggleShow =
                    key === "currentPassword"
                      ? setShowCurrent
                      : key === "newPassword"
                      ? setShowNew
                      : setShowConfirm;

                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">
                        {label} {key !== "currentPassword" && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          type={show ? "text" : "password"}
                          name={key}
                          value={passwords[key]}
                          placeholder={placeholder}
                          onChange={handleChangePasswordInput}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 focus:shadow-md text-base min-h-[44px]"
                          disabled={isChangingPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                          disabled={isChangingPassword}
                          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          <span className="text-lg">{show ? "👁️" : "👁️‍🗨️"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>💡 Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 số.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="w-full sm:w-auto px-5 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium transition-all duration-200 min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isChangingPassword}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleChangePass}
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 font-medium transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Lưu mật khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}