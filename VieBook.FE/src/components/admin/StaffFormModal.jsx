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
    phoneNumber: '', // ✅ thêm phoneNumber
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
        phoneNumber: staff.phoneNumber || '', // ✅ thêm
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

    onSave(formData, staff?.userId || null, newAvatarFile);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-gray-800 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 sticky top-0 bg-white pt-3">
          {isEdit ? 'Cập nhật Staff' : 'Thêm Staff mới'}
        </h3>

        <div className="space-y-4">
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
              type="tel"
              required
              placeholder="0905123456"
              pattern="^(0[3|5|7|8|9])[0-9]{8}$"
              title="Số điện thoại phải bao gồm 10 só và bắt đầu 0[3|5|7|8|9]"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
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
              required
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
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

        <div className="flex justify-end space-x-2 mt-6">
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
