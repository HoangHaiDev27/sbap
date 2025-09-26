import React, { useState, useEffect } from "react";
import { getAdminById, updateAdmin, uploadAvatarImage, removeOldAvatarImage } from "../../api/adminApi";
import { changePassword } from "../../api/authApi";

export default function AdminProfile() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const defaultAvatar = "https://img5.thuthuatphanmem.vn/uploads/2021/11/22/anh-gau-nau_092901233.jpg";

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  const [adminInfo, setAdminInfo] = useState({
    id: null,
    fullName: "",
    email: "",
    phone: "",
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

  // Lấy adminId từ localStorage và fetch thông tin admin
  useEffect(() => {
    const authUserStr = localStorage.getItem("auth_user");
    if (!authUserStr) return;

    try {
      const authUser = JSON.parse(authUserStr);
      const adminId = authUser.userId;
      const fetchAdmin = async () => {
        try {
          const data = await getAdminById(adminId);
          setAdminInfo({
            id: adminId,
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phoneNumber || "",
            address: data.address || "",
            avatarUrl: data.avatarUrl || "",
          });
          setAvatarUrl(data.avatarUrl || defaultAvatar);
        } catch (err) {
          console.error("Lấy thông tin admin lỗi:", err);
        }
      };
      fetchAdmin();
    } catch (err) {
      console.error("Parse auth_user lỗi:", err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      let uploadedAvatarUrl = adminInfo.avatarUrl;

      // Upload avatar nếu có file mới
      if (avatarFile) {
        // Xóa avatar cũ nếu tồn tại
        if (adminInfo.avatarUrl) {
          await removeOldAvatarImage(adminInfo.avatarUrl);
        }

        const formData = new FormData();
        formData.append("file", avatarFile);
        uploadedAvatarUrl = await uploadAvatarImage(formData);
      }

      const updatedData = {
        fullName: adminInfo.fullName || "",
        email: adminInfo.email || "",
        phoneNumber: adminInfo.phone || "",
        address: adminInfo.address || "Chưa có địa chỉ",
        avatarUrl: uploadedAvatarUrl || defaultAvatar,
      };

      const res = await updateAdmin(adminInfo.id, updatedData);

      setAdminInfo((prev) => ({
        ...prev,
        fullName: res.data.fullName || updatedData.fullName,
        email: res.data.email || updatedData.email,
        phone: res.data.phoneNumber || updatedData.phoneNumber,
        address: res.data.address || updatedData.address,
        avatarUrl: uploadedAvatarUrl,
      }));
      setAvatarUrl(uploadedAvatarUrl || defaultAvatar);
      setAvatarFile(null);
      setShowEditModal(false);

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Cập nhật thông tin thành công" },
        })
      );
    } catch (error) {
      console.error("Update admin error:", error.message);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: error.message || "Cập nhật thất bại" },
        })
      );
    }
  };

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
    <div className="pt-24 p-6 bg-gray-50 min-h-screen relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Thông tin cá nhân</h2>
      <p className="text-gray-500 mb-6">Quản lý thông tin tài khoản và cài đặt bảo mật</p>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h3>
          <div className="flex gap-2">
            <button
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              onClick={() => setShowEditModal(true)}
            >
              ✏️ Chỉnh sửa
            </button>
            <button
              className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              onClick={() => setShowChangePassModal(true)}
            >
              🔒 Đổi mật khẩu
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{adminInfo.fullName || "Chưa có tên"}</h4>
            <p className="text-gray-500 text-sm">Quản trị viên hệ thống</p>
            <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 font-medium">Họ và tên *</p>
            <p className="text-base text-gray-800">{adminInfo.fullName || "Chưa có"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Email *</p>
            <p className="text-base text-gray-800">{adminInfo.email || "Chưa có"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Số điện thoại</p>
            <p className="text-base text-gray-800">{adminInfo.phone || "Chưa có"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Địa chỉ</p>
            <p className="text-base text-gray-800">{adminInfo.address || "155 Nguyễn Khuyến"}</p>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative text-gray-800">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <label
                    htmlFor="avatarUpload"
                    className="bg-gray-700 text-white px-3 py-1 rounded cursor-pointer hover:bg-gray-600"
                  >
                    Chọn ảnh
                  </label>
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) setAvatarFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              {["fullName", "email", "phone", "address"].map((key) => (
                <div key={key}>
                  <label className="text-sm font-medium">
                    {key === "fullName" ? "Họ và tên" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    name={key}
                    value={adminInfo[key] || ""}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border rounded"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {showChangePassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative text-gray-800">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>

            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{changePasswordError}</div>
            )}

            {["currentPassword", "newPassword", "confirmPassword"].map((key) => {
              const placeholder =
                key === "currentPassword"
                  ? "Mật khẩu hiện tại"
                  : key === "newPassword"
                  ? "Mật khẩu mới"
                  : "Xác nhận mật khẩu mới";
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
                <div key={key} className="relative mb-4">
                  <input
                    type={show ? "text" : "password"}
                    name={key}
                    value={passwords[key]}
                    placeholder={placeholder}
                    onChange={handleChangePasswordInput}
                    className="w-full px-3 py-2 border rounded"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow((prev) => !prev)}
                    className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                  >
                    {show ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
              );
            })}

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowChangePassModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                disabled={isChangingPassword}
              >
                Hủy
              </button>
              <button
                onClick={handleChangePass}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang xử lý..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
