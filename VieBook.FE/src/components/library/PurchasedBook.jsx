import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderItemApi from "../../api/orderItemApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";

export default function PurchasedBook() {
  const { user, userId, isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null); // 🔹 Modal state
  const [purchasedChapters, setPurchasedChapters] = useState([]); // 🔹 Chapters modal state
  const [allBooks, setAllBooks] = useState([]); // 🔹 Store all books from API
  const [filteredBooks, setFilteredBooks] = useState([]); // 🔹 Books after search/filter
  const [purchasedBooks, setPurchasedBooks] = useState([]); // 🔹 Current page books
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 Search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const booksPerPage = 6;

  // Fetch all purchased books from API (no pagination)
  const fetchPurchasedBooks = async () => {
    if (!isAuthenticated || !userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderItemApi.getPurchasedBooks(userId, {
        timeFilter,
        sortBy
      });
      
      if (response.success) {
        setAllBooks(response.data);
        console.log('API Response:', { 
          dataLength: response.data.length,
          timeFilter,
          sortBy
        });
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

  // Load data when component mounts or filter/sort changes
  useEffect(() => {
    fetchPurchasedBooks();
  }, [isAuthenticated, userId, timeFilter, sortBy]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBooks(allBooks);
    } else {
      const filtered = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchTerm, allBooks]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const currentBooks = filteredBooks.slice(startIndex, endIndex);
    
    setPurchasedBooks(currentBooks);
    setTotalPages(Math.ceil(filteredBooks.length / booksPerPage));
  }, [filteredBooks, currentPage, booksPerPage]);

  // Handle filter and sort changes
  const handleTimeFilterChange = (newTimeFilter) => {
    setTimeFilter(newTimeFilter);
    setCurrentPage(1); // Reset to first page when filter changes
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to first page when sort changes
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Build page numbers with ellipsis for advanced pagination
  const buildPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const add = (p) => pages.push(p);
    add(1);
    if (currentPage > 4) add("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) add(p);
    if (currentPage < totalPages - 3) add("...");
    add(totalPages);
    return pages;
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="text-center py-12">
        <i className="ri-user-line text-6xl text-gray-600 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          Vui lòng đăng nhập để xem sách đã mua
        </h3>
        <p className="text-gray-500 mb-4">
          Đăng nhập để xem danh sách sách đã mua của bạn
        </p>
        <button 
          onClick={() => window.location.href = '/auth'}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg text-white font-medium"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Sách đã mua</h2>
            {!loading && !error && (
              <span className="text-sm text-gray-400">
                ({filteredBooks.length} sách)
              </span>
            )}
          </div>
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
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Trước
          </button>
          {buildPageNumbers().map((p, idx) => (
            typeof p === "number" ? (
              <button
                key={`p-${p}`}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded ${
                  currentPage === p ? "bg-orange-500 text-white" : "bg-gray-700 text-gray-300"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={`e-${idx}`} className="px-2 text-gray-400">{p}</span>
            )
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {!loading && !error && purchasedBooks.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-shopping-bag-line text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Chưa có sách đã mua nào
          </h3>
          <p className="text-gray-500 mb-4">
            Khám phá và mua sách yêu thích để xây dựng thư viện riêng
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg text-white font-medium"
          >
            Khám phá sách hay
          </button>
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
