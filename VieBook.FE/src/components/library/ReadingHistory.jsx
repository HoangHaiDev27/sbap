"use client";

import { useState, useEffect } from "react";
import { getReadingHistory } from "../../api/readingHistoryApi";
import { Link } from "react-router-dom";

export default function ReadingHistory() {
  const [sortBy, setSortBy] = useState("recent");
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReadingHistory();
  }, [sortBy]);

  const loadReadingHistory = async () => {
    try {
      setLoading(true);
      const data = await getReadingHistory({});
      setReadingHistory(data || []);
    } catch (error) {
      console.error('Error loading reading history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBooks = () => {
    let filtered = [...readingHistory];
    
    // Sort by selected option
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.lastReadAt) - new Date(b.lastReadAt));
        break;
      case "title":
        filtered.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
        break;
      case "author":
        filtered.sort((a, b) => (a.author || "").localeCompare(b.author || ""));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-gray-500";
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Lịch sử đọc sách</h2>
        <div className="w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white pr-8 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="recent">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title">Tên sách A-Z</option>
            <option value="author">Tác giả A-Z</option>
          </select>
        </div>
      </div>


      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3">Đang tải lịch sử...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <i className="ri-error-warning-line text-4xl"></i>
          </div>
          <p className="text-gray-400">Có lỗi xảy ra: {error}</p>
          <button 
            onClick={loadReadingHistory}
            className="mt-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && getFilteredBooks().length > 0 && (
        <div className="text-sm text-gray-400">
          Hiển thị {getFilteredBooks().length} kết quả
        </div>
      )}

      {/* Book grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getFilteredBooks().map((item) => (
            <div
              key={item.readingHistoryId}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
            >
              <div className="flex space-x-4">
                <img
                  src={item.coverUrl || "https://via.placeholder.com/80x112?text=No+Image"}
                  alt={item.bookTitle}
                  className="w-20 h-28 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {item.bookTitle}
                  </h3>
                  <p className="text-sm text-gray-400">{item.author || "Tác giả không xác định"}</p>


                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.chapterTitle || "Không có chương"}</span>
                      {item.audioPosition && (
                        <span>{Math.floor(item.audioPosition / 60)}:{(item.audioPosition % 60).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <div className="flex items-center space-x-3">
                      <span>
                        <i className="ri-time-line mr-1"></i>
                        {formatDate(item.lastReadAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-700">
                <Link
                  to={`/reader/${item.bookId}/chapter/${item.chapterId}`}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg text-white text-sm font-medium text-center"
                >
                  Tiếp tục đọc
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && getFilteredBooks().length === 0 && (
        <div className="text-center py-12">
          <i className="ri-book-open-line text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Chưa có sách nào
          </h3>
          <p className="text-gray-500 mb-4">
            Hãy bắt đầu khám phá thư viện sách phong phú của chúng tôi
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg text-white font-medium">
            Khám phá sách hay
          </button>
        </div>
      )}
    </div>
  );
}
