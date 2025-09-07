import React from "react";
import { RiPlayCircleLine, RiHeartLine, RiThumbUpLine } from "react-icons/ri";

export default function TopRated() {
  const topRatedBooks = [
    {
      id: 1,
      title: "Becoming",
      author: "Michelle Obama",
      rating: 4.9,
      totalRatings: 15420,
      category: "Biography",
      duration: "19h 3m",
      description: "The former First Lady shares her extraordinary journey.",
      image: "https://via.placeholder.com/120x160/F39C12/FFFFFF?text=Top+1",
      reviewSnippet:
        "Inspiring and beautifully written memoir that captivates from start to finish.",
    },
    {
      id: 2,
      title: "Educated",
      author: "Tara Westover",
      rating: 4.8,
      totalRatings: 12890,
      category: "Memoir",
      duration: "12h 10m",
      description:
        "A powerful memoir about education, family, and the struggle for self-invention.",
      image: "https://via.placeholder.com/120x160/E74C3C/FFFFFF?text=Top+2",
      reviewSnippet: "A gripping tale of transformation and the power of education.",
    },
    {
      id: 3,
      title: "The Body Keeps the Score",
      author: "Bessel van der Kolk",
      rating: 4.7,
      totalRatings: 9875,
      category: "Psychology",
      duration: "16h 17m",
      description:
        "Revolutionary understanding of how trauma affects the body and mind.",
      image: "https://via.placeholder.com/120x160/9B59B6/FFFFFF?text=Top+3",
      reviewSnippet: "Life-changing insights into trauma and recovery.",
    },
    {
      id: 4,
      title: "Untamed",
      author: "Glennon Doyle",
      rating: 4.6,
      totalRatings: 8234,
      category: "Self-Help",
      duration: "8h 56m",
      description: "A guide to discovering your truest, most beautiful life.",
      image: "https://via.placeholder.com/120x160/1ABC9C/FFFFFF?text=Top+4",
      reviewSnippet: "Empowering and authentic voice that resonates deeply.",
    },
    {
      id: 5,
      title: "The Midnight Library",
      author: "Matt Haig",
      rating: 4.5,
      totalRatings: 11567,
      category: "Fiction",
      duration: "8h 52m",
      description: "Between life and death lies a library of infinite possibilities.",
      image: "https://via.placeholder.com/120x160/3498DB/FFFFFF?text=Top+5",
      reviewSnippet: "Thought-provoking and beautifully crafted philosophical fiction.",
    },
  ];

  // Component Star
  const Star = ({ filled, half }) => {
    if (filled) return <span className="text-yellow-400">★</span>;
    if (half) {
      return (
        <span className="relative text-yellow-400">
          <span>★</span>
          <span className="absolute top-0 left-1/2 text-gray-400 overflow-hidden w-1/2">
            ★
          </span>
        </span>
      );
    }
    return <span className="text-gray-400">★</span>;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} filled />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" half />);
    }

    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(<Star key={`empty-${i}`} />);
    }

    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.8) return "text-green-400";
    if (rating >= 4.5) return "text-yellow-400";
    if (rating >= 4.0) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Sách được đánh giá cao nhất</h2>
        <div className="flex items-center text-yellow-400 text-sm">
          <RiThumbUpLine className="mr-1" />
          <span>Đánh giá từ người dùng</span>
        </div>
      </div>

      {/* Top 3 Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {topRatedBooks.slice(0, 3).map((book, index) => (
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
            {/* Medal */}
            <div className="absolute top-2 left-2 text-2xl">
              {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
            </div>

            <div className="text-center pt-6">
              <img
                src={book.image}
                alt={`${book.title} - ${book.author}`}
                className="w-20 h-28 object-cover rounded-lg mx-auto mb-3"
              />
              <h3 className="font-semibold text-white mb-2 line-clamp-2">
                {book.title}
              </h3>
              <p className="text-gray-200 text-sm mb-2">{book.author}</p>

              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-1 mr-2">
                  {renderStars(book.rating)}
                </div>
                <span className={`font-bold ${getRatingColor(book.rating)}`}>
                  {book.rating}
                </span>
              </div>

              <p className="text-xs text-gray-200 mb-3">
                {book.totalRatings.toLocaleString()} đánh giá
              </p>

              <button className="w-full bg-white bg-opacity-20 hover:bg-orange-500 hover:text-white text-white py-2 rounded-lg transition-colors flex items-center justify-center">
                <RiPlayCircleLine className="mr-2" />
                Nghe ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed List (chỉ lấy từ cuốn thứ 4 trở đi) */}
      <div className="space-y-4">
        {topRatedBooks.slice(3).map((book, index) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-4">
              {/* Rank */}
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

              {/* Book Image */}
              <div className="flex-shrink-0">
                <img
                  src={book.image}
                  alt={`${book.title} - ${book.author}`}
                  className="w-16 h-20 object-cover rounded"
                />
              </div>

              {/* Book Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <RiHeartLine size={18} />
                    </button>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors">
                      <RiPlayCircleLine size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {book.description}
                </p>

                {/* Rating Section */}
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(book.rating)}
                  </div>
                  <span
                    className={`font-bold text-lg ${getRatingColor(
                      book.rating
                    )}`}
                  >
                    {book.rating}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({book.totalRatings.toLocaleString()} đánh giá)
                  </span>
                </div>

                {/* Review Snippet */}
                <div className="bg-gray-800 p-3 rounded-lg mb-3">
                  <p className="text-gray-300 text-sm italic">
                    "{book.reviewSnippet}"
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="bg-gray-600 px-2 py-1 rounded">
                    {book.category}
                  </span>
                  <span>{book.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-6">
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
          Xem thêm sách đánh giá cao
        </button>
      </div>
    </div>
  );
}
