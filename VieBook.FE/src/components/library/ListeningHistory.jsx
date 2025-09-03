import React, { useState } from "react";

export default function ListeningHistory() {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 🔹 Data mẫu
  const listeningHistory = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      cover:
        "https://readdy.ai/api/search-image?query=Atomic%20habits%20book%20cover&width=200&height=280",
      category: "Phát triển bản thân",
      duration: "5h 35m",
      listened: "4h 20m",
      progress: 78,
      lastListened: "2024-01-19",
      narrator: "Trần Minh Anh",
      playbackSpeed: "1.5x",
      currentPosition: "4:20:15",
      rating: 4.8,
      status: "listening",
    },
    {
      id: 2,
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen Covey",
      cover:
        "https://readdy.ai/api/search-image?query=Seven%20habits%20book%20cover&width=200&height=280",
      category: "Lãnh đạo",
      duration: "13h 4m",
      listened: "13h 4m",
      progress: 100,
      lastListened: "2024-01-16",
      narrator: "Lê Văn Nam",
      playbackSpeed: "1.25x",
      currentPosition: "13:04:00",
      rating: 4.9,
      status: "completed",
    },
    {
      id: 3,
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      cover:
        "https://readdy.ai/api/search-image?query=Think%20and%20grow%20rich%20book%20cover&width=200&height=280",
      category: "Tài chính",
      duration: "8h 42m",
      listened: "2h 15m",
      progress: 26,
      lastListened: "2024-01-14",
      narrator: "Nguyễn Thị Lan",
      playbackSpeed: "1.0x",
      currentPosition: "2:15:30",
      rating: 4.6,
      status: "listening",
    },
    {
      id: 4,
      title: "The Lean Startup",
      author: "Eric Ries",
      cover:
        "https://readdy.ai/api/search-image?query=Lean%20startup%20book%20cover&width=200&height=280",
      category: "Kinh doanh",
      duration: "8h 58m",
      listened: "8h 58m",
      progress: 100,
      lastListened: "2024-01-12",
      narrator: "Phạm Quang Minh",
      playbackSpeed: "1.75x",
      currentPosition: "8:58:00",
      rating: 4.7,
      status: "completed",
    },
    {
      id: 5,
      title: "Mindset",
      author: "Carol Dweck",
      cover:
        "https://readdy.ai/api/search-image?query=Mindset%20book%20cover&width=200&height=280",
      category: "Tâm lý học",
      duration: "7h 20m",
      listened: "5h 45m",
      progress: 78,
      lastListened: "2024-01-11",
      narrator: "Vũ Thu Hà",
      playbackSpeed: "1.25x",
      currentPosition: "5:45:20",
      rating: 4.5,
      status: "listening",
    },
    {
      id: 6,
      title: "The Power of Now",
      author: "Eckhart Tolle",
      cover:
        "https://readdy.ai/api/search-image?query=The%20power%20of%20now%20book%20cover&width=200&height=280",
      category: "Tâm linh",
      duration: "7h 37m",
      listened: "1h 30m",
      progress: 20,
      lastListened: "2024-01-09",
      narrator: "Hoàng Minh Tú",
      playbackSpeed: "1.0x",
      currentPosition: "1:30:45",
      rating: 4.4,
      status: "listening",
    },
  ];

  // 🔹 Helper: convert "xh ym" → giờ (float)
  const parseTimeToHours = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+)h\s*(\d+)?m?/);
    const hours = match ? parseInt(match[1]) : 0;
    const minutes = match && match[2] ? parseInt(match[2]) : 0;
    return hours + minutes / 60;
  };

  // 🔹 Stats
  const listeningCount = listeningHistory.filter(
    (b) => b.status === "listening"
  ).length;
  const completedCount = listeningHistory.filter(
    (b) => b.status === "completed"
  ).length;
  const totalHours = listeningHistory.reduce(
    (sum, b) => sum + parseTimeToHours(b.listened),
    0
  );

  // 🔹 Filter
  const getFilteredBooks = () => {
    switch (filter) {
      case "listening":
        return listeningHistory.filter((book) => book.status === "listening");
      case "completed":
        return listeningHistory.filter((book) => book.status === "completed");
      default:
        return listeningHistory;
    }
  };

  // 🔹 Pagination
  const filteredBooks = getFilteredBooks();
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-gray-500";
  };

  const getStatusBadge = (status) => {
    if (status === "completed")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Đã nghe xong
        </span>
      );
    if (status === "listening")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Đang nghe
        </span>
      );
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Lịch sử nghe sách</h2>
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8"
          >
            <option value="all">Tất cả</option>
            <option value="listening">Đang nghe</option>
            <option value="completed">Đã nghe xong</option>
          </select>
        </div>
      </div>
      {/* 🔹 Stats */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-400">{listeningCount}</p>
          <p className="text-gray-300">Đang nghe</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
          <p className="text-gray-300">Đã hoàn thành</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-400">
            {Math.round(totalHours)}h
          </p>
          <p className="text-gray-300">Đã nghe</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentBooks.map((book) => (
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
                    <span>Vị trí {book.currentPosition}</span>
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
                      {book.listened}
                    </span>
                    <span>
                      <i className="ri-star-fill text-yellow-400 mr-1"></i>
                      {book.rating}
                    </span>
                  </div>
                  <span>{new Date(book.lastListened).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-700">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 py-2 rounded-lg text-white text-sm font-medium">
                Tiếp tục nghe
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white font-medium disabled:opacity-50"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium ${
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
            className="px-4 py-2 rounded-lg bg-gray-700 text-white font-medium disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
