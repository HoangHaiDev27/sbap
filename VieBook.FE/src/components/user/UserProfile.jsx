import React, { useState } from "react";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    phone: "0901234567",
    dob: "1990-05-15",
    gender: "Nam",
    job: "Kỹ sư phần mềm",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
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
    setTempData(formData); // khôi phục dữ liệu cũ
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 text-white">
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
      </div>

      {/* Security */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Bảo mật tài khoản</h3>
        <div className="flex items-center justify-between">
          <span>
            <p className="font-medium">Thông báo email</p>
            <p className="text-gray-400 text-sm">Nhận thông báo qua email</p>
          </span>
          <label className="inline-flex items-center cursor-pointer ml-4">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
