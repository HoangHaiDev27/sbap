import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReviewsByBook, createReview, canReview as apiCanReview } from "../../api/reviewApi";
import { getUserId } from "../../api/authApi";
import toast from "react-hot-toast";
import { RiStarFill, RiStarLine } from "react-icons/ri";

export default function ReviewsTab({ bookId, reviews }) {
  const navigate = useNavigate();
  const [reviewsData, setReviewsData] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Kiểm tra hasReviewed khi component mount
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
        
        // Nếu không có filter, sử dụng dữ liệu từ props
        if (ratingFilter === null) {
          setReviewsData(reviews || []);
          return;
        }

        const list = await getReviewsByBook(bookId, {
          rating: ratingFilter,
          page,
          pageSize,
        });
        setReviewsData(list || []);

        if (uid && Array.isArray(list)) {
          const userHasReview = list.some(
            (r) => String(r?.userId || r?.UserId || "") === String(uid)
          );
          // không reset về false nếu trước đó đã true
          setHasReviewed((prev) => prev || userHasReview);
        }
      } catch {
        // ignore
      }
    })();
  }, [bookId, ratingFilter, page, pageSize, reviews]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Lọc theo sao:</span>
          {[null, 5, 4, 3, 2, 1].map((v) => (
            <button
              key={String(v)}
              className={`px-2 py-1 rounded ${
                ratingFilter === v
                  ? "bg-orange-600"
                  : "bg-gray-700 hover:bg-gray-600"
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
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Trang trước
          </button>
          <span className="text-sm text-gray-400">Trang {page}</span>
          <button
            className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={reviewsData.length < pageSize}
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* Form tạo đánh giá */}
      {canReview && !hasReviewed && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">
              Đánh giá của bạn:
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <button key={i} onClick={() => setNewRating(i + 1)}>
                  {i < newRating ? (
                    <RiStarFill className="text-yellow-400" />
                  ) : (
                    <RiStarLine className="text-yellow-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <textarea
              value={newComment}
              onChange={handleCommentChange}
              placeholder="Viết cảm nhận của bạn (chỉ người đã mua chương mới có thể gửi)"
              className={`w-full bg-gray-700 rounded p-3 text-sm border ${
                commentError 
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-600 focus:border-orange-500"
              } focus:outline-none focus:ring-1 focus:ring-orange-500`}
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
          <div className="text-right mt-3">
            <button
              className={`px-4 py-2 rounded transition duration-200 ${
                isSubmitting || commentError
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-500 text-white"
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
                  const created = await createReview(
                    parseInt(bookId, 10),
                    newRating,
                    newComment.trim()
                  );
                  toast.success("Đã gửi đánh giá thành công!");
                  setReviewsData([created, ...reviewsData]);
                  setNewComment("");
                  setNewRating(5);
                  setHasReviewed(true);
                  setCommentError("");
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
        <div className="text-gray-400 text-sm">
          {ratingFilter === null 
            ? "Sách chưa được đánh giá." 
            : `Không có đánh giá ${ratingFilter} sao.`}
        </div>
      ) : (
        reviewsData?.map((review) => (
          <div
            key={review.reviewId}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center space-x-3">
              <img
                src={review.avatarUrl}
                alt={review.userName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h4 className="font-medium">{review.userName}</h4>
                <span className="text-gray-400 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex mt-2">
              {[...Array(5)].map((_, i) =>
                i < review.rating ? (
                  <RiStarFill key={i} className="text-yellow-400" />
                ) : (
                  <RiStarLine key={i} className="text-yellow-400" />
                )
              )}
            </div>
            <p className="text-gray-300 mt-2">{review.comment}</p>
            {review.ownerReply && (
              <div className="mt-3 border-t border-gray-700 pt-3 text-sm">
                <div className="text-gray-400">
                  Phản hồi của tác giả:
                </div>
                <div className="text-gray-200">{review.ownerReply}</div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
