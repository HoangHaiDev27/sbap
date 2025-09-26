'use client';
import React, { useState } from 'react';
import ApproveRejectModal from './ApproveRejectModal';

export default function BookDetailModal({ book, onClose, staffId }) {
  const [actionType, setActionType] = useState(null);

  if (!book) return null;

  const handleActionClick = (type) => {
    setActionType(type);
  };

  const handleConfirm = () => {
    // Có thể thêm callback để refresh danh sách sách chờ duyệt nếu cần
    setActionType(null);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal box */}
        <div
          className="relative bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Chi tiết sách</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="ri-close-line text-gray-600 text-xl"></i>
            </button>
          </div>

          {/* Thông tin sách */}
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-6 mb-6">
            <img
              className="h-48 w-36 rounded-lg object-cover object-top mb-4 md:mb-0"
              src={book.cover}
              alt={book.title}
            />
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h4>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Tác giả:</span> {book.author}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Chủ sách:</span> {book.owner}
              </p>
              <p className="text-sm text-gray-500 mt-2">Ngày gửi: {book.submitDate}</p>

              {/* Hiển thị tất cả category */}
              <div className="flex flex-wrap gap-2 mt-3">
                {book.categories?.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tóm tắt */}
          <h5 className="font-semibold text-gray-900 mb-2">Tóm tắt nội dung</h5>
          <p className="text-gray-700 leading-relaxed mb-6">{book.summary}</p>

          {/* Nút hành động */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleActionClick('reject')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <i className="ri-close-line mr-2"></i>Từ chối
            </button>
            <button
              onClick={() => handleActionClick('approve')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <i className="ri-check-line mr-2"></i>Duyệt
            </button>
          </div>
        </div>
      </div>

      {/* Modal duyệt/từ chối */}
      {actionType && (
        <ApproveRejectModal
          type={actionType}
          book={book}
          staffId={staffId}
          onClose={() => setActionType(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
