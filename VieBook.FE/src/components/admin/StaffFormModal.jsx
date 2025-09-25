'use client';
import { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export default function StaffFormModal({ staff, onSave, onCancel }) {
  const isEdit = !!staff;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',      // dùng khi thêm
    newPassword: '',   // dùng khi edit
    avatarUrl: '',
    dateOfBirth: '',   // ngày sinh
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
        dateOfBirth: staff.dateOfBirth || '',
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

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email) {
      return alert('Vui lòng nhập đầy đủ họ tên và email');
    }
    if (!isEdit && !formData.password) {
      return alert('Vui lòng nhập mật khẩu cho tài khoản mới');
    }
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        return alert('Ngày sinh không hợp lệ');
      }
    }
    onSave(formData, staff?.userId || null, newAvatarFile);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          {isEdit ? 'Cập nhật Staff' : 'Thêm Staff mới'}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="Ngày sinh"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isEdit ? 'Nhập mật khẩu mới (nếu muốn)' : 'Mật khẩu'}
              value={isEdit ? formData.newPassword : formData.password}
              onChange={(e) =>
                isEdit
                  ? setFormData({ ...formData, newPassword: e.target.value })
                  : setFormData({ ...formData, password: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mt-2">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 hover:border-blue-400 transition-all">
              {previewAvatar ? (
                <img src={previewAvatar} alt="avatar preview" className="w-full h-full object-cover" />
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
            <p className="mt-2 text-sm text-gray-500">Click vào avatar để thay đổi</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
