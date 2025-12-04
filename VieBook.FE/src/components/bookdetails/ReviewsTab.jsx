import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReviewsByBook, createReview, canReview as apiCanReview } from "../../api/reviewApi";
import { getUserId } from "../../api/authApi";
import toast from "react-hot-toast";
import { 
  RiStarFill, 
  RiStarLine, 
  RiFilterLine, 
  RiArrowLeftSLine, 
  RiArrowRightSLine,
  RiMessage3Line,
  RiUserLine,
  RiTimeLine
} from "react-icons/ri";

export default function ReviewsTab({ bookId, reviews }) {
  const navigate = useNavigate();
  const [reviewsData, setReviewsData] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [hasMore, setHasMore] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Kiểm tra hasReviewed khi component mount từ props
  useEffect(() => {
    const uid = getUserId();
    if (uid && Array.isArray(reviews)) {
      const userHasReview = reviews.some(
        (r) => String(r?.userId || r?.UserId || "") === String(uid)
      );
      setHasReviewed(userHasReview);
    }
  }, [reviews]);

  // fetch review theo filter / phân trang
  useEffect(() => {
    (async () => {
      try {
        const uid = getUserId();
        
        // Luôn gọi API để có pagination, kể cả khi không có filter
        const list = await getReviewsByBook(bookId, {
          rating: ratingFilter,
          page,
          pageSize,
        });
        
        const reviewsList = Array.isArray(list) ? list : [];
        setReviewsData(reviewsList);
        
        // Kiểm tra xem còn trang tiếp theo không
        // Nếu số lượng reviews trả về = pageSize, có thể còn trang tiếp theo
        setHasMore(reviewsList.length === pageSize);

        if (uid && Array.isArray(reviewsList)) {
          const userHasReview = reviewsList.some(
            (r) => String(r?.userId || r?.UserId || "") === String(uid)
          );
          // không reset về false nếu trước đó đã true
          setHasReviewed((prev) => prev || userHasReview);
        }
      } catch {
        setReviewsData([]);
        setHasMore(false);
      }
    })();
  }, [bookId, ratingFilter, page, pageSize]);

  // kiểm tra quyền đánh giá
  useEffect(() => {
    (async () => {
      try {
        const uid = getUserId();
        if (!uid) {
          setCanReview(false);
          return;
        }
        const res = await apiCanReview(bookId);
        const flag =
          typeof res?.canReview === "boolean" ? res.canReview : false;
        setCanReview(flag);
      } catch {
        setCanReview(false);
      }
    })();
  }, [bookId]);

  // Function validate comment
  const validateComment = (comment) => {
    if (!comment || comment.trim().length === 0) {
      setCommentError("Vui lòng nhập nội dung đánh giá");
      return false;
    }

    const trimmedComment = comment.trim();
    
    // Kiểm tra độ dài tối thiểu
    if (trimmedComment.length < 10) {
      setCommentError("Nội dung đánh giá phải có ít nhất 10 ký tự");
      return false;
    }

    // Kiểm tra độ dài tối đa
    if (trimmedComment.length > 1000) {
      setCommentError("Nội dung đánh giá không được vượt quá 1000 ký tự");
      return false;
    }

    // Kiểm tra không được chỉ có dấu cách hoặc ký tự đặc biệt
    if (/^[\s\-\.]+$/.test(trimmedComment)) {
      setCommentError("Nội dung đánh giá phải chứa ít nhất một chữ cái");
      return false;
    }

    setCommentError("");
    return true;
  };

  // Function handle comment change
  const handleCommentChange = (e) => {
    const value = e.target.value;
    setNewComment(value);
    
    // Clear error khi user đang nhập
    if (commentError) {
      setCommentError("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter + Pagination Controls */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <RiFilterLine className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Lọc theo sao:</span>
            </div>
            <div className="flex items-center gap-2">
              {[null, 5, 4, 3, 2, 1].map((v) => (
                <button
                  key={String(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    ratingFilter === v
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white"
                  }`}
                  onClick={() => {
                    setPage(1);
                    setRatingFilter(v);
                  }}
                >
                  {v === null ? "Tất cả" : `${v}★`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <RiArrowLeftSLine className="w-4 h-4" />
              Trước
            </button>
            <span className="px-3 py-1.5 bg-gray-600 rounded-lg text-sm text-gray-300 font-medium">
              Trang {page}
            </span>
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
            >
              Sau
              <RiArrowRightSLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form tạo đánh giá */}
      {canReview && !hasReviewed && (
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-6 border border-gray-600 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <RiMessage3Line className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Viết đánh giá của bạn</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-300">
              Đánh giá:
            </span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setNewRating(i + 1)}
                  className="transition-transform hover:scale-110"
                >
                  {i < newRating ? (
                    <RiStarFill className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <RiStarLine className="w-6 h-6 text-gray-400 hover:text-yellow-300" />
                  )}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">
              ({newRating}/5 sao)
            </span>
          </div>
          <div>
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
              className={`w-full bg-gray-700/50 rounded-lg p-4 text-sm border-2 transition-all duration-200 ${
                commentError 
                  ? "border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20" 
                  : "border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              } focus:outline-none resize-none`}
              rows={4}
            />
            {/* Character count and validation hints */}
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-400">
                {newComment.length}/1000 ký tự
                {newComment.length > 0 && newComment.length < 10 && (
                  <span className="text-yellow-500 ml-2">
                    (Cần ít nhất 10 ký tự)
                  </span>
                )}
              </div>
              {commentError && (
                <div className="text-xs text-red-500 flex items-center">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {commentError}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isSubmitting || commentError
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:shadow-orange-500/25"
              }`}
              disabled={isSubmitting || !!commentError}
              onClick={async () => {
                const uid = getUserId();
                
                // Kiểm tra đăng nhập
                if (!uid) {
                  toast.error("Vui lòng đăng nhập để đánh giá");
                  navigate("/auth");
                  return;
                }

                // Kiểm tra đã đánh giá
                if (hasReviewed) {
                  toast.error("Bạn đã đánh giá sách này rồi");
                  return;
                }

                // Validate comment trước khi gửi
                if (!validateComment(newComment)) {
                  return;
                }

                setIsSubmitting(true);
                try {
                  await createReview(
                    parseInt(bookId, 10),
                    newRating,
                    newComment.trim()
                  );
                  toast.success("Đã gửi đánh giá thành công!");
                  setNewComment("");
                  setNewRating(5);
                  setHasReviewed(true);
                  setCommentError("");
                  // Reset về trang 1 và reload reviews
                  setPage(1);
                  setRatingFilter(null);
                } catch (e) {
                  console.error("Error creating review:", e);
                  toast.error(e.message || "Có lỗi xảy ra khi gửi đánh giá");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </div>
              ) : (
                "Gửi đánh giá"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách đánh giá */}
      {reviewsData?.length === 0 ? (
        <div className="text-center py-12">
          <RiMessage3Line className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {ratingFilter === null 
              ? "Chưa có đánh giá nào" 
              : `Không có đánh giá ${ratingFilter} sao`}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Hãy là người đầu tiên đánh giá cuốn sách này!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsData?.map((review) => (
            <div
              key={review.reviewId}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={review.avatarUrl}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full border-2 border-gray-600"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RiUserLine className="w-4 h-4 text-gray-400" />
                      <h4 className="font-semibold text-white">{review.userName}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <RiTimeLine className="w-4 h-4" />
                      <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) =>
                        i < review.rating ? (
                          <RiStarFill key={i} className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <RiStarLine key={i} className="w-4 h-4 text-gray-500" />
                        )
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {review.rating}/5 sao
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                  {review.ownerReply && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded-lg border-l-4 border-orange-500">
                      <div className="flex items-center gap-2 mb-2">
                        <RiMessage3Line className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-300">
                          Phản hồi từ tác giả
                        </span>
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed">
                        {review.ownerReply}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
