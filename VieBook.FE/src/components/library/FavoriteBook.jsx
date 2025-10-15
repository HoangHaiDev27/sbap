import React, { useEffect, useState } from "react";
import { getMyWishlist, removeFromWishlist } from "../../api/wishlistApi";
import { Link, useNavigate } from "react-router-dom";
import { getUserId } from "../../api/authApi";
import { RiCloseLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { dispatchWishlistChangeDelayed } from "../../utils/wishlistEvents";

export default function FavoriteBook() {
  const [filter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const itemsPerPage = 6;

  const [favoriteBooks, setFavoriteBooks] = useState([]);

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      await removeFromWishlist(bookId);
      setFavoriteBooks(prev => prev.filter(b => b.id !== bookId));
      toast.success("Đã gỡ khỏi danh sách yêu thích");
      // Dispatch event to update wishlist count
      dispatchWishlistChangeDelayed();
    } catch {
      toast.error("Có lỗi khi gỡ khỏi danh sách yêu thích");
    }
  };

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
      navigate("/auth");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const books = await getMyWishlist();
        // Map backend Book -> UI fields
        const mapped = (books || []).map((b) => ({
          id: b.bookId,
          title: b.title,
          author: b.author || b.owner?.userProfile?.fullName || b.owner?.email || "Tác giả",
          cover: b.coverUrl,
          categories: Array.isArray(b.categories) ? b.categories.map(c => c.name) : [],
          rating: Array.isArray(b.bookReviews) && b.bookReviews.length > 0
            ? (b.bookReviews.reduce((s, r) => s + (r.rating || 0), 0) / b.bookReviews.length).toFixed(1)
            : "-",
          duration: Array.isArray(b.chapters) && b.chapters.length > 0
            ? `${Math.round((b.chapters.reduce((s, c) => s + (c.durationSec || 0), 0) / 60))} phút`
            : "",
          dateAdded: new Date(b.createdAt).toLocaleDateString(),
          lastAccessed: new Date(b.updatedAt || b.createdAt).toLocaleDateString(),
          progress: 0,
          isPremium: false,
          isOwned: false,
          status: "wishlist",
        }));
        setFavoriteBooks(mapped);
      } catch {
        setError("Không tải được danh sách Yêu thích");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // 🔹 Filter
  const getFilteredBooks = () => {
    switch (filter) {
      case "all":
        return favoriteBooks;
      default:
        return favoriteBooks.filter((b) => b.categories?.includes(filter));
    }
  };
  const filteredBooks = getFilteredBooks().filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (b.title || "").toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // 🔹 Badges
  const getStatusBadge = (status) => {
    if (status === "completed")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          Đã hoàn thành
        </span>
      );
    if (status === "reading")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
          Đang đọc
        </span>
      );
    if (status === "wishlist")
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          Muốn đọc
        </span>
      );
    return null;
  };

  // Removed unused getAccessBadge

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 70) return "bg-blue-500";
    if (progress >= 40) return "bg-orange-500";
    return "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {loading && <div className="text-gray-300">Đang tải danh sách yêu thích...</div>}
      {error && <div className="text-red-400">{error}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Sách yêu thích</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên hoặc tác giả..."
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentBooks.map((book) => (
          <div
            key={book.id}
            className="bg-gray-800 rounded-xl p-4 flex flex-col hover:bg-gray-700 transition-colors relative"
          >
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromWishlist(book.id);
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-colors z-10"
              title="Gỡ khỏi danh sách yêu thích"
            >
              <RiCloseLine size={14} />
            </button>

            {/* Nội dung chính */}
            <div className="flex gap-4 pr-8">
              {/* Cover */}
              <img
                src={book.cover}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
              />

              {/* Thông tin sách */}
              <div className="flex-1 flex flex-col min-w-0">
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-300 mb-2 truncate">{book.author}</p>

                {/* Badge */}
                <div className="flex items-center flex-wrap gap-1 mb-2">
                  {(book.categories || []).slice(0, 2).map((c) => (
                    <span key={c} className="px-2 py-0.5 text-xs bg-gray-600 text-gray-300 rounded-full">
                      {c}
                    </span>
                  ))}
                  {getStatusBadge(book.status)}
                </div>

                {/* Tiến độ */}
                {book.progress > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>
                        Chương {Math.ceil((book.progress / 100) * 12)}
                      </span>
                      <span>{book.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(
                          book.progress
                        )}`}
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Thời lượng – rating – ngày thêm */}
                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                  <span className="truncate">{book.duration}</span>
                  <span className="truncate">⭐ {book.rating}</span>
                  <span className="truncate">{book.dateAdded}</span>
                </div>
              </div>
            </div>

            {/* Nút hành động full width */}
            <Link
              to={`/bookdetails/${book.id}`}
              className="mt-4 w-full py-2 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 text-center"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
    </div>
  );
}
