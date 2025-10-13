import { useState, useEffect, useCallback } from "react";
import ReviewStats from "../../components/owner/reviews/ReviewStats";
import ReviewFilters from "../../components/owner/reviews/ReviewFilters";
import ReviewItem from "../../components/owner/reviews/ReviewItem";
import { getOwnerReviews, getOwnerReviewStats, ownerReply } from "../../api/reviewApi";
import toast from "react-hot-toast";



export default function OwnerReviews() {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [replyStatusFilter, setReplyStatusFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const pageSize = 6;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch stats data (không bị ảnh hưởng bởi filter)
  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const statsData = await getOwnerReviewStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Không thể tải thống kê");
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch reviews data
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const response = await getOwnerReviews({ 
          rating: ratingFilter, 
          hasReply: replyStatusFilter,
          search: debouncedSearchTerm,
          page, 
          pageSize 
        });
        setReviewsData(response.reviews || []);
        setTotalCount(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Không thể tải đánh giá");
        setReviewsData([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [page, ratingFilter, replyStatusFilter, debouncedSearchTerm, pageSize]);

  const handleReply = async (reviewId, reply) => {
    try {
      await ownerReply(reviewId, reply);
      toast.success("Đã gửi phản hồi");
      
      // Refresh reviews data
      const response = await getOwnerReviews({ 
        rating: ratingFilter, 
        hasReply: replyStatusFilter,
        search: debouncedSearchTerm,
        page, 
        pageSize 
      });
      setReviewsData(response.reviews || []);
      setTotalCount(response.totalCount || 0);
      setTotalPages(response.totalPages || 1);
      
      // Refresh stats data
      const statsData = await getOwnerReviewStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error replying to review:", error);
      toast.error("Không thể gửi phản hồi");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Đánh giá & Phản hồi</h1>

      <ReviewStats stats={stats} loading={statsLoading} />
      <ReviewFilters 
        ratingFilter={ratingFilter} 
        replyStatusFilter={replyStatusFilter}
        searchTerm={searchTerm}
        onRatingFilterChange={setRatingFilter}
        onReplyStatusFilterChange={setReplyStatusFilter}
        onSearchTermChange={setSearchTerm}
        onFilterChange={() => setPage(1)}
      />

      {loading ? (
        <div className="text-center text-gray-400 py-8">Đang tải...</div>
      ) : reviewsData.length === 0 ? (
        <div className="text-center text-gray-400 py-8">Chưa có đánh giá nào</div>
      ) : (
        <div className="space-y-4">
          {reviewsData.map((review) => (
            <ReviewItem 
              key={review.reviewId} 
              review={review} 
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <div className="text-center text-gray-400 text-sm mb-4">
            Hiển thị {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} trong tổng số {totalCount} đánh giá
          </div>
          <div className="flex justify-center space-x-2">
            {/* Nút Trước */}
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-3 py-1 rounded text-sm ${page === 1
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Trước
            </button>

            {/* Các số trang - Smart pagination */}
            {(() => {
              const maxVisiblePages = 5;
              const pages = [];
              
              if (totalPages <= maxVisiblePages) {
                // Hiển thị tất cả nếu ít hơn hoặc bằng 5 trang
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`px-3 py-1 rounded text-sm ${page === i
                          ? "bg-orange-500 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                      {i}
                    </button>
                  );
                }
              } else {
                // Logic cho nhiều trang
                if (page <= 3) {
                  // Trang đầu: 1, 2, 3, 4, ..., last
                  for (let i = 1; i <= 4; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-1 rounded text-sm ${page === i
                            ? "bg-orange-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  );
                } else if (page >= totalPages - 2) {
                  // Trang cuối: 1, ..., last-3, last-2, last-1, last
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
                      className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      1
                    </button>
                  );
                  pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                  for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-1 rounded text-sm ${page === i
                            ? "bg-orange-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Trang giữa: 1, ..., current-1, current, current+1, ..., last
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setPage(1)}
                      className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      1
                    </button>
                  );
                  pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                  
                  for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-1 rounded text-sm ${page === i
                            ? "bg-orange-500 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setPage(totalPages)}
                      className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                    >
                      {totalPages}
                    </button>
                  );
                }
              }
              
              return pages;
            })()}

            {/* Nút Sau */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-3 py-1 rounded text-sm ${page === totalPages
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
