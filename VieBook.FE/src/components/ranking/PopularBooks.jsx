import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRankingList } from "../../api/rankingapi";

export default function PopularBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API lấy top sách phổ biến
   useEffect(() => {
  async function fetchPopularBooks() {
    try {
      setLoading(true);
      const data = await getRankingList("popular");
      console.log("Ranking API data:", data);

      const booksWithTrend = (data?.popularBooks || []).map((book, index) => ({
        ...book,
        trend:
          index % 3 === 0
            ? "up"
            : index % 3 === 1
            ? "down"
            : "same", // 3 trạng thái: ↑ ↓ -
        liked: false,
      }));

      setBooks(booksWithTrend);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách sách phổ biến.");
    } finally {
      setLoading(false);
    }
  }
  fetchPopularBooks();
}, []);




  // const toggleLike = (id) => {
  //   setBooks((prev) =>
  //     prev.map((book) =>
  //       book.bookId === id ? { ...book, liked: !book.liked } : book
  //     )
  //   );
  // };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <span className="text-green-400">↑</span>;
      case "down":
        return <span className="text-red-400">↓</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  if (loading) {
    return <p className="text-gray-400">Đang tải dữ liệu...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Top sách phổ biến nhất</h2>

      <div className="space-y-4">
        {Array.isArray(books) && books.slice(0, visibleCount).map((book, index) => (
          <div
            key={book.bookId}
            className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-600 transition-colors"
          >
            {/* Rank */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(
                  index + 1
                )}`}
              >
                {index + 1}
              </div>
              {getTrendIcon(book.trend)}
            </div>

            {/* Book Image */}
            <div className="flex-shrink-0">
              <img
                src={book.coverUrl || "https://via.placeholder.com/120x160"}
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
            </div>

            {/* Book Info */}
            <div className="flex-grow">
              <h3 className="font-semibold text-white mb-1">{book.title}</h3>
              <p className="text-gray-400 text-sm mb-2">
                {book.ownerName || "Không rõ tác giả"}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>{book.totalView?.toLocaleString() || 0} lượt xem</span>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.262 3.887a1 1 0 00.95.69h4.084c.969 0 1.371 1.24.588 1.81l-3.305 2.4a1 1 0 00-.364 1.118l1.262 3.887c.3.921-.755 1.688-1.538 1.118l-3.305-2.4a1 1 0 00-1.176 0l-3.305 2.4c-.783.57-1.838-.197-1.538-1.118l1.262-3.887a1 1 0 00-.364-1.118l-3.305-2.4c-.783-.57-.38-1.81.588-1.81h4.084a1 1 0 00.95-.69l1.262-3.887z" />
                  </svg>
                  <span>{book.rating?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Like button */}
              {/* <button
                onClick={() => toggleLike(book.bookId)}
                className="p-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill={book.liked ? "red" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 
                      7.636l1.318-1.318a4.5 4.5 0 
                      116.364 6.364L12 21.364l-7.682-7.682a4.5 
                      4.5 0 010-6.364z"
                  />
                </svg>
              </button> */}

              {/* Play / View details */}
              <button
                onClick={() => navigate(`/bookdetails/${book.bookId}`)}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 4l12 6-12 6V4z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {visibleCount < books.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 2)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
