'use client';
import React, { useState, useEffect } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

interface StaffFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  status: string;
  avatarUrl?: string;
}

interface StaffAddEditModalProps {
  open: boolean;
  editingStaff?: StaffFormData;
  onSave: (data: StaffFormData, avatarFile?: File) => void;
  onClose: () => void;
}

export default function StaffAddEditModal({
  open,
  editingStaff,
  onSave,
  onClose
}: StaffAddEditModalProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    status: 'active',
    avatarUrl: '',
  });

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingStaff) {
      setFormData({ ...editingStaff, password: '' });
      setPreviewAvatar(editingStaff.avatarUrl || '');
    } else {
      setFormData({ name: '', email: '', password: '', role: 'staff', status: 'active', avatarUrl: '' });
      setPreviewAvatar('');
    }
    setNewAvatarFile(null);
    setShowPassword(false);
  }, [editingStaff, open]);

  if (!open) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return alert('Vui lòng nhập đầy đủ thông tin');
    if (!editingStaff && !formData.password) return alert('Vui lòng nhập mật khẩu');
    onSave(formData, newAvatarFile || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          {editingStaff ? 'Cập nhật Staff' : 'Thêm Staff mới'}
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded px-3 py-2 pr-10"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
          }

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
