"use client";

import { useState } from "react";

export default function ReadingHistory() {
  const [filter, setFilter] = useState("all");

  // Data mẫu
  const readingHistory = [
    {
      id: 1,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      category: "Kỹ năng sống",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81drfTT9ZfL.jpg",
      status: "reading",
      progress: 45,
      currentChapter: "Chương 6",
      readTime: "12h",
      rating: 4.7,
      lastRead: "2025-08-30",
    },
    {
      id: 2,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      category: "Tiểu thuyết",
      cover:
        "https://upload.wikimedia.org/wikipedia/vi/6/65/Nh%C3%A0_gi%E1%BA%A3_kim.jpg",
      status: "completed",
      progress: 100,
      currentChapter: "Hoàn thành",
      readTime: "8h",
      rating: 4.9,
      lastRead: "2025-08-25",
    },
    {
      id: 3,
      title: "Muôn Kiếp Nhân Sinh",
      author: "Nguyên Phong",
      category: "Tâm linh",
      cover:
        "https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509.jpg",
      status: "reading",
      progress: 72,
      currentChapter: "Chương 15",
      readTime: "20h",
      rating: 4.8,
      lastRead: "2025-09-01",
    },
    {
      id: 4,
      title: "Sherlock Holmes Toàn Tập",
      author: "Arthur Conan Doyle",
      category: "Trinh thám",
      cover:
        "https://product.hstatic.net/200000343865/product/8936067604800_7c7f3b0f7a2e469eb7b5a3eecbbc7e60_master.jpg",
      status: "completed",
      progress: 100,
      currentChapter: "Hoàn thành",
      readTime: "35h",
      rating: 4.5,
      lastRead: "2025-08-20",
    },
    {
      id: 5,
      title: "Harry Potter và Hòn Đá Phù Thủy",
      author: "J.K. Rowling",
      category: "Fantasy",
      cover:
        "https://upload.wikimedia.org/wikipedia/vi/2/2c/Harry_Potter_va_Hon_da_phu_thuy_bia.jpg",
      status: "reading",
      progress: 28,
      currentChapter: "Chương 5",
      readTime: "10h",
      rating: 4.9,
      lastRead: "2025-09-02",
    },
  ];

  const getFilteredBooks = () => {
    switch (filter) {
      case "reading":
        return readingHistory.filter((book) => book.status === "reading");
      case "completed":
        return readingHistory.filter((book) => book.status === "completed");
      default:
        return readingHistory;
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-gray-500";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            Hoàn thành
          </span>
        );
      case "reading":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            Đang đọc
          </span>
        );
      default:
        return null;
    }
  };

  // tính tổng giờ đọc
  const totalHours = readingHistory.reduce((sum, book) => {
    const time = book.readTime.split("h")[0];
    return sum + parseInt(time);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">Lịch sử đọc sách</h2>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white pr-8"
          >
            <option value="all">Tất cả</option>
            <option value="reading">Đang đọc</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
          <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium whitespace-nowrap transition-colors">
            <i className="ri-download-line mr-2"></i>
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 text-center">
  <div>
    <p className="text-2xl font-bold text-blue-400">
      {readingHistory.filter((b) => b.status === "reading").length}
    </p>
    <p className="text-gray-300">Đang đọc</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-green-400">
      {readingHistory.filter((b) => b.status === "completed").length}
    </p>
    <p className="text-gray-300">Đã hoàn thành</p>
  </div>
  <div>
    <p className="text-2xl font-bold text-orange-400">
      {Math.round(totalHours)}h
    </p>
    <p className="text-gray-300">Đã đọc</p>
  </div>
</div>


      {/* Book grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getFilteredBooks().map((book) => (
          <div
            key={book.id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex space-x-4">
              <img
                src={book.cover}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400">{book.author}</p>

                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                    {book.category}
                  </span>
                  {getStatusBadge(book.status)}
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{book.currentChapter}</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        book.progress
                      )}`}
                      style={{ width: `${book.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <div className="flex items-center space-x-3">
                    <span>
                      <i className="ri-time-line mr-1"></i>
                      {book.readTime}
                    </span>
                    <span>
                      <i className="ri-star-fill text-yellow-400 mr-1"></i>
                      {book.rating}
                    </span>
                  </div>
                  <span>
                    {new Date(book.lastRead).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-700">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-white text-sm font-medium">
                Tiếp tục đọc
              </button>
              <button className="p-2 hover:bg-gray-600 rounded-lg">
                <i className="ri-bookmark-line text-gray-400"></i>
              </button>
              <button className="p-2 hover:bg-gray-600 rounded-lg">
                <i className="ri-share-line text-gray-400"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {getFilteredBooks().length === 0 && (
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
