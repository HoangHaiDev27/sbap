import React from "react";
import { useState } from "react";

export default function FavoriteBook() {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 🔹 Dữ liệu mẫu
  const favoriteBooks = [
    {
      id: 1,
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      cover:
        "https://readdy.ai/api/search-image?query=Sapiens%20human%20evolution%20history%20book%20cover&width=200&height=280",
      category: "Lịch sử",
      rating: 4.9,
      duration: "15h 17m",
      narrator: "Derek Perkins",
      dateAdded: "2024-01-20",
      lastAccessed: "2024-01-19",
      progress: 78,
      isPremium: true,
      isOwned: false,
      status: "reading",
    },
    {
      id: 2,
      title: "Homo Deus: A Brief History of Tomorrow",
      author: "Yuval Noah Harari",
      cover:
        "https://readdy.ai/api/search-image?query=Homo%20deus%20future%20technology%20book%20cover&width=200&height=280",
      category: "Khoa học",
      rating: 4.8,
      duration: "14h 54m",
      narrator: "Derek Perkins",
      dateAdded: "2024-01-18",
      lastAccessed: "2024-01-17",
      progress: 45,
      isPremium: true,
      isOwned: false,
      status: "reading",
    },
    {
      id: 3,
      title: "Educated",
      author: "Tara Westover",
      cover:
        "https://readdy.ai/api/search-image?query=Educated%20memoir%20education%20book%20cover&width=200&height=280",
      category: "Hồi ký",
      rating: 4.7,
      duration: "12h 10m",
      narrator: "Julia Whelan",
      dateAdded: "2024-01-15",
      lastAccessed: "2024-01-14",
      progress: 100,
      isPremium: false,
      isOwned: true,
      status: "completed",
    },
    {
      id: 4,
      title: "The Midnight Library",
      author: "Matt Haig",
      cover:
        "https://readdy.ai/api/search-image?query=Midnight%20library%20philosophical%20fiction%20book%20cover&width=200&height=280",
      category: "Triết học",
      rating: 4.6,
      duration: "8h 49m",
      narrator: "Carey Mulligan",
      dateAdded: "2024-01-12",
      lastAccessed: "2024-01-10",
      progress: 0,
      isPremium: true,
      isOwned: false,
      status: "wishlist",
    },
    {
      id: 5,
      title: "Becoming",
      author: "Michelle Obama",
      cover:
        "https://readdy.ai/api/search-image?query=Becoming%20Michelle%20Obama%20memoir%20book%20cover&width=200&height=280",
      category: "Hồi ký",
      rating: 4.9,
      duration: "19h 3m",
      narrator: "Michelle Obama",
      dateAdded: "2024-01-10",
      lastAccessed: "2024-01-09",
      progress: 32,
      isPremium: false,
      isOwned: true,
      status: "reading",
    },
    {
      id: 6,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      cover:
        "https://readdy.ai/api/search-image?query=Silent%20patient%20psychological%20thriller%20book%20cover&width=200&height=280",
      category: "Tâm lý",
      rating: 4.5,
      duration: "8h 43m",
      narrator: "Jack Hawkins",
      dateAdded: "2024-01-08",
      lastAccessed: "2024-01-07",
      progress: 100,
      isPremium: true,
      isOwned: false,
      status: "completed",
    },
    {
      id: 7,
      title: "The Seven Husbands of Evelyn Hugo",
      author: "Taylor Jenkins Reid",
      cover:
        "https://readdy.ai/api/search-image?query=Seven%20husbands%20Evelyn%20Hugo%20romance%20novel%20book%20cover&width=200&height=280",
      category: "Tiểu thuyết",
      rating: 4.8,
      duration: "12h 10m",
      narrator: "Alma Cuervo",
      dateAdded: "2024-01-05",
      lastAccessed: "2024-01-04",
      progress: 65,
      isPremium: false,
      isOwned: true,
      status: "reading",
    },
  ];

  // 🔹 Filter
  const getFilteredBooks = () => {
    switch (filter) {
      case "reading":
        return favoriteBooks.filter((b) => b.status === "reading");
      case "completed":
        return favoriteBooks.filter((b) => b.status === "completed");
      case "wishlist":
        return favoriteBooks.filter((b) => b.status === "wishlist");
      case "owned":
        return favoriteBooks.filter((b) => b.isOwned);
      case "premium":
        return favoriteBooks.filter((b) => b.isPremium && !b.isOwned);
      default:
        return favoriteBooks;
    }
  };

  const filteredBooks = getFilteredBooks();
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🔹 Badges
  const getStatusBadge = (status) => {
    if (status === "completed")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Đã hoàn thành
        </span>
      );
    if (status === "reading")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Đang đọc
        </span>
      );
    if (status === "wishlist")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          Muốn đọc
        </span>
      );
    return null;
  };

  const getAccessBadge = (isOwned, isPremium) => {
    if (isOwned)
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300">
          Sở hữu
        </span>
      );
    if (isPremium)
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
          VIP
        </span>
      );
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
        Miễn phí
      </span>
    );
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Sách yêu thích</h2>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 w-full sm:w-auto"
        >
          <option value="all">Tất cả</option>
          <option value="reading">Đang đọc</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="wishlist">Muốn đọc</option>
          <option value="owned">Đã sở hữu</option>
          <option value="premium">Yêu cầu VIP</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-800 rounded-xl p-4 flex flex-col hover:bg-gray-700 transition-colors relative"
          >
            {/* Nội dung chính */}
            <div className="flex gap-4">
              {/* Cover */}
              <img
                src={book.cover}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
              />

              {/* Thông tin sách */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-white text-sm mb-1 truncate">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-300 mb-2">{book.author}</p>

                {/* Badge */}
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded-full">
                    {book.category}
                  </span>
                  {getStatusBadge(book.status)}
                </div>

                {/* Tiến độ */}
                {book.progress > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>
                        Chương {Math.ceil((book.progress / 100) * 12)}
                      </span>
                      <span>{book.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(
                          book.progress
                        )}`}
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Thời lượng – rating – ngày thêm */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{book.duration}</span>
                  <span>⭐ {book.rating}</span>
                  <span>{book.dateAdded}</span>
                </div>
              </div>
            </div>

            {/* Nút hành động full width */}
            <button
              className={`mt-4 w-full py-2 rounded-lg font-medium text-white ${
                book.status === "wishlist"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {book.status === "wishlist"
                ? "Thêm vào thư viện"
                : "Tiếp tục đọc"}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
