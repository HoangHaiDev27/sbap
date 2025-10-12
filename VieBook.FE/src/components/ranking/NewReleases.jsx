import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRankingList } from "../../api/rankingapi"; 

export default function NewReleases() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API khi load trang
  useEffect(() => {
    async function fetchNewReleases() {
      try {
        setLoading(true);
        const data = await getRankingList();
        console.log("Ranking API:", data);

        // Backend có thể trả về nhiều nhóm → lọc phần NewRelease
        const newReleaseBooks =
          data?.newReleases || data?.newReleaseBooks || data?.new_release || [];

        // Nếu API chưa có các field UI yêu cầu, thêm tạm
        const formatted = newReleaseBooks.map((book, index) => ({
          id: book.bookId || book.id || index + 1,
          title: book.title || "Chưa có tiêu đề",
          author: book.authorName || book.author || "Tác giả không xác định",
          createdAt: book.createdAt || "2024-01-01",
          categoryNames: book.categoryNames || "Không rõ thể loại",
          duration: book.duration || "—",
          description: book.description || "Không có mô tả.",
          image: book.image || "https://picsum.photos/200/300?random=" + index,
          isNew: true,
          liked: false,
        }));

        setBooks(formatted);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách sách mới phát hành.");
      } finally {
        setLoading(false);
      }
    }

    fetchNewReleases();
  }, []);

  // ✅ Hàm xử lý like
  // const toggleLike = (id) => {
  //   setBooks((prev) =>
  //     prev.map((book) =>
  //       book.id === id ? { ...book, liked: !book.liked } : book
  //     )
  //   );
  // };

  // ✅ Format thời gian phát hành
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hôm qua";
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // ✅ Icon component giữ nguyên (CalendarIcon, NewIcon, PlayIcon, HeartIcon)
  const CalendarIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 
        0 002-2V7a2 2 0 00-2-2H5a2 
        2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const NewIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M10 2a8 8 0 100 16 8 8 0 
      000-16zm3.707 9.293l-4-4a1 1 0 
      00-1.414 1.414L11.586 12H9a1 1 0 
      100 2h5a1 1 0 001-1v-5a1 1 0 
      10-2 0v2.586z"
      />
    </svg>
  );

  const PlayIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6 4l12 6-12 6V4z" />
    </svg>
  );

  const HeartIcon = ({ filled, className }) => (
    <svg
      className={className}
      fill={filled ? "red" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 
        016.364 0L12 7.636l1.318-1.318a4.5 
        4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 
        4.5 0 010-6.364z"
      />
    </svg>
  );

  const visibleBooks = books.slice(0, visibleCount);

  if (loading)
    return <div className="text-center text-gray-400">Đang tải sách mới...</div>;
  if (error)
    return <div className="text-center text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Sách mới phát hành</h2>
        <div className="flex items-center text-blue-400 text-sm">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>Cập nhật hàng ngày</span>
        </div>
      </div>

      {/* --- giữ nguyên UI gốc --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {visibleBooks.slice(0, 3).map((book) => (
          <div
            key={book.id}
            className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl p-4 relative"
          >
            {book.isNew && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <NewIcon className="w-4 h-4 mr-1" />
                MỚI
              </div>
            )}

            <div className="text-center">
              <img
                src={book.image}
                alt={book.title}
                className="w-24 h-32 object-cover rounded-lg mx-auto mb-3"
              />
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{book.author}</p>
              <div className="flex items-center justify-center text-xs text-gray-400 mb-3">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{formatDate(book.createdAt)}</span>
              </div>
              <button
                onClick={() => navigate(`/bookdetails/${book.id}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- danh sách đầy đủ --- */}
      <div className="space-y-4">
        {visibleBooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                {book.isNew && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center">
                    <NewIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <button
                      onClick={() => toggleLike(book.id)}
                      className="p-2 transition-colors"
                    >
                      <HeartIcon filled={book.liked} className="w-5 h-5" />
                    </button> */}
                    <button
                      onClick={() => navigate(`/bookdetails/${book.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {book.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="bg-gray-600 px-2 py-1 rounded">
                      {book.categoryNames}
                    </span>
                    {/* <span>{book.duration}</span> */}
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(book.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < books.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Xem thêm sách mới
          </button>
        </div>
      )}
    </div>
  );
}
