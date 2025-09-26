'use client';
import React from 'react';

export default function CategoryModal({ editingCategory, formData, setFormData, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      {/* Lớp mờ phía sau */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      {/* Nội dung modal */}
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-lg z-10 text-gray-900">
        <h3 className="text-lg font-semibold mb-4">
          {editingCategory ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên thể loại
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Nhập tên thể loại"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="Genre">Thể loại</option>
              <option value="Category">Danh mục</option>
              <option value="Tag">Thẻ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData({...formData, isActive: e.target.value === 'active'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="active">Đang dùng</option>
              <option value="inactive">Không dùng</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
