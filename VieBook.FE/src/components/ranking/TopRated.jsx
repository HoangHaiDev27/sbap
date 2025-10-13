'use client';
import React, { useState, useEffect } from "react";
import { RiEyeLine, RiHeartLine, RiHeartFill, RiThumbUpLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { getRankingList } from "../../api/rankingApi"; 

export default function TopRated() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // Gọi API để lấy danh sách sách được đánh giá cao
  useEffect(() => {
    const fetchTopRatedBooks = async () => {
      try {
        const data = await getRankingList();
        if (data && data.topRatedBooks) {
          setBooks(data.topRatedBooks.map(b => ({
            id: b.bookId,
            title: b.title,
            author: b.authorName,
            rating: b.rating || 0,
            totalRatings: b.totalRatings || 0,
            category: b.categoryNames?.join(", ") || "Không có",
            duration: b.duration || "",
            description: b.description || "",
            image: b.coverUrl && b.coverUrl.trim() !== ""
            ? b.coverUrl
            : "https://via.placeholder.com/200x300?text=No+Image",
            liked: false,
          })));
        }
      } catch (err) {
        console.error("Lỗi khi tải top rated books:", err);
      }
    };

    fetchTopRatedBooks();
  }, []);

  // const toggleLike = (id) => {
  //   setBooks(prev =>
  //     prev.map(book =>
  //       book.id === id ? { ...book, liked: !book.liked } : book
  //     )
  //   );
  // };

  const Star = ({ filled, half }) => {
    if (filled) return <span className="text-yellow-400">★</span>;
    if (half)
      return (
        <span className="relative text-yellow-400">
          <span>★</span>
          <span className="absolute top-0 left-1/2 text-gray-400 overflow-hidden w-1/2">★</span>
        </span>
      );
    return <span className="text-gray-400">★</span>;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} filled />);
    if (hasHalfStar) stars.push(<Star key="half" half />);
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) stars.push(<Star key={`empty-${i}`} />);
    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.8) return "text-green-400";
    if (rating >= 4.5) return "text-yellow-400";
    if (rating >= 4.0) return "text-orange-400";
    return "text-red-400";
  };

  const visibleBooks = books.slice(0, visibleCount);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Sách được đánh giá cao nhất</h2>
        <div className="flex items-center text-yellow-400 text-sm">
          <RiThumbUpLine className="mr-1" />
          <span>Đánh giá từ người dùng</span>
        </div>
      </div>

      {/* Top 3 Books */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {visibleBooks.slice(0, 3).map((book, index) => (
          <div
            key={book.id}
            className={`relative rounded-xl p-4 ${
              index === 0
                ? "bg-gradient-to-br from-yellow-600 to-yellow-800"
                : index === 1
                ? "bg-gradient-to-br from-gray-500 to-gray-700"
                : "bg-gradient-to-br from-orange-600 to-orange-800"
            }`}
          >
            <div className="absolute top-2 left-2 text-2xl">
              {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
            </div>

            <div className="text-center pt-6">
              <img
                src={book.image}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg mx-auto mb-3"
              />
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-gray-200 text-sm mb-2">{book.author}</p>
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-1 mr-2">
                  {renderStars(book.rating)}
                </div>
                <span className={`font-bold ${getRatingColor(book.rating)}`}>{book.rating}</span>
              </div>
              <p className="text-xs text-gray-200 mb-3">
                {(book.totalRatings ?? book.ratingCount ?? 0).toLocaleString()} đánh giá
              </p>
              <button
                onClick={() => navigate(`/bookdetails/${book.id}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
              >
                <RiEyeLine className="mr-2" /> Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Các sách còn lại */}
      <div className="space-y-4">
        {visibleBooks.slice(3).map((book, index) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center pt-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-gray-400 text-white"
                      : index === 2
                      ? "bg-orange-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {index + 4}
                </div>
              </div>
              <div className="flex-shrink-0">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{book.title}</h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* <button
                      onClick={() => toggleLike(book.id)}
                      className="p-2 transition-colors"
                    >
                      {book.liked ? (
                        <RiHeartFill size={18} className="text-red-500" />
                      ) : (
                        <RiHeartLine size={18} className="text-gray-400" />
                      )}
                    </button> */}
                    <button
                      onClick={() => navigate(`/bookdetails/${book.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{book.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                  <span className="bg-gray-600 px-2 py-1 rounded">{book.category}</span>
                  <span>{book.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < books.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 3)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Xem thêm sách đánh giá cao
          </button>
        </div>
      )}
    </div>
  );
}
