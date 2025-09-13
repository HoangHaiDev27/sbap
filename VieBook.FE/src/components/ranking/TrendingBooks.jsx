import React, { useState } from "react";

export default function TrendingBooks() {
  const allTrendingBooks = [
    {
      id: 1,
      title: "Fourth Wing",
      author: "Rebecca Ross",
      category: "Fantasy",
      trendScore: 95,
      growth: "+245%",
      listens: 5600,
      image: "https://picsum.photos/120/160?random=1",
      isHot: true,
    },
    {
      id: 2,
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      category: "Fiction",
      trendScore: 88,
      growth: "+189%",
      listens: 4200,
      image: "https://picsum.photos/120/160?random=2",
      isHot: true,
    },
    {
      id: 3,
      title: "Lessons in Chemistry",
      author: "Bonnie Garmus",
      category: "Fiction",
      trendScore: 82,
      growth: "+156%",
      listens: 3800,
      image: "https://picsum.photos/120/160?random=3",
      isHot: false,
    },
    {
      id: 4,
      title: "Dune",
      author: "Frank Herbert",
      category: "Sci-Fi",
      trendScore: 90,
      growth: "+201%",
      listens: 6100,
      image: "https://picsum.photos/120/160?random=4",
      isHot: true,
    },
    {
      id: 5,
      title: "Project Hail Mary",
      author: "Andy Weir",
      category: "Sci-Fi",
      trendScore: 85,
      growth: "+167%",
      listens: 4500,
      image: "https://picsum.photos/120/160?random=5",
      isHot: false,
    },
    {
      id: 6,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      category: "Thriller",
      trendScore: 78,
      growth: "+132%",
      listens: 3900,
      image: "https://picsum.photos/120/160?random=6",
      isHot: false,
    },
  ];

  const [visibleCount, setVisibleCount] = useState(3);

  const getScoreColor = (score) => {
    if (score >= 90) return "text-red-400";
    if (score >= 80) return "text-orange-400";
    if (score >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  const FireIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C10 5 6 7 6 13c0 4 3 8 6 8s6-4 6-8c0-6-4-8-6-11z" />
    </svg>
  );
  const PlayIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
  const HeartIcon = ({ className = "w-5 h-5" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </svg>
  );
  const TrendingIcon = ({ className = "w-4 h-4" }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 17l6-6 4 4 8-8" />
    </svg>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Sách đang thịnh hành</h2>
        <div className="flex items-center text-orange-400 text-sm">
          <TrendingIcon className="w-4 h-4 mr-1" />
          <span>Cập nhật mỗi giờ</span>
        </div>
      </div>

      {/* Danh sách */}
      <div className="space-y-3">
        {allTrendingBooks.slice(0, visibleCount).map((book, index) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-600 transition-colors"
          >
            {/* Rank */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <TrendingIcon className="text-green-400 mt-1" />
            </div>

            {/* Book Image */}
            <div className="flex-shrink-0 relative">
              <img
                src={book.image}
                alt={book.title}
                className="w-12 h-16 object-cover rounded"
              />
              {book.isHot && (
                <FireIcon className="absolute -top-1 -right-1 text-red-500 w-4 h-4" />
              )}
            </div>

            {/* Info */}
            <div className="flex-grow">
              <h3 className="font-semibold text-white mb-1">{book.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{book.author}</p>
              <div className="flex items-center space-x-4 text-xs">
                <span className="bg-gray-600 px-2 py-1 rounded text-gray-300">
                  {book.category}
                </span>
                <span className="text-gray-400">
                  {book.listens.toLocaleString()} lượt nghe
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getScoreColor(
                  book.trendScore
                )}`}
              >
                {book.trendScore}°
              </div>
              <div className="text-green-400 text-sm font-medium">
                {book.growth}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <HeartIcon />
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                <PlayIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Xem thêm */}
      {visibleCount < allTrendingBooks.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}
