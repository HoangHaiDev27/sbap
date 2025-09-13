import React, { useState } from "react";
import { RiEyeLine, RiHeartLine, RiHeartFill, RiThumbUpLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export default function TopRated() {
  const navigate = useNavigate();

  const allBooks = [
    {
      id: 1,
      title: "Becoming",
      author: "Michelle Obama",
      rating: 4.9,
      totalRatings: 15420,
      category: "Biography",
      duration: "19h 3m",
      description: "The former First Lady shares her extraordinary journey.",
      image: "https://picsum.photos/id/1011/200/300",
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
      image: "https://picsum.photos/id/1025/200/300",
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
      image: "https://picsum.photos/id/1035/200/300",
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
      image: "https://picsum.photos/id/1041/200/300",
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
      image: "https://picsum.photos/id/1056/200/300",
    },
    {
      id: 6,
      title: "Dune",
      author: "Frank Herbert",
      rating: 4.4,
      totalRatings: 9123,
      category: "Science Fiction",
      duration: "21h 10m",
      description:
        "The classic tale of politics, power, and sandworms on Arrakis.",
      image: "https://picsum.photos/id/1062/200/300",
    },
    {
      id: 7,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      rating: 4.7,
      totalRatings: 18450,
      category: "History",
      duration: "15h 30m",
      description: "A brief history of humankind.",
      image: "https://picsum.photos/id/1074/200/300",
    },
    {
      id: 8,
      title: "Atomic Habits",
      author: "James Clear",
      rating: 4.8,
      totalRatings: 21034,
      category: "Self-Improvement",
      duration: "11h 45m",
      description: "Tiny changes, remarkable results.",
      image: "https://picsum.photos/id/1084/200/300",
    },
    {
      id: 9,
      title: "The Alchemist",
      author: "Paulo Coelho",
      rating: 4.6,
      totalRatings: 24560,
      category: "Philosophy",
      duration: "6h 15m",
      description: "A journey about following your dreams.",
      image: "https://picsum.photos/id/109/200/300",
    },
    {
      id: 10,
      title: "1984",
      author: "George Orwell",
      rating: 4.5,
      totalRatings: 33450,
      category: "Dystopian",
      duration: "12h 20m",
      description: "A chilling prophecy about the future.",
      image: "https://picsum.photos/id/110/200/300",
    },
  ];

  const [books, setBooks] = useState(allBooks.map(b => ({ ...b, liked: false })));
  const [visibleCount, setVisibleCount] = useState(5);

  const toggleLike = (id) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, liked: !book.liked } : book));
  };

  const Star = ({ filled, half }) => {
    if (filled) return <span className="text-yellow-400">★</span>;
    if (half) return (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {visibleBooks.slice(0, 3).map((book, index) => (
          <div key={book.id} className={`relative rounded-xl p-4 ${
            index === 0 ? "bg-gradient-to-br from-yellow-600 to-yellow-800" :
            index === 1 ? "bg-gradient-to-br from-gray-500 to-gray-700" :
            "bg-gradient-to-br from-orange-600 to-orange-800"
          }`}>
            <div className="absolute top-2 left-2 text-2xl">
              {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
            </div>

            <div className="text-center pt-6">
              <img src={book.image} alt={`${book.title}`} className="w-20 h-28 object-cover rounded-lg mx-auto mb-3"/>
              <h3 className="font-semibold text-white mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-gray-200 text-sm mb-2">{book.author}</p>
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center space-x-1 mr-2">{renderStars(book.rating)}</div>
                <span className={`font-bold ${getRatingColor(book.rating)}`}>{book.rating}</span>
              </div>
              <p className="text-xs text-gray-200 mb-3">{book.totalRatings.toLocaleString()} đánh giá</p>
              <button onClick={() => navigate(`/bookdetails/${book.id}`)} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center">
                <RiEyeLine className="mr-2" /> Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {visibleBooks.slice(3).map((book, index) => (
          <div key={book.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col items-center pt-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? "bg-yellow-500 text-black" :
                  index === 1 ? "bg-gray-400 text-white" :
                  index === 2 ? "bg-orange-600 text-white" : "bg-gray-600 text-white"
                }`}>{index+4}</div>
              </div>
              <div className="flex-shrink-0">
                <img src={book.image} alt={book.title} className="w-16 h-20 object-cover rounded"/>
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{book.title}</h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => toggleLike(book.id)} className="p-2 transition-colors">
                      {book.liked ? (
                        <RiHeartFill size={18} className="text-red-500" />
                      ) : (
                        <RiHeartLine size={18} className="text-gray-400" />
                      )}
                    </button>
                    <button onClick={() => navigate(`/bookdetails/${book.id}`)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors text-sm">
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
          <button onClick={() => setVisibleCount(prev => prev+3)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
            Xem thêm sách đánh giá cao
          </button>
        </div>
      )}
    </div>
  );
}
