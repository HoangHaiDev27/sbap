'use client';
import React, { useState, useEffect } from 'react';

interface StaffFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
}
interface StaffAddEditModalProps {
  open: boolean;
  editingStaff?: any;
  onSave: (data: StaffFormData) => void;
  onClose: () => void;
}

export default function StaffAddEditModal({
  open, editingStaff, onSave, onClose
}: StaffAddEditModalProps) {

  const [formData, setFormData] = useState<StaffFormData>({
    name: '', email: '', password: '', role: 'staff', status: 'active'
  });

  useEffect(() => {
    if (editingStaff) {
      setFormData({ ...editingStaff, password: '' });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'staff', status: 'active' });
    }
  }, [editingStaff, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    if (!editingStaff && !formData.password) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
         onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
           onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4">
          {editingStaff ? 'Chỉnh sửa Staff' : 'Thêm Staff mới'}
        </h3>
        <div className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Tên đầy đủ"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          {!editingStaff &&
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />}
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="staff">Nhân viên</option>
            <option value="moderator">Điều hành</option>
            <option value="manager">Quản lý</option>
            <option value="admin">Quản trị viên</option>
          </select>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
            Hủy
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            {editingStaff ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
