import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderItemApi from "../../api/orderItemApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function PurchasedBook() {
  const { user, userId } = useCurrentUser();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null); // 🔹 Modal state
  const [purchasedChapters, setPurchasedChapters] = useState([]); // 🔹 Chapters modal state
  const [purchasedBooks, setPurchasedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // 🔹 Store all books for search
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 Search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const booksPerPage = 6;

  // Fetch purchased books from API
  const fetchPurchasedBooks = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderItemApi.getPurchasedBooks(userId, {
        page: currentPage,
        pageSize: booksPerPage,
        timeFilter,
        sortBy
      });
      
      if (response.success) {
        setAllBooks(response.data);
        setPurchasedBooks(response.data);
        // Calculate total pages based on response
        setTotalPages(Math.ceil(response.data.length / booksPerPage));
      } else {
        setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching purchased books:", err);
      setError("Không thể tải danh sách sách đã mua");
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or dependencies change
  useEffect(() => {
    fetchPurchasedBooks();
  }, [userId, currentPage, timeFilter, sortBy]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setPurchasedBooks(allBooks);
    } else {
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPurchasedBooks(filtered);
    }
  }, [searchTerm, allBooks]);

  // Handle filter and sort changes
  const handleTimeFilterChange = (newTimeFilter) => {
    setTimeFilter(newTimeFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Fetch purchased chapters for a specific book
  const fetchPurchasedChapters = async (bookId) => {
    if (!userId) return;
    
    try {
      const response = await orderItemApi.getPurchasedChapters(userId, bookId);
      if (response.success) {
        setPurchasedChapters(response.data);
      }
    } catch (err) {
      console.error("Error fetching purchased chapters:", err);
    }
  };

  // Handle book click to show chapters
  const handleBookClick = async (book) => {
    setSelectedBook(book);
    await fetchPurchasedChapters(book.bookId);
  };

  // Handle view details button click
  const handleViewDetails = (book) => {
    navigate(`/bookdetails/${book.bookId}`);
  };

  const getFormatBadge = (format) => {
    if (format.includes("+")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          Combo
        </span>
      );
    } else if (format.includes("audiobook")) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Sách nói
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          E-book
        </span>
      );
    }
  };

  // Format purchase date for display
  const formatPurchaseDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Ngày không xác định";
      }
      return date.toLocaleDateString("vi-VN", {
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      console.error('Error formatting purchase date:', error, dateString);
      return "Ngày không xác định";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold">Sách đã mua</h2>
          <div className="w-full sm:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 w-full"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-8 w-full"
            >
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="price_high">Giá cao → thấp</option>
              <option value="price_low">Giá thấp → cao</option>
            </select>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm sách theo tên, tác giả hoặc thể loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="text-gray-400 mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <h3 className="text-lg font-medium text-red-400 mb-2">Có lỗi xảy ra</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchPurchasedBooks}
            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedBooks.map((book) => (
          <div
            key={book.orderItemId}
            onClick={() => handleBookClick(book)} // 🔹 Mở modal khi click card
            className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-colors group cursor-pointer"
          >
            <div className="flex space-x-4">
              <div className="relative">
                <img
                  src={book.coverUrl || "https://via.placeholder.com/200x280?text=No+Image"}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate mb-1">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{book.author}</p>

                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                    {book.category || "Không xác định"}
                  </span>
                  {getFormatBadge(book.format || "ebook")}
                </div>

                <div className="space-y-1 text-xs text-gray-400 mb-2">
                  <div className="flex justify-between">
                    <span>Giá:</span>
                    <span className="text-green-400 font-semibold">
                      {book.unitPrice?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chapter:</span>
                    <span className="text-blue-400 font-semibold">
                      {book.purchasedChapters || 0}/{book.totalChapters || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span>{book.duration || "Không xác định"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dung lượng:</span>
                    <span>{book.size || "Không xác định"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    <i className="ri-star-fill text-yellow-400 mr-1"></i>
                    {book.rating?.toFixed(1) || "N/A"}
                  </span>
                  <span>
                    {formatPurchaseDate(book.paidAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {!loading && !error && purchasedBooks.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-shopping-bag-line text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Chưa có sách nào
          </h3>
          <p className="text-gray-500 mb-4">
            Khám phá và mua sách yêu thích để xây dựng thư viện riêng
          </p>
        </div>
      )}

      {/* 🔹 Modal chi tiết sách */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-full max-w-2xl rounded-lg p-6 relative">
            {/* Nút đóng */}
            <button
              onClick={() => {
                setSelectedBook(null);
                setPurchasedChapters([]);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>

            {/* Nội dung */}
            <div className="flex space-x-6">
              <img
                src={selectedBook.coverUrl || "https://via.placeholder.com/200x280?text=No+Image"}
                alt={selectedBook.title}
                className="w-36 h-52 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedBook.title}
                </h2>
                <p className="text-gray-400 mb-2">{selectedBook.author}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedBook.category || "Không xác định"} • {selectedBook.format || "ebook"}
                </p>
                <div className="text-green-400 font-semibold mb-4">
                  {selectedBook.unitPrice?.toLocaleString("vi-VN")}đ
                </div>
                <button 
                  onClick={() => handleViewDetails(selectedBook)}
                  className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Danh sách chương đã mua */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Chapter đã mua ({purchasedChapters.length}/{selectedBook.totalChapters || 0})
              </h3>
              {purchasedChapters.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {purchasedChapters.map((chapter) => (
                      <li key={chapter.orderItemId} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <div>
                          <span className="font-medium">{chapter.chapterTitle}</span>
                          <div className="text-xs text-gray-400 mt-1">
                            {chapter.orderType} • {chapter.duration} • {chapter.unitPrice?.toLocaleString("vi-VN")}đ
                          </div>
                        </div>
                        <div className="text-xs text-green-400">
                          {formatPurchaseDate(chapter.paidAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Chưa có chapter nào được mua</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
