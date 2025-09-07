import React from "react";

export default function NewReleases() {
  const newBooks = [
    {
      id: 1,
      title: "The Atlas Six",
      author: "Olivie Blake",
      releaseDate: "2024-01-15",
      category: "Fantasy",
      duration: "12h 45m",
      description: "Six young magicians are chosen to compete for a place in an ancient society.",
      image: "https://via.placeholder.com/120x160/667EEA/FFFFFF?text=New+1",
      isNew: true,
    },
    {
      id: 2,
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      releaseDate: "2024-01-12",
      category: "Science Fiction",
      duration: "8h 20m",
      description: "An artificial friend observes the world with increasing fascination.",
      image: "https://via.placeholder.com/120x160/F093FB/FFFFFF?text=New+2",
      isNew: true,
    },
    {
      id: 3,
      title: "The Midnight Library",
      author: "Matt Haig",
      releaseDate: "2024-01-10",
      category: "Philosophy",
      duration: "6h 15m",
      description: "Between life and death there is a library with infinite possibilities.",
      image: "https://via.placeholder.com/120x160/4ECDC4/FFFFFF?text=New+3",
      isNew: true,
    },
    {
      id: 4,
      title: "The Invisible Life of Addie LaRue",
      author: "V.E. Schwab",
      releaseDate: "2024-01-08",
      category: "Fantasy Romance",
      duration: "17h 30m",
      description: "A woman cursed to be forgotten by everyone she meets.",
      image: "https://via.placeholder.com/120x160/A8E6CF/000000?text=New+4",
      isNew: false,
    },
    {
      id: 5,
      title: "Project Hail Mary",
      author: "Andy Weir",
      releaseDate: "2024-01-05",
      category: "Science Fiction",
      duration: "16h 10m",
      description: "A lone astronaut must save humanity from extinction.",
      image: "https://via.placeholder.com/120x160/FFB6C1/000000?text=New+5",
      isNew: false,
    },
  ];

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

  // SVG Icons
  const CalendarIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 
        002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 
        2 0 002 2z"
      />
    </svg>
  );

  const NewIcon = ({ className }) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M10 2a8 8 0 100 16 8 8 0 
      000-16zm3.707 9.293l-4-4a1 1 0 
      00-1.414 1.414L11.586 12H9a1 1 0 
      100 2h5a1 1 0 001-1v-5a1 1 0 
      10-2 0v2.586z" />
    </svg>
  );

  const PlayIcon = ({ className }) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M6 4l12 6-12 6V4z" />
    </svg>
  );

  const HeartIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 
        016.364 0L12 7.636l1.318-1.318a4.5 
        4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 
        4.5 0 010-6.364z"
      />
    </svg>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Sách mới phát hành</h2>
        <div className="flex items-center text-blue-400 text-sm">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>Cập nhật hàng ngày</span>
        </div>
      </div>

      {/* Featured New Releases */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {newBooks.slice(0, 3).map((book) => (
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
                <span>{formatDate(book.releaseDate)}</span>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Nghe ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Complete List */}
      <div className="space-y-4">
        {newBooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-start space-x-4">
              {/* Book Image */}
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

              {/* Book Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{book.title}</h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <HeartIcon className="w-5 h-5" />
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {book.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span className="bg-gray-600 px-2 py-1 rounded">
                      {book.category}
                    </span>
                    <span>{book.duration}</span>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(book.releaseDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-6">
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
          Xem thêm sách mới
        </button>
      </div>
    </div>
  );
}
