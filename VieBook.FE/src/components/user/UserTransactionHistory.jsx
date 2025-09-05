import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";

export default function UserTransactionHistory() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  const handleCloseModal = () => setSelectedBook(null);

  const books = [
    {
      id: 1,
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      narrator: "Derek Perkins",
      duration: "15h 17m",
      category: "History",
      rating: 4.8,
      reviews: 2847,
      price: 299000,
      oldPrice: 399000,
      type: "Audio",
      cover: "https://images-na.ssl-images-amazon.com/images/I/713jIoMO3UL.jpg",
      chapters: [
        { id: 1, name: "Chương 1: Khởi đầu", purchased: true },
        { id: 2, name: "Chương 2: Nông nghiệp", purchased: true },
        { id: 3, name: "Chương 3: Đế chế", purchased: false },
        { id: 4, name: "Chương 4: Cách mạng khoa học", purchased: false },
      ],
    },
    {
      id: 2,
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      narrator: "Patrick Egan",
      duration: "20h 2m",
      category: "Psychology",
      rating: 4.6,
      reviews: 1923,
      price: 259000,
      oldPrice: 349000,
      type: "Audio & Ebook",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71UypkUjStL.jpg",
      chapters: [
        { id: 1, name: "Chương 1: Hai hệ thống tư duy", purchased: true },
        { id: 2, name: "Chương 2: Trực giác", purchased: true },
        { id: 3, name: "Chương 3: Quyết định", purchased: true },
        { id: 4, name: "Chương 4: Sai lệch nhận thức", purchased: false },
      ],
    },
    {
      id: 3,
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      narrator: "Stephen R. Covey",
      duration: "13h 4m",
      category: "Self Development",
      rating: 4.7,
      reviews: 3251,
      price: 199000,
      oldPrice: null,
      type: "Ebook",
      cover: "https://images-na.ssl-images-amazon.com/images/I/71QKQ9mwV7L.jpg",
      chapters: [
        { id: 1, name: "Habit 1: Chủ động", purchased: true },
        { id: 2, name: "Habit 2: Bắt đầu với mục tiêu", purchased: true },
        { id: 3, name: "Habit 3: Ưu tiên quan trọng", purchased: true },
        { id: 4, name: "Habit 4: Win-Win", purchased: false },
      ],
    },
    // ⚡️ thêm vài sách mẫu để test phân trang
    {
      id: 4,
      title: "Book 4",
      author: "Author 4",
      narrator: "Narrator 4",
      duration: "10h",
      category: "Fiction",
      rating: 4.5,
      reviews: 1200,
      price: 150000,
      oldPrice: 200000,
      type: "Audio",
      cover: "https://placehold.co/200x300",
      chapters: [],
    },
    {
      id: 5,
      title: "Book 5",
      author: "Author 5",
      narrator: "Narrator 5",
      duration: "12h",
      category: "Business",
      rating: 4.2,
      reviews: 900,
      price: 180000,
      oldPrice: null,
      type: "Ebook",
      cover: "https://placehold.co/200x300",
      chapters: [],
    },
    {
      id: 6,
      title: "Book 6",
      author: "Author 6",
      narrator: "Narrator 6",
      duration: "8h",
      category: "Romance",
      rating: 4.0,
      reviews: 500,
      price: 120000,
      oldPrice: 150000,
      type: "Audio",
      cover: "https://placehold.co/200x300",
      chapters: [],
    },
    {
      id: 7,
      title: "Book 7",
      author: "Author 7",
      narrator: "Narrator 7",
      duration: "14h",
      category: "Science",
      rating: 4.9,
      reviews: 2000,
      price: 220000,
      oldPrice: 280000,
      type: "Audio",
      cover: "https://placehold.co/200x300",
      chapters: [],
    },
  ];

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lịch sử giao dịch</h2>

      {/* List books */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentBooks.map((book) => (
          <div
            key={book.id}
            className="flex bg-gray-800 rounded-lg p-4 space-x-4 cursor-pointer hover:bg-gray-700 transition"
            onClick={() => setSelectedBook(book)}
          >
            <img
              src={book.cover}
              alt={book.title}
              className="w-24 h-32 object-cover rounded"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400">By {book.author}</p>
                <p className="text-sm text-gray-400">
                  Narrated by {book.narrator}
                </p>
                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-400">
                  <i className="ri-time-line"></i>
                  <span>{book.duration}</span>
                  <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded">
                    {book.category}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-bold text-orange-400 mr-2">
                  {book.price.toLocaleString()}đ
                </span>
                {book.oldPrice && (
                  <span className="line-through text-gray-500">
                    {book.oldPrice.toLocaleString()}đ
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center space-x-2 mt-6">
        {/* Nút Trước */}
        <button
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>

        {/* Các số trang */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-4 py-2 rounded ${
              currentPage === page
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Nút Sau */}
        <button
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50"
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-3xl relative shadow-lg">
            {/* Close button (X) */}
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
                  <i className="ri-star-fill"></i>
                  <span>{selectedBook.rating}</span>
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
                    className={`p-3 rounded-lg text-sm text-center cursor-default ${
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
          </div>
        </div>
      )}
    </div>
  );
}
