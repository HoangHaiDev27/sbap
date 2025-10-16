import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiGridLine,
  RiListCheck,
  RiTimeLine,
  RiHeartLine,
  RiHeartFill,
  RiStarFill,
  RiBookOpenLine,
  RiCoinLine,
} from "react-icons/ri";
import { getReadBooks } from "../../api/bookApi";

export default function AudiobookGrid({
  selectedCategory,
  sortBy,
  selectedRating,
  viewMode,
  selectedAuthor,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [audiobooks, setAudiobooks] = useState([]);
  

  useEffect(() => {
    async function fetchBooks() {
      try {
        const books = await getReadBooks();
        setAudiobooks(books);
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    }
    fetchBooks();
  }, []);

  // --- Filter ---
  const filteredBooks = audiobooks.filter((book) => {
    if (
      selectedCategory &&
      selectedCategory !== "Tất cả" &&
      book.category !== selectedCategory
    )
      return false;

    if (
      selectedAuthor &&
      selectedAuthor !== "Tất cả" &&
      book.author !== selectedAuthor
    )
      return false;

    if (selectedRating && selectedRating > 0 && book.rating < selectedRating)
      return false;

    return true;
  });

  // --- Sort ---
  const sortedBooks = [...filteredBooks];
  switch (sortBy) {
    case "Phổ biến":
      sortedBooks.sort((a, b) => b.reviews - a.reviews);
      break;
    case "Mới nhất":
      sortedBooks.sort((a, b) => b.id - a.id);
      break;
    case "A-Z":
      sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "Z-A":
      sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
      break;
    default:
      break;
  }

  // --- Pagination ---
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = sortedBooks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div>
      {/* Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentBooks.map((book) => (
            <AudiobookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentBooks.map((book) => (
            <AudiobookRow key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Empty */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <RiBookOpenLine className="text-6xl text-gray-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Không tìm thấy sách đọc
          </h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}

// --- Card Component ---
function AudiobookCard({ book }) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
   <Link
      to={`/bookdetails/${book.id}`}
      className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group h-full"
    >
      {/* Hình ảnh */}
      <div className="relative h-64">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Danh mục */}
        <div className="absolute top-3 left-3">
          <span className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-sm">
            {book.category}
          </span>
        </div>

        {/* Icon Đọc */}
        <div className="absolute top-3 right-3">
          <span className="bg-gray/90 hover:bg-orange-500 hover:text-white text-orange-500 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-all duration-300 cursor-pointer">
            <RiBookOpenLine className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Nội dung text */}
      <div className="p-4 flex flex-col h-[260px]"> 
        {/* h-[260px] = tổng chiều cao cố định phần nội dung */}
        
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors h-12 overflow-hidden line-clamp-2">
          {book.title}
        </h3>

        {/* Author */}
        <p className="text-gray-400 text-sm mb-1 h-5 truncate">
          bỏi {book.author}
        </p>

        {/* Rating */}
        <div className="h-5 mb-2">
          <Rating rating={book.rating} reviews={book.reviews} />
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-2 overflow-hidden">
          {book.description}
        </p>

        {/* Footer luôn cố định dưới */}
        <div className="mt-auto">
          <BookFooter
            isFavorite={isFavorite}
            setIsFavorite={setIsFavorite}
            book={book}
          />
        </div>
      </div>
    </Link>
  );
}

// --- Row Component ---
function AudiobookRow({ book }) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <Link
      to={`/bookdetails/${book.id}`}
      className="flex items-center bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group"
    >
      <img
        src={book.image}
        alt={book.title}
        className="w-32 h-32 object-cover object-center"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-gray-400 text-sm mb-1">bởi {book.author}</p>
        <Rating rating={book.rating} reviews={book.reviews} />
        <div className="mt-auto">
          <BookFooter
            isFavorite={isFavorite}
            setIsFavorite={setIsFavorite}
            book={book}
          />
        </div>
      </div>
    </Link>
  );
}

// --- Rating ---
function Rating({ rating, reviews }) {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <RiStarFill className="text-yellow-400 text-sm" />
      <span className="text-sm text-gray-400">
        {rating.toFixed(1)} ({reviews})
      </span>
    </div>
  );
}

// --- Footer ---
function BookFooter({ book }) {
  return (
    <div className="flex items-center justify-between mt-2">
      {/* Thông tin giá và chương */}
      <div className="flex flex-col">
        <span className="text-orange-400 font-semibold flex items-center space-x-1">
          <span>{book.price.toLocaleString()}</span>
          <RiCoinLine className="text-yellow-400 w-5 h-5" />
        </span>
        <span className="text-xs text-gray-400">{book.chapters} chương</span>
      </div>

      {/* Nút hành động */}
      <div className="flex space-x-2">
        <button
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-full shadow-md transition-all duration-200"
        >
          <RiBookOpenLine className="w-5 h-5" />
          <span>Đọc</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // setIsFavorite(!isFavorite);
          }}
        >
          {/* {isFavorite ? (
            <RiHeartFill className="w-5 h-5 text-red-500" />
          ) : (
            <RiHeartLine className="w-5 h-5 text-orange-400 hover:text-orange-300" />
          )} */}
        </button>
      </div>
    </div>
  );
}

// --- Pagination Component ---
function Pagination({ totalPages, currentPage, setCurrentPage }) {
  // Hàm sinh danh sách trang cần hiển thị
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 3) {
      // Nếu ít hơn 7 trang thì hiện hết
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Luôn hiện trang đầu, cuối, và 2 trang quanh currentPage
      pages.push(1);

      if (currentPage > 4) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center mt-6 space-x-2">
      {/* Nút Trang trước */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-gray-700 text-white hover:bg-gray-600"
        }`}
      >
        Trang trước
      </button>

      {/* Nút số trang */}
      {pageNumbers.map((num, i) =>
        num === "..." ? (
          <span key={i} className="px-3 py-1 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => setCurrentPage(num)}
            className={`px-3 py-1 rounded ${
              currentPage === num
                ? "bg-orange-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {num}
          </button>
        )
      )}

      {/* Nút Trang sau */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-gray-700 text-white hover:bg-gray-600"
        }`}
      >
        Trang sau
      </button>
    </div>
  );
}

