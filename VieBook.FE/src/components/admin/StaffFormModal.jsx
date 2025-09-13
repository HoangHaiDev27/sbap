'use client';
import { useState, useEffect } from 'react';

export default function StaffFormModal({ staff, onSave, onCancel }) {
  const isEdit = !!staff;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active',
  });

  useEffect(() => {
    if (isEdit) {
      setFormData({
        name: staff.name,
        email: staff.email,
        password: '',
        role: staff.role,
        status: staff.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        status: 'active',
      });
    }
  }, [staff]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      return alert('Vui lòng nhập đầy đủ thông tin');
    }
    if (!isEdit && !formData.password) {
      return alert('Vui lòng nhập mật khẩu cho tài khoản mới');
    }
    onSave(formData, staff?.id || null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
          {isEdit ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
        </h3>

        <div className="space-y-4">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Tên đầy đủ"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
          />
          {!isEdit && (
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mật khẩu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          )}
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="staff">Nhân viên</option>
            <option value="moderator">Điều hành</option>
            <option value="manager">Quản lý</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
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
