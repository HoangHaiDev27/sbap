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
    <div className="pt-24 p-6 bg-gray-50 min-h-screen relative">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Thông tin cá nhân</h2>
      <p className="text-gray-500 mb-6">Quản lý thông tin tài khoản và cài đặt bảo mật</p>

      {/* Thông tin cơ bản */}
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
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
            <h4 className="text-lg font-semibold text-gray-900">
              {adminInfo.fullName || "Chưa có tên"}
            </h4>
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
            <p className="text-base text-gray-800">{adminInfo.email || "support@wewe.vn"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Số điện thoại</p>
            <p className="text-base text-gray-800">{adminInfo.phoneNumber || "0345 510 055"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Địa chỉ</p>
            <p className="text-base text-gray-800">
              {adminInfo.address || "FPT University, Da Nang"}
            </p>
          </div>
        </div>
      </div>
        {/* Mô tả công việc Admin */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📝 Mô tả công việc của Quản trị viên
        </h3>
        <p className="text-gray-700 mb-4">
          Với vai trò là <strong>Quản trị viên (Admin)</strong>, tôi có quyền và trách nhiệm quản lý toàn bộ hệ thống. 
          Dưới đây là những nhiệm vụ chính:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Quản lý và phân quyền người dùng trong hệ thống.</li>
          <li>Theo dõi hoạt động của Staff, BookOwner và Customer.</li>
          <li>Quản lý tin tức, bài viết và các thông báo quan trọng.</li>
          <li>Đảm bảo tính bảo mật và an toàn dữ liệu.</li>
          <li>Thiết lập và duy trì các cài đặt hệ thống.</li>
          <li>Kiểm tra và xử lý các sự cố liên quan đến hệ thống.</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            💡 <strong>Lời khuyên:</strong> Luôn theo dõi thông báo và báo cáo thường xuyên để
            kịp thời phát hiện các vấn đề trong hệ thống.
          </p>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative text-gray-800">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa thông tin</h3>

            <form onSubmit={handleSave} className="space-y-4">
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

              {["fullName", "email", "phoneNumber", "address"].map((key) => (
              <div key={key}>
                <label className="text-sm font-medium">
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
                  className={`mt-1 w-full px-3 py-2 border rounded ${
                    key === "email" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder={
                    key === "fullName"
                      ? "Nhập họ và tên"
                      : key === "phoneNumber"
                      ? "0905123456"
                      : ""
                  }
                />
              </div>
            ))}

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal đổi mật khẩu */}
      {showChangePassModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative text-gray-800">
            <h3 className="text-lg font-semibold mb-4">Đổi mật khẩu</h3>

            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {changePasswordError}
              </div>
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