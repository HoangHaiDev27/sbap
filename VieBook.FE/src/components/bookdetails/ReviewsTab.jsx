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
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết cảm nhận của bạn (chỉ người đã mua chương mới có thể gửi)"
            className="mt-3 w-full bg-gray-700 rounded p-3 text-sm"
          />
          <div className="text-right mt-3">
            <button
              className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-500"
              onClick={async () => {
                const uid = getUserId();
                if (!uid) {
                  toast.error("Vui lòng đăng nhập để đánh giá");
                  navigate("/auth");
                  return;
                }
                if (hasReviewed) {
                  toast.error("Bạn đã đánh giá sách này rồi");
                  return;
                }
                try {
                  const created = await createReview(
                    parseInt(bookId, 10),
                    newRating,
                    newComment
                  );
                  toast.success("Đã gửi đánh giá");
                  setReviewsData([created, ...reviewsData]);
                  setNewComment("");
                  setNewRating(5);
                  setHasReviewed(true);
                } catch (e) {
                  toast.error(e.message);
                }
              }}
            >
              Gửi đánh giá
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
