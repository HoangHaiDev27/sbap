import React from "react";

const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      {/* Overlay mờ */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chi tiết sách</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex gap-6">
          {/* Ảnh sách */}
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv"
            alt={book.title}
            className="w-32 h-44 object-cover rounded"
          />

          {/* Thông tin */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600">Tác giả: {book.author}</p>
            <p className="text-gray-600">Chủ sách: {book.owner}</p>
            <span className="inline-block mt-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">
              {book.category}
            </span>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Lượt xem</p>
                <p className="font-semibold">{book.views.split("/")[0]}</p>
              </div>
              <div>
                <p className="text-gray-500">Lượt nghe</p>
                <p className="font-semibold">{book.views.split("/")[1]}</p>
              </div>
              <div>
                <p className="text-gray-500">Đánh giá</p>
                <p className="font-semibold">⭐ {book.rating}</p>
              </div>
              <div>
                <p className="text-gray-500">Số feedback</p>
                <p className="font-semibold">45</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <i className="ri-message-2-line mr-1"></i> Xem feedback (45)
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Ẩn sách
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                <i className="ri-delete-bin-line mr-1"></i> Xóa sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
