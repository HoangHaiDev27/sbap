import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PopularBooks() {
  const navigate = useNavigate();

  const popularBooks = [
    {
      id: 1,
      rank: 1,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      listens: 12500,
      rating: 4.8,
      duration: "4h 30m",
      image: "https://picsum.photos/120/160?random=1",
      trend: "up",
      liked: false,
    },
    {
      id: 2,
      rank: 2,
      title: "Atomic Habits",
      author: "James Clear",
      listens: 11200,
      rating: 4.9,
      duration: "5h 15m",
      image: "https://picsum.photos/120/160?random=2",
      trend: "up",
      liked: false,
    },
    {
      id: 3,
      rank: 3,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      listens: 9800,
      rating: 4.7,
      duration: "15h 20m",
      image: "https://picsum.photos/120/160?random=3",
      trend: "down",
      liked: false,
    },
    {
      id: 4,
      rank: 4,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      listens: 8900,
      rating: 4.6,
      duration: "20h 45m",
      image: "https://picsum.photos/120/160?random=4",
      trend: "same",
      liked: false,
    },
    {
      id: 5,
      rank: 5,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      listens: 8200,
      rating: 4.8,
      duration: "5h 50m",
      image: "https://picsum.photos/120/160?random=5",
      trend: "up",
      liked: false,
    },
    {
      id: 6,
      rank: 6,
      title: "Deep Work",
      author: "Cal Newport",
      listens: 7400,
      rating: 4.5,
      duration: "7h 30m",
      image: "https://picsum.photos/120/160?random=6",
      trend: "up",
      liked: false,
    },
    {
      id: 7,
      rank: 7,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      listens: 6900,
      rating: 4.4,
      duration: "6h 40m",
      image: "https://picsum.photos/120/160?random=7",
      trend: "down",
      liked: false,
    },
  ];

  const [books, setBooks] = useState(popularBooks);
  const [visibleCount, setVisibleCount] = useState(3);

  const toggleLike = (id) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id ? { ...book, liked: !book.liked } : book
      )
    );
  };

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Top sách được nghe nhiều nhất</h2>

      <div className="space-y-4">
        {books.slice(0, visibleCount).map((book) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-600 transition-colors"
          >
            {/* Rank */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(
                  book.rank
                )}`}
              >
                {book.rank}
              </div>
              {getTrendIcon(book.trend)}
            </div>

            {/* Book Image */}
            <div className="flex-shrink-0">
              <img
                src={book.image}
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
            </div>

            {/* Book Info */}
            <div className="flex-grow">
              <h3 className="font-semibold text-white mb-1">{book.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{book.author}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>{book.listens.toLocaleString()} lượt nghe</span>
                <span>{book.duration}</span>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.262 3.887a1 1 0 00.95.69h4.084c.969 0 1.371 1.24.588 1.81l-3.305 2.4a1 1 0 00-.364 1.118l1.262 3.887c.3.921-.755 1.688-1.538 1.118l-3.305-2.4a1 1 0 00-1.176 0l-3.305 2.4c-.783.57-1.838-.197-1.538-1.118l1.262-3.887a1 1 0 00-.364-1.118l-3.305-2.4c-.783-.57-.38-1.81.588-1.81h4.084a1 1 0 00.95-.69l1.262-3.887z" />
                  </svg>
                  <span>{book.rating}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Heart button */}
              <button
                onClick={() => toggleLike(book.id)}
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
              </button>

              {/* Play button */}
              <button
                onClick={() => navigate(`/bookdetails/${book.id}`)}
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
