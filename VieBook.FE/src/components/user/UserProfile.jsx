import React, { useState } from "react";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // State toggle hiển thị mật khẩu trong popup
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleChange = (e) => {
    setTempData({ ...tempData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setFormData(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-white relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors w-full sm:w-auto"
          >
            <i className="ri-edit-line mr-2"></i>
            Chỉnh sửa
          </button>
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

            {/* Mật khẩu hiện tại */}
            <div className="relative mb-4">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Mật khẩu hiện tại"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <i className={showCurrent ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Mật khẩu mới */}
            <div className="relative mb-4">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mật khẩu mới"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <i className={showNew ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="relative mb-6">
              <i className="ri-lock-password-line absolute left-3 top-2.5 text-gray-400"></i>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-700 text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500 
                           transition-colors hover:bg-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                <i className={showConfirm ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="bg-gray-600 hover:bg-gray-700 px-5 py-2 rounded-lg text-white 
                           transition transform hover:scale-105"
              >
                Hủy
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg text-white font-medium
                           transition transform hover:scale-105 shadow-md"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
