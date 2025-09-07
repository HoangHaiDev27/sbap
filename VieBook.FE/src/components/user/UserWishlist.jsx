import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";

export default function UserWishlist() {
  // 🔹 Data mẫu
  const [wishlist] = useState([
    {
      id: 1,
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      narrator: "Derek Perkins",
      cover: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg",
      duration: "15h 17m",
      category: "History",
      price: "299,000đ",
      oldPrice: "399,000đ",
      rating: 4.8,
      reviews: 1234,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: true },
        { id: 3, name: "Chương 3", purchased: false },
      ],
    },
    {
      id: 2,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      narrator: "Patrick Egan",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81r+LN6GfLL.jpg",
      duration: "20h 2m",
      category: "Psychology",
      price: "259,000đ",
      oldPrice: "349,000đ",
      rating: 4.6,
      reviews: 987,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
        { id: 3, name: "Chương 3", purchased: false },
      ],
    },
    {
      id: 3,
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      narrator: "Stephen R. Covey",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg",
      duration: "13h 4m",
      category: "Self Development",
      price: "199,000đ",
      oldPrice: null,
      rating: 4.7,
      reviews: 543,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Thói quen 1", purchased: true },
        { id: 2, name: "Thói quen 2", purchased: true },
        { id: 3, name: "Thói quen 3", purchased: false },
      ],
    },
    {
      id: 4,
      title: "Atomic Habits",
      author: "James Clear",
      narrator: "James Clear",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
      duration: "11h 30m",
      category: "Self Development",
      price: "220,000đ",
      oldPrice: "280,000đ",
      rating: 4.9,
      reviews: 2345,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
    {
      id: 5,
      title: "Rich Dad Poor Dad",
      author: "Robert T. Kiyosaki",
      narrator: "Tim Wheeler",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81bsw6fnUiL.jpg",
      duration: "7h 5m",
      category: "Business",
      price: "180,000đ",
      oldPrice: "250,000đ",
      rating: 4.5,
      reviews: 678,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Bài học 1", purchased: true },
        { id: 2, name: "Bài học 2", purchased: false },
      ],
    },
    {
      id: 6,
      title: "The Subtle Art of Not Giving a F*ck",
      author: "Mark Manson",
      narrator: "Roger Wayne",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg",
      duration: "9h 30m",
      category: "Self Development",
      price: "210,000đ",
      oldPrice: "270,000đ",
      rating: 4.4,
      reviews: 1200,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
    {
      id: 7,
      title: "Deep Work",
      author: "Cal Newport",
      narrator: "Jeff Bottoms",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg",
      duration: "12h 15m",
      category: "Productivity",
      price: "230,000đ",
      oldPrice: null,
      rating: 4.7,
      reviews: 876,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
    {
      id: 8,
      title: "Can't Hurt Me",
      author: "David Goggins",
      narrator: "David Goggins",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71g2ednj0JL.jpg",
      duration: "13h 30m",
      category: "Motivation",
      price: "250,000đ",
      oldPrice: "320,000đ",
      rating: 4.8,
      reviews: 1500,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: true },
      ],
    },
    {
      id: 9,
      title: "Educated",
      author: "Tara Westover",
      narrator: "Julia Whelan",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81WojUxbbFL.jpg",
      duration: "12h 10m",
      category: "Biography",
      price: "240,000đ",
      oldPrice: null,
      rating: 4.6,
      reviews: 950,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
    {
      id: 10,
      title: "Becoming",
      author: "Michelle Obama",
      narrator: "Michelle Obama",
      cover: "https://images-na.ssl-images-amazon.com/images/I/81h2gWPTYJL.jpg",
      duration: "19h 3m",
      category: "Biography",
      price: "280,000đ",
      oldPrice: "350,000đ",
      rating: 4.9,
      reviews: 2000,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: true },
      ],
    },
    {
      id: 11,
      title: "The Power of Habit",
      author: "Charles Duhigg",
      narrator: "Mike Chamberlain",
      cover: "https://images-na.ssl-images-amazon.com/images/I/91bYsX41DVL.jpg",
      duration: "10h 45m",
      category: "Psychology",
      price: "200,000đ",
      oldPrice: "260,000đ",
      rating: 4.6,
      reviews: 1340,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
    {
      id: 12,
      title: "Man's Search for Meaning",
      author: "Viktor E. Frankl",
      narrator: "Simon Vance",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71V1Z6BpDgL.jpg",
      duration: "9h 5m",
      category: "Philosophy",
      price: "190,000đ",
      oldPrice: "240,000đ",
      rating: 4.8,
      reviews: 875,
      type: "Audiobook",
      chapters: [
        { id: 1, name: "Chương 1", purchased: true },
        { id: 2, name: "Chương 2", purchased: false },
      ],
    },
  ]);

  // 🔹 Phân trang
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(wishlist.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = wishlist.slice(startIndex, startIndex + itemsPerPage);

  // 🔹 Modal state
  const [selectedBook, setSelectedBook] = useState(null);

  const handleCloseModal = () => setSelectedBook(null);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Danh sách đã lưu</h2>

      {/* Grid 2 cuốn / hàng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="flex bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-24 h-32 object-cover rounded-lg"
            />
            <div className="ml-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-400">By {book.author}</p>
                <p className="text-sm text-gray-400">
                  Narrated by {book.narrator}
                </p>
                <p className="text-sm text-gray-400">{book.duration}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-orange-600 rounded">
                  {book.category}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-yellow-400 font-bold mr-2">
                  {book.price}
                </span>
                {book.oldPrice && (
                  <span className="text-gray-400 line-through">
                    {book.oldPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          Trước
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 rounded ${
              currentPage === i + 1
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          Sau
        </button>
      </div>

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl relative shadow-lg">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <RiCloseLine className="text-2xl" />
            </button>

            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                {selectedBook.type}
              </span>
            </div>

            {/* Thông tin sách */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              <img
                src={selectedBook.cover}
                alt={selectedBook.title}
                className="w-40 h-60 object-cover rounded mx-auto md:mx-0"
              />
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {selectedBook.title}
                </h3>
                <p className="text-gray-300">Tác giả: {selectedBook.author}</p>
                <p className="text-gray-300">
                  Narrated by: {selectedBook.narrator}
                </p>
                <p className="text-sm text-gray-400">
                  Thể loại:{" "}
                  <span className="bg-orange-600 px-2 py-0.5 rounded text-white text-xs">
                    {selectedBook.category}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  Thời lượng: {selectedBook.duration}
                </p>
                <div className="flex items-center space-x-2 text-yellow-400">
                  ⭐ <span>{selectedBook.rating}</span>
                  <span className="text-gray-400">
                    ({selectedBook.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Chapters */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                Danh sách chương
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedBook.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-lg text-sm text-center ${
                      ch.purchased
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {ch.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded text-white">
                Mua ngay
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
