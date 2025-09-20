import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiGridLine,
  RiListCheck,
  RiTimeLine,
  RiHeartLine,
  RiHeartFill,
  RiStarFill,
  RiBookOpenLine
} from "react-icons/ri";
import { getReadBooks } from "../../api/bookApi";

export default function AudiobookGrid({
  selectedCategory,
  selectedDuration,
  sortBy,
  selectedRating,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
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
    if (selectedCategory && selectedCategory !== "Tất cả" && book.category !== selectedCategory) return false;

    if (selectedDuration && selectedDuration !== "Tất cả") {
      const hours = parseFloat(book.duration.split("h")[0]) || 0;
      switch (selectedDuration) {
        case "Dưới 3 giờ": if (hours >= 3) return false; break;
        case "3-6 giờ": if (hours < 3 || hours > 6) return false; break;
        case "6-10 giờ": if (hours < 6 || hours > 10) return false; break;
        case "10-15 giờ": if (hours < 10 || hours > 15) return false; break;
        case "Trên 15 giờ": if (hours <= 15) return false; break;
      }
    }

    if (selectedRating && selectedRating > 0 && book.rating < selectedRating) return false;

    return true;
  });

  // --- Sort ---
  const sortedBooks = [...filteredBooks];
  switch (sortBy) {
    case "Phổ biến": sortedBooks.sort((a,b) => b.reviews - a.reviews); break;
    case "Mới nhất": sortedBooks.sort((a,b) => b.id - a.id); break;
    case "Đánh giá cao": sortedBooks.sort((a,b) => b.rating - a.rating); break;
    case "Thời lượng ngắn": sortedBooks.sort((a,b) => parseFloat(a.duration) - parseFloat(b.duration)); break;
    case "Thời lượng dài": sortedBooks.sort((a,b) => parseFloat(b.duration) - parseFloat(a.duration)); break;
    case "A-Z": sortedBooks.sort((a,b) => a.title.localeCompare(b.title)); break;
    case "Z-A": sortedBooks.sort((a,b) => b.title.localeCompare(a.title)); break;
  }

  // --- Pagination ---
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = sortedBooks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">Hiển thị {filteredBooks.length} sách nói</p>
        <div className="flex space-x-2">
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            <RiGridLine className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            <RiListCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentBooks.map(book => <AudiobookCard key={book.id} book={book} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {currentBooks.map(book => <AudiobookRow key={book.id} book={book} />)}
        </div>
      )}

      {/* Empty */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <RiBookOpenLine className="text-6xl text-gray-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Không tìm thấy sách nói</h3>
          <p className="text-gray-500">Hãy thử thay đổi bộ lọc của bạn</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}

// --- Card Component ---
function AudiobookCard({ book }) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <Link to={`/reader/${book.id}`} className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group">
      <div className="relative">
        <img src={book.image} alt={book.title} className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 right-3">
          <span className="bg-green-600 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <RiBookOpenLine className="w-3 h-3" />
            <span>Đọc</span>
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <RiTimeLine className="w-3 h-3" />
            <span>{book.duration}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-2">{book.title}</h3>
        <p className="text-gray-400 text-sm mb-1">bởi {book.author}</p>
        <Rating rating={book.rating} reviews={book.reviews} />
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{book.description}</p>
        <BookFooter isFavorite={isFavorite} setIsFavorite={setIsFavorite} book={book} />
      </div>
    </Link>
  );
}

// --- Row Component ---
function AudiobookRow({ book }) {
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <Link to={`/reader/${book.id}`} className="flex bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group">
      <img src={book.image} alt={book.title} className="w-32 h-32 object-cover object-top" />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-1 group-hover:text-orange-400 transition-colors line-clamp-1">{book.title}</h3>
        <p className="text-gray-400 text-sm mb-1">bởi {book.author}</p>
        <Rating rating={book.rating} reviews={book.reviews} />
        <div className="mt-auto">
          <BookFooter isFavorite={isFavorite} setIsFavorite={setIsFavorite} book={book} />
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
      <span className="text-sm text-gray-400">{rating.toFixed(1)} ({reviews})</span>
    </div>
  );
}

// --- Footer ---
function BookFooter({ book, isFavorite, setIsFavorite }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-orange-400 font-semibold">{book.price.toLocaleString()}đ</span>
        <span className="text-xs text-gray-400">{book.chapters} chương</span>
      </div>
      <div className="flex space-x-2">
        <button className="text-orange-400 hover:text-orange-300 transition-colors">
          <RiBookOpenLine className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            setIsFavorite(!isFavorite);
          }}
          className={`transition-colors ${isFavorite ? "text-red-500" : "text-orange-400 hover:text-orange-300"}`}
        >
          {isFavorite ? <RiHeartFill className="w-5 h-5" /> : <RiHeartLine className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}

// --- Pagination Component ---
function Pagination({ totalPages, currentPage, setCurrentPage }) {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1} className={`px-3 py-1 rounded ${currentPage===1 ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"}`}>Trang trước</button>
      {Array.from({length: totalPages}).map((_,i) => (
        <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 rounded ${currentPage===i+1 ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{i+1}</button>
      ))}
      <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages} className={`px-3 py-1 rounded ${currentPage===totalPages ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"}`}>Trang sau</button>
    </div>
  );
}
