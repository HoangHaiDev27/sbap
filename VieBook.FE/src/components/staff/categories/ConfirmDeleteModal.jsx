'use client';
import React from 'react';

export default function ConfirmDeleteModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      {/* Lớp mờ phía sau */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      {/* Nội dung modal */}
      <div className="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-lg z-10 text-gray-900">
        <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
        <p className="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa thể loại này?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
