import React from "react";

export default function FeedbackDeleteModal({ feedback, onConfirm, onCancel }) {
  if (!feedback) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Xóa feedback</h3>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn xóa feedback của{" "}
          <span className="font-medium">{feedback.user}</span> với tiêu đề{" "}
          <span className="font-medium">"{feedback.title}"</span> không?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(feedback.id)}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
