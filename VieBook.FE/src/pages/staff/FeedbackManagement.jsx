import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeedbackDetailModal from "../../components/staff/feedback/FeedbackDetailModal";
import FeedbackDeleteModal from "../../components/staff/feedback/FeedbackDeleteModal";
import { getAllBookReviews, getAllUserFeedbacks, deleteBookReview, deleteUserFeedback, getFeedbackStats } from "../../api/staffApi";
import toast from "react-hot-toast";

export default function FeedbackManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const bookIdParam = queryParams.get("bookId");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [bookFilter, setBookFilter] = useState(bookIdParam || null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, compliments: 0, bugs: 0 });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // sample avatar fallback
  const defaultAvatar =
    "https://drawcartoonstyle.com/wp-content/uploads/2022/07/10-Add-cute-blush-spots-to-the-frog-to-make-it-a-cute-chibi-frog.jpg";

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const search = debouncedSearch.trim() || null;
      const book = bookFilter ? parseInt(bookFilter) : null;
      const statsData = await getFeedbackStats(search, book);
      
      if (statsData && typeof statsData === 'object') {
        setStats({
          total: parseInt(statsData.total) || 0,
          compliments: parseInt(statsData.compliments) || 0,
          bugs: parseInt(statsData.bugs) || 0
        });
      } else {
        setStats({ total: 0, compliments: 0, bugs: 0 });
      }
    } catch (error) {
      setStats({ total: 0, compliments: 0, bugs: 0 });
    }
  }, [debouncedSearch, bookFilter]);

  const prevTypeFilterInFetchRef = useRef(typeFilter);
  const typeFilterJustChangedRef = useRef(false);

  useEffect(() => {
    if (prevTypeFilterInFetchRef.current !== typeFilter) {
      typeFilterJustChangedRef.current = true;
      prevTypeFilterInFetchRef.current = typeFilter;
    } else {
      typeFilterJustChangedRef.current = false;
    }
  }, [typeFilter]);

  // Fetch dữ liệu
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const search = debouncedSearch.trim() || null;
      const book = bookFilter ? parseInt(bookFilter) : null;
      
      const pageToFetch = typeFilterJustChangedRef.current ? 1 : currentPage;
      if (typeFilterJustChangedRef.current) {
        typeFilterJustChangedRef.current = false;
      }
      
      let allFeedbacks = [];
      let totalReviewsCount = 0;
      let totalFeedbacksCount = 0;

      if (typeFilter === "all" || typeFilter === "compliment") {
        try {
          if (typeFilter === "all") {
            const largePageSize = 1000;
            const reviewsResponse = await getAllBookReviews(1, largePageSize, search, book);
            
            if (reviewsResponse && reviewsResponse.data) {
              const mappedReviews = reviewsResponse.data.map(review => ({
                id: review.reviewId,
                user: review.userName || `User ${review.userId}`,
                email: review.email || "",
                avatar: review.avatarUrl || defaultAvatar,
                type: "compliment",
                content: review.comment || `Người dùng đánh giá ${review.rating} sao cho sách này.`,
                bookId: review.bookId,
                bookTitle: review.bookTitle || `Sách ID: ${review.bookId}`,
                submitDate: new Date(review.createdAt).toISOString().split('T')[0],
                status: review.ownerReply ? "reviewed" : "new",
                rating: review.rating,
                ownerReply: review.ownerReply,
                ownerReplyAt: review.ownerReplyAt
              }));
              allFeedbacks.push(...mappedReviews);
              totalReviewsCount = reviewsResponse.totalCount || 0;
            }
          } else {
            const reviewsResponse = await getAllBookReviews(pageToFetch, itemsPerPage, search, book);
            
            if (reviewsResponse && reviewsResponse.data) {
              const mappedReviews = reviewsResponse.data.map(review => ({
                id: review.reviewId,
                user: review.userName || `User ${review.userId}`,
                email: review.email || "",
                avatar: review.avatarUrl || defaultAvatar,
                type: "compliment",
                content: review.comment || `Người dùng đánh giá ${review.rating} sao cho sách này.`,
                bookId: review.bookId,
                bookTitle: review.bookTitle || `Sách ID: ${review.bookId}`,
                submitDate: new Date(review.createdAt).toISOString().split('T')[0],
                status: review.ownerReply ? "reviewed" : "new",
                rating: review.rating,
                ownerReply: review.ownerReply,
                ownerReplyAt: review.ownerReplyAt
              }));
              allFeedbacks.push(...mappedReviews);
              totalReviewsCount = reviewsResponse.totalCount || 0;
            }
          }
        } catch (error) {
        }
      }

      if (typeFilter === "all" || typeFilter === "bug_report") {
        try {
          if (typeFilter === "all") {
            const largePageSize = 1000;
            const feedbacksResponse = await getAllUserFeedbacks(1, largePageSize, search, book);
            
            if (feedbacksResponse && feedbacksResponse.data) {
              const mappedFeedbacks = feedbacksResponse.data
                .filter(fb => fb.targetType !== "System")
                .map(feedback => ({
                  id: feedback.feedbackId,
                  user: feedback.fromUserName || `User ${feedback.fromUserId}`,
                  email: feedback.fromUserEmail || "",
                  avatar: feedback.fromUserAvatarUrl || defaultAvatar,
                  type: "bug_report",
                  content: feedback.content || "",
                  bookId: feedback.targetType === "Book" ? feedback.targetId : null,
                  bookTitle: feedback.targetType === "Book" ? (feedback.targetBookTitle || `Sách ID: ${feedback.targetId}`) : null,
                  submitDate: new Date(feedback.createdAt).toISOString().split('T')[0],
                  status: "new"
                }));
              allFeedbacks.push(...mappedFeedbacks);
              totalFeedbacksCount = feedbacksResponse.totalCount || 0;
            }
          } else {
            const feedbacksResponse = await getAllUserFeedbacks(pageToFetch, itemsPerPage, search, book);
            
            if (feedbacksResponse && feedbacksResponse.data) {
              const mappedFeedbacks = feedbacksResponse.data
                .filter(fb => fb.targetType !== "System")
                .map(feedback => ({
                  id: feedback.feedbackId,
                  user: feedback.fromUserName || `User ${feedback.fromUserId}`,
                  email: feedback.fromUserEmail || "",
                  avatar: feedback.fromUserAvatarUrl || defaultAvatar,
                  type: "bug_report",
                  content: feedback.content || "",
                  bookId: feedback.targetType === "Book" ? feedback.targetId : null,
                  bookTitle: feedback.targetType === "Book" ? (feedback.targetBookTitle || `Sách ID: ${feedback.targetId}`) : null,
                  submitDate: new Date(feedback.createdAt).toISOString().split('T')[0],
                  status: "new"
                }));
              allFeedbacks.push(...mappedFeedbacks);
              totalFeedbacksCount = feedbacksResponse.totalCount || 0;
            }
          }
        } catch (error) {
        }
      }

      allFeedbacks.sort((a, b) => new Date(b.submitDate) - new Date(a.submitDate));
      
      let finalTotalCount = 0;
      let finalTotalPages = 1;
      
      if (typeFilter === "all") {
        finalTotalCount = totalReviewsCount + totalFeedbacksCount;
        finalTotalPages = Math.max(1, Math.ceil(finalTotalCount / itemsPerPage));
        
        const startIndex = (pageToFetch - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedFeedbacks = allFeedbacks.slice(startIndex, endIndex);
        setFeedbacks(paginatedFeedbacks);
      } else {
        setFeedbacks(allFeedbacks);
        if (typeFilter === "compliment") {
          finalTotalCount = totalReviewsCount;
          finalTotalPages = Math.max(1, Math.ceil(totalReviewsCount / itemsPerPage));
        } else {
          finalTotalCount = totalFeedbacksCount;
          finalTotalPages = Math.max(1, Math.ceil(totalFeedbacksCount / itemsPerPage));
        }
      }
      
      setTotalCount(finalTotalCount);
      setTotalPages(finalTotalPages);
    } catch (error) {
      toast.error(`Không thể tải dữ liệu đánh giá: ${error.message || "Lỗi không xác định"}`);
      setFeedbacks([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, typeFilter, bookFilter, itemsPerPage]);

  useEffect(() => {
    setBookFilter(bookIdParam);
  }, [bookIdParam]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Reset page khi filter thay đổi
  const prevFiltersRef = useRef({ debouncedSearch, typeFilter, bookFilter });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filterChanged = 
      prev.debouncedSearch !== debouncedSearch ||
      prev.typeFilter !== typeFilter ||
      prev.bookFilter !== bookFilter;
    
    if (filterChanged) {
      setCurrentPage(1);
      prevFiltersRef.current = { debouncedSearch, typeFilter, bookFilter };
    }
  }, [debouncedSearch, typeFilter, bookFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (totalPages > 0) {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    } else if (currentPage > 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const compliments = stats.compliments;
  const bugs = stats.bugs;

  const handleClearBookFilter = () => {
    setBookFilter(null);
    navigate("/staff/feedback");
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteModalOpen(true);
  };

  // Xóa feedback
  const confirmDelete = async (id) => {
    if (!feedbackToDelete) return;

    try {
      if (feedbackToDelete.type === "compliment") {
        await deleteBookReview(id);
        toast.success("Xóa đánh giá sách thành công");
      } else if (feedbackToDelete.type === "bug_report") {
        await deleteUserFeedback(id);
        toast.success("Xóa báo lỗi thành công");
      } else {
        toast.error("Không xác định được loại feedback cần xóa");
        return;
      }

      setDeleteModalOpen(false);
      setFeedbackToDelete(null);

      await fetchStats();
      await fetchData();
    } catch (error) {
      toast.error(`Xóa đánh giá thất bại: ${error.message || "Lỗi không xác định"}`);
    }
  };

  // Handle delete from detail modal
  const handleDeleteFromDetail = (id) => {
    const target = feedbacks.find((f) => f.id === id);
    if (target) {
      setFeedbackToDelete(target);
      setShowModal(false);
      setDeleteModalOpen(true);
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "compliment":
        return "Đánh giá sách";
      case "bug_report":
        return "Báo lỗi";
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "compliment":
        return "bg-green-100 text-green-800";
      case "bug_report":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "Mới";
      case "reviewed":
        return "Đã xem";
      default:
        return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "compliment":
        return "ri-thumb-up-line";
      case "bug_report":
        return "ri-bug-line";
      default:
        return "ri-message-2-line";
    }
  };

  if (loading) {
    return (
      <div className="pt-30 p-6 bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-30 p-6 bg-gray-50 text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Đánh giá</h2>
      <p className="text-gray-600 mb-6">Xem và quản lý đánh giá từ người dùng</p>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng đánh giá</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{compliments}</div>
          <div className="text-gray-600 text-sm">Đánh giá sách</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{bugs}</div>
          <div className="text-gray-600 text-sm">Báo lỗi</div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Tìm kiếm đánh giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 text-gray-900 placeholder-gray-500"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="all">Tất cả loại</option>
              <option value="compliment">Đánh giá sách</option>
              <option value="bug_report">Báo lỗi</option>
            </select>

            {bookFilter && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                  Đang lọc theo sách ID: <b>{bookFilter}</b>
                </span>
                <button
                  onClick={handleClearBookFilter}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                >
                  Bỏ lọc sách
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách feedback */}
        <div className="divide-y divide-gray-200">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover object-top"
                    src={feedback.avatar}
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {feedback.user}
                        </h4>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            feedback.type
                          )}`}
                        >
                          <i
                            className={`${getTypeIcon(
                              feedback.type
                            )} mr-1 w-3 h-3 flex items-center justify-center`}
                          ></i>
                          {getTypeText(feedback.type)}
                        </span>
                        {feedback.status !== "new" && (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              feedback.status
                            )}`}
                          >
                            {getStatusText(feedback.status)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {feedback.submitDate}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {feedback.content}
                    </p>
                    {feedback.bookTitle && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Sách liên quan: </span>
                        <span className="text-sm font-medium text-blue-600">
                          {feedback.bookTitle}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(feedback)}
                        className="text-blue-600 hover:text-blue-700 text-lg cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(feedback)}
                        className="text-red-600 hover:text-red-700 text-lg cursor-pointer"
                        title="Xóa đánh giá"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-gray-500 text-center">Không có đánh giá nào</p>
          )}
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <p className="text-sm text-gray-600">
              Trang {currentPage}/{totalPages}
            </p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1 || totalPages === 0}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                Trước
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={currentPage >= totalPages || totalPages === 0}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popup chi tiết */}
      {showModal && selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setShowModal(false)}
          onDelete={handleDeleteFromDetail}
          getTypeText={getTypeText}
          getTypeColor={getTypeColor}
          getTypeIcon={getTypeIcon}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />
      )}

      {deleteModalOpen && feedbackToDelete && (
        <FeedbackDeleteModal
          feedback={feedbackToDelete}
          onConfirm={() => confirmDelete(feedbackToDelete.id)}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
