import React from "react";

const BookDetailModal = ({ book, onClose }) => {
  if (!book) return null;

  const getCategoryColor = (categoryName) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-300",
      "bg-purple-100 text-purple-700 border-purple-300",
      "bg-pink-100 text-pink-700 border-pink-300",
      "bg-indigo-100 text-indigo-700 border-indigo-300",
      "bg-teal-100 text-teal-700 border-teal-300",
      "bg-cyan-100 text-cyan-700 border-cyan-300",
      "bg-emerald-100 text-emerald-700 border-emerald-300",
      "bg-violet-100 text-violet-700 border-violet-300",
    ];
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = ((hash << 5) - hash) + categoryName.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className="absolute inset-0"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chi tiết sách</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="flex gap-6">
          <img
            src={book.coverUrl || "https://via.placeholder.com/128x176?text=No+Image"}
            alt={book.title}
            className="w-32 h-44 object-cover rounded"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/128x176?text=No+Image";
            }}
          />

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600">Tác giả: {book.author}</p>
            <p className="text-gray-600">Chủ sách: {book.owner}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {book.categoryNames && book.categoryNames.length > 0 ? (
                book.categoryNames.map((catName, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded-md border ${getCategoryColor(catName)}`}
                  >
                    {catName}
                  </span>
                ))
              ) : (
                <span className="px-2 py-1 text-xs rounded-md border bg-gray-100 text-gray-600 border-gray-300">
                  Chưa phân loại
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Lượt xem</p>
                <p className="font-semibold">{book.views || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Đã bán</p>
                <p className="font-semibold">{book.sold || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Đánh giá</p>
                <p className="font-semibold">⭐ {book.rating?.toFixed(1) || 0}</p>
              </div>
              <div>
                <p className="text-gray-500">Số feedback</p>
                <p className="font-semibold">{book.totalRatings || 0}</p>
              </div>
            </div>

            {book.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Mô tả:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{book.description}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  window.location.href = `/staff/feedback?bookId=${book.id}`;
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <i className="ri-message-2-line mr-1"></i> Xem feedback ({book.totalRatings || 0})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
