// src/components/common/ConfirmModal.jsx
import React from "react";

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 mt-0.5">
            <i className="ri-alert-line text-red-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
