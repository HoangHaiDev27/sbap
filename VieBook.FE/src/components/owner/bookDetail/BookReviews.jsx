import { useEffect, useMemo, useState } from "react";
import { getReviewsByBook, ownerReplyReview } from "../../../api/bookApi";

const PAGE_SIZE = 5;

// eslint-disable-next-line no-unused-vars
export default function BookReviews({ bookId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // All reviews for client-side filtering
  const [ratingFilter, setRatingFilter] = useState("all"); // all | 1..5
  const [repliedFilter, setRepliedFilter] = useState("all"); // all | replied | not
  const [totalPages, setTotalPages] = useState(1); // Estimated total pages

  // Reset when bookId changes
  useEffect(() => {
    setTotalPages(1);
    setCurrentPage(1);
    setAllItems([]);
  }, [bookId]);

  // Load all reviews when repliedFilter is active (for proper filtering)
  useEffect(() => {
    if (repliedFilter === "all") {
      // If filter is "all", use normal pagination
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    
    // Load all reviews when filtering by replied/not replied
    const loadAllReviews = async () => {
      try {
        const allReviews = [];
        let page = 1;
        let hasMore = true;
        const ratingParam = ratingFilter !== "all" ? Number(ratingFilter) : null;
        
        while (hasMore) {
          const data = await getReviewsByBook(Number(bookId), { 
            page, 
            pageSize: 50, // Load in larger chunks
            rating: ratingParam 
          });
          
          if (!mounted) return;
          
          const reviews = Array.isArray(data) ? data : [];
          if (reviews.length === 0) {
            hasMore = false;
          } else {
            allReviews.push(...reviews);
            if (reviews.length < 50) {
              hasMore = false;
            } else {
              page++;
            }
          }
        }
        
        if (!mounted) return;
        setAllItems(allReviews);
        setCurrentPage(1); // Reset to first page
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Không lấy được đánh giá");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadAllReviews();
    return () => { mounted = false; };
  }, [bookId, ratingFilter, repliedFilter]);

  // Normal pagination when repliedFilter is "all"
  useEffect(() => {
    if (repliedFilter !== "all") {
      // Skip this effect when using client-side filter
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);
    const ratingParam = ratingFilter !== "all" ? Number(ratingFilter) : null;
    getReviewsByBook(Number(bookId), { page: currentPage, pageSize: PAGE_SIZE, rating: ratingParam })
      .then(async (data) => {
        if (!mounted) return;
        const reviews = Array.isArray(data) ? data : [];
        setItems(reviews);
        
        // Estimate totalPages: if we got full page, there might be more
        // If less than PAGE_SIZE, this is the last page
        if (reviews.length === PAGE_SIZE) {
          // If we're on page 1, check page 2 in background to estimate total pages
          if (currentPage === 1) {
            try {
              const page2Data = await getReviewsByBook(Number(bookId), { 
                page: 2, 
                pageSize: PAGE_SIZE, 
                rating: ratingParam 
              });
              if (!mounted) return;
              const page2Reviews = Array.isArray(page2Data) ? page2Data : [];
              
              if (page2Reviews.length === PAGE_SIZE) {
                // Both page 1 and 2 are full, estimate more pages
                // Keep checking pages until we find the last one
                let estimatedPages = 2;
                let checkPage = 3;
                let hasMore = true;
                
                while (hasMore && checkPage <= 10) { // Limit to 10 pages to avoid too many requests
                  try {
                    const nextPageData = await getReviewsByBook(Number(bookId), { 
                      page: checkPage, 
                      pageSize: PAGE_SIZE, 
                      rating: ratingParam 
                    });
                    const nextPageReviews = Array.isArray(nextPageData) ? nextPageData : [];
                    
                    if (nextPageReviews.length === 0) {
                      hasMore = false;
                      estimatedPages = checkPage - 1;
                    } else if (nextPageReviews.length < PAGE_SIZE) {
                      hasMore = false;
                      estimatedPages = checkPage;
                    } else {
                      estimatedPages = checkPage;
                      checkPage++;
                    }
                  } catch {
                    hasMore = false;
                    estimatedPages = checkPage - 1;
                  }
                }
                
                if (!mounted) return;
                setTotalPages(estimatedPages);
              } else if (page2Reviews.length > 0) {
                // Page 2 has some items but not full, so total is 2
                if (!mounted) return;
                setTotalPages(2);
              } else {
                // Page 2 is empty, so only 1 page
                if (!mounted) return;
                setTotalPages(1);
              }
            } catch {
              // If checking page 2 fails, just estimate at least 2 pages
              if (!mounted) return;
              setTotalPages(2);
            }
          } else {
            // Not on page 1, use simple estimation
            setTotalPages((prev) => {
              if (currentPage >= prev) {
                return currentPage + 1; // Estimate at least one more page
              }
              return prev;
            });
          }
        } else {
          // This is the last page, set totalPages to currentPage
          setTotalPages(currentPage);
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Không lấy được đánh giá");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [bookId, currentPage, ratingFilter, repliedFilter]);

  // Client-side filter for replied/not replied
  const filteredItems = useMemo(() => {
    const sourceItems = repliedFilter === "all" ? items : allItems;
    if (repliedFilter === "all") return sourceItems;
    if (repliedFilter === "replied") return sourceItems.filter(r => !!r.ownerReply);
    return sourceItems.filter(r => !r.ownerReply);
  }, [items, allItems, repliedFilter]);

  // Client-side pagination for filtered items
  const paginatedItems = useMemo(() => {
    if (repliedFilter === "all") {
      // Use server-side paginated items
      return filteredItems;
    }
    // Client-side pagination for filtered items
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage, repliedFilter]);

  // Calculate total pages for client-side pagination
  const clientTotalPages = useMemo(() => {
    if (repliedFilter === "all") return totalPages;
    return Math.ceil(filteredItems.length / PAGE_SIZE);
  }, [filteredItems, totalPages, repliedFilter]);

  // Build page numbers for pagination (similar to AudiobookGrid.jsx)
  const getPageNumbers = () => {
    const pages = [];
    const total = clientTotalPages;
    if (total <= 3) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(total - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < total - 3) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const sendReply = async (rid) => {
    if (!replyText.trim()) return;
    try {
      await ownerReplyReview(rid, replyText.trim());
      setReplyingReviewId(null);
      setReplyText("");
      // refresh current page
      const ratingParam = ratingFilter !== "all" ? Number(ratingFilter) : null;
      const data = await getReviewsByBook(Number(bookId), { page: currentPage, pageSize: PAGE_SIZE, rating: ratingParam });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message || "Gửi phản hồi thất bại");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-lg font-semibold">Đánh giá từ người đọc</h2>
        <div className="flex items-center gap-3">
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
            value={ratingFilter}
            onChange={(e) => { 
              setCurrentPage(1); 
              setRatingFilter(e.target.value);
              setTotalPages(1);
              setAllItems([]); // Clear allItems when filter changes
            }}
            title="Lọc theo số sao"
          >
            <option value="all">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
            value={repliedFilter}
            onChange={(e) => { 
              setCurrentPage(1); 
              setRepliedFilter(e.target.value);
              setAllItems([]); // Clear allItems when filter changes
            }}
            title="Lọc theo phản hồi"
          >
            <option value="all">Tất cả</option>
            <option value="replied">Đã trả lời</option>
            <option value="not">Chưa trả lời</option>
          </select>
        </div>
      </div>

      {/* Danh sách đánh giá */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            {repliedFilter === "replied" 
              ? "Không có đánh giá nào đã được trả lời"
              : repliedFilter === "not"
              ? "Không có đánh giá nào chưa được trả lời"
              : "Không có đánh giá nào phù hợp với bộ lọc"}
          </h3>
          <p className="text-gray-500 text-sm">
            {repliedFilter !== "all" && "Hãy thử thay đổi bộ lọc của bạn"}
          </p>
        </div>
      ) : (
        paginatedItems.map((review) => (
        <div key={review.reviewId} className="border-b border-gray-700 pb-5">
          <div className="flex items-start space-x-4">
            {/* Avatar tên viết tắt */}
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm">
              {(review.userName || "?").split(" ").map(w => w[0]).join("")}
            </div>

            {/* Nội dung */}
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold">{review.userName || "Người dùng"}</p>
                <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex text-yellow-400 text-sm mt-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (i < review.rating ? "★" : "☆"))}
              </div>

              <p className="text-sm text-gray-200 mb-3">{review.comment}</p>

              {/* Nếu có phản hồi */}
              {review.ownerReply ? (
                <div className="bg-slate-700 px-4 py-2 rounded-lg text-sm text-gray-300">
                  <p className="font-semibold text-orange-400 mb-1">Phản hồi của bạn</p>
                  <p>{review.ownerReply}</p>
                </div>
              ) : (
                <>
                  {replyingReviewId === review.reviewId ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={2}
                        placeholder="Nhập phản hồi..."
                        className="w-full bg-gray-700 p-2 rounded text-sm text-white"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setReplyingReviewId(null); setReplyText(""); }}
                          className="px-3 py-1 text-sm text-gray-300 hover:underline"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => sendReply(review.reviewId)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingReviewId(review.reviewId)}
                      className="text-sm text-blue-400 hover:underline mt-2"
                    >
                      Trả lời đánh giá
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        ))
      )}

      {/* Pagination */}
      {clientTotalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4 border-t border-gray-700/50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPage === 1
                ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                : "bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
            }`}
          >
            Trang trước
          </button>

          {pageNumbers.map((num, i) =>
            num === "..." ? (
              <span key={i} className="px-2 text-gray-400 text-xs">...</span>
            ) : (
              <button
                key={i}
                onClick={() => setCurrentPage(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === num
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800/80 text-gray-300 hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, clientTotalPages))}
            disabled={currentPage === clientTotalPages}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPage === clientTotalPages
                ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                : "bg-slate-800/80 text-white hover:bg-slate-700 border border-slate-600 hover:border-slate-500"
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
