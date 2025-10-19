'use client';
import { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function StaffFormModal({ staff, onSave, onCancel }) {
  const isEdit = !!staff;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    newPassword: '',
    avatarUrl: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '', 
  });

  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        fullName: staff.fullName || '',
        email: staff.email || '',
        password: '',
        newPassword: '',
        avatarUrl: staff.avatarUrl || '',
        dateOfBirth: formatDate(staff.dateOfBirth),
        phoneNumber: staff.phoneNumber || '', 
        address: staff.address || '',
      });
      setPreviewAvatar(staff.avatarUrl || '');
    } else {
      setFormData({
        fullName: '',
        email: '',
        password: '',
        newPassword: '',
        avatarUrl: '',
        dateOfBirth: '',
        phoneNumber: '',
        address: '',
      });
      setPreviewAvatar('');
    }
    setNewAvatarFile(null);
    setShowPassword(false);
  }, [staff]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim()) {
      return alert('Vui lòng nhập đầy đủ họ tên và email');
    }
    if (!isEdit && !formData.password.trim()) {
      return alert('Vui lòng nhập mật khẩu cho tài khoản mới');
    }
    if (!formData.dateOfBirth) {
      return alert('Vui lòng chọn ngày sinh');
    }
      const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return alert('Nhân viên phải từ 18 tuổi trở lên');
    }

     const phoneRegex = /^0\d{8,10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      return alert('Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và có từ 9 đến 11 số)');
    }

    onSave(formData, staff?.userId || null, newAvatarFile);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl text-gray-800 flex flex-col max-h-[90vh]"
      >
        {/* Header cố định */}
        <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Cập nhật Staff' : 'Thêm Staff mới'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          {/* Họ và tên */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="a@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ✅ Số điện thoại */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            required
            placeholder="0905123456"
            pattern="^0\d{8,10}$"
            title="Số điện thoại phải bắt đầu từ 0 và có 9-11 số"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
           <input
            type="date"
            name="dateOfBirth"
            required
            value={formData.dateOfBirth}
            min="1700-01-01"
            max={new Date(
              new Date().setFullYear(new Date().getFullYear() - 18)
            ).toISOString().split('T')[0]}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
            onInvalid={(e) => {
              const target = e.target;
              // Nếu rỗng thì dùng message mặc định của HTML5
              if (target.validity.valueMissing) {
                target.setCustomValidity('');
              }
              // Nếu chọn ngày nhưng chưa đủ 18 tuổi
              else if (target.validity.rangeOverflow) {
                target.setCustomValidity('Nhân viên phải từ 18 tuổi trở lên');
              }
              // Các lỗi khác
              else {
                target.setCustomValidity('');
              }
            }}
            onInput={(e) => e.target.setCustomValidity('')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          </div>
          <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Địa chỉ  <span className="text-red-500">*</span> 
          </label>
          <input
            type="text"
            required 
            placeholder={isEdit ? "Địa chỉ không được để trống" : "Nhập địa chỉ"}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

          {/* Mật khẩu */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {isEdit ? 'Mật khẩu mới (nếu muốn)' : 'Mật khẩu'}{' '}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? 'Nhập mật khẩu mới' : 'Nhập mật khẩu'}
                value={isEdit ? formData.newPassword : formData.password}
                onChange={(e) =>
                  isEdit
                    ? setFormData({ ...formData, newPassword: e.target.value })
                    : setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 pr-10"
                {...(!isEdit ? { required: true } : {})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mt-2">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Ảnh đại diện
            </label>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-400 transition-all">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl">
                  <span>+</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click vào avatar để thay đổi
            </p>
          </div>
        </div>

        <div className="border-t p-4 bg-white sticky bottom-0 rounded-b-2xl flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
    </div>
  );
}
