import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiGridLine,
  RiListCheck,
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

  // Fetch sách đọc
  useEffect(() => {
    async function fetchBooks() {
      try {
        const data = await getReadBooks();
        setAudiobooks(data || []);
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    }
    fetchBooks();
  }, []);

  // --- Filter ---
  const filteredBooks = audiobooks.filter((book) => {
    // Chuẩn hóa categories về mảng
    const bookCats = Array.isArray(book.categories)
      ? book.categories.map((c) => c.trim())
      : typeof book.categories === "string"
      ? book.categories.split(",").map((c) => c.trim())
      : [];

    const matchCategory =
      selectedCategory === "Tất cả" || bookCats.includes(selectedCategory);

    const matchAuthor =
      selectedAuthor === "Tất cả" ||
      (book.author && book.author.trim() === selectedAuthor);

    const matchRating =
      selectedRating === 0 || (book.rating || 0) >= selectedRating;

    return matchCategory && matchAuthor && matchRating;
  });

  // --- Sort ---
  const sortedBooks = [...filteredBooks];
  switch (sortBy) {
    case "Phổ biến":
      sortedBooks.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      break;
    case "Mới nhất":
      sortedBooks.sort((a, b) => (b.id || 0) - (a.id || 0));
      break;
    case "Đang giảm giá":
      // Sách có promotion lên đầu, sau đó sort theo % giảm giá
      sortedBooks.sort((a, b) => {
        const aHasPromo = a.hasPromotion ? 1 : 0;
        const bHasPromo = b.hasPromotion ? 1 : 0;
        if (aHasPromo !== bHasPromo) return bHasPromo - aHasPromo;
        // Nếu cả 2 đều có promotion, sort theo % giảm
        return (b.discountValue || 0) - (a.discountValue || 0);
      });
      break;
    case "Giá thấp đến cao":
      sortedBooks.sort((a, b) => {
        const priceA = a.hasPromotion ? (a.discountedPrice || a.price || 0) : (a.price || 0);
        const priceB = b.hasPromotion ? (b.discountedPrice || b.price || 0) : (b.price || 0);
        return priceA - priceB;
      });
      break;
    case "Giá cao đến thấp":
      sortedBooks.sort((a, b) => {
        const priceA = a.hasPromotion ? (a.discountedPrice || a.price || 0) : (a.price || 0);
        const priceB = b.hasPromotion ? (b.discountedPrice || b.price || 0) : (b.price || 0);
        return priceB - priceA;
      });
      break;
    case "A-Z":
      sortedBooks.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "", "vi")
      );
      break;
    case "Z-A":
      sortedBooks.sort((a, b) =>
        (b.title || "").localeCompare(a.title || "", "vi")
      );
      break;
    default:
      break;
  }

  // --- Pagination ---
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = sortedBooks.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[80%]">
          {Array.isArray(book.categories) &&
            book.categories.map((category, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-purple-600 to-purple-400 
                          text-white px-2 py-0.5 rounded-full text-[10px] 
                          font-medium shadow-sm backdrop-blur-sm truncate"
              >
                {category}
              </span>
            ))}
        </div>

        {/* Promotion badge */}
        {book.hasPromotion && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              🎉 -{book.discountValue}%
            </span>
          </div>
        )}

        {/* Icon đọc */}
        <div className="absolute top-3 right-3">
          <span className="bg-gray/90 hover:bg-orange-500 hover:text-white text-orange-500 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm transition-all duration-300 cursor-pointer">
            <RiBookOpenLine className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <div className="p-4 flex flex-col h-[260px]">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors h-[56px] overflow-hidden line-clamp-2">
          {book.title}
        </h3>
        <p className="text-gray-400 text-sm mb-1 h-5 truncate">
          Tác giả: {book.author}
        </p>
        <div className="h-5 mb-2">
          <Rating rating={book.rating || 0} reviews={book.reviews || 0} />
        </div>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2 overflow-hidden">
          {book.description}
        </p>
        <div className="mt-auto">
          <BookFooter book={book} />
        </div>
      </div>
    </Link>
  );
}

// --- Row Component ---
function AudiobookRow({ book }) {
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
        <p className="text-gray-400 text-sm mb-1">Tác giả: {book.author}</p>
        <Rating rating={book.rating || 0} reviews={book.reviews || 0} />
        <div className="mt-auto">
          <BookFooter book={book} />
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
  const hasPromotion = book.hasPromotion;
  const originalPrice = book.price || 0;
  const discountedPrice = book.discountedPrice || originalPrice;
  
  return (
    <div className="flex items-end justify-between mt-2">
      <div className="flex flex-col gap-1">
        {/* Phần giá - luôn có min-height để đồng nhất */}
        <div className="min-h-[48px] flex flex-col justify-end gap-1">
          {hasPromotion ? (
            <>
              {/* Giá sau giảm */}
              <div className="flex items-center gap-1">
                <span className="text-orange-400 font-bold text-base flex items-center gap-1">
                  {discountedPrice.toLocaleString()}
                  <RiCoinLine className="text-yellow-400 w-4 h-4" />
                </span>
                {/* Badge giảm giá */}
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                  -{book.discountValue}%
                </span>
              </div>
              {/* Giá gốc gạch ngang */}
              <span className="text-gray-500 line-through text-sm flex items-center gap-1">
                {originalPrice.toLocaleString()}
                <RiCoinLine className="text-gray-500 w-3 h-3" />
              </span>
            </>
          ) : (
            <span className="text-orange-400 font-bold text-base flex items-center gap-1">
              <span>{originalPrice.toLocaleString()}</span>
              <RiCoinLine className="text-yellow-400 w-4 h-4" />
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{book.chapters} chương</span>
      </div>

      <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200 hover:scale-105">
        <RiBookOpenLine className="w-5 h-5" />
        <span>Đọc</span>
      </button>
    </div>
  );
}

// --- Pagination ---
function Pagination({ totalPages, currentPage, setCurrentPage }) {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
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
