import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookDetail } from "../../api/bookApi";
import { checkWishlist, addToWishlist, removeFromWishlist } from "../../api/wishlistApi";
import { getUserId } from "../../api/authApi";
import { getReviewsByBook, createReview, canReview as apiCanReview } from "../../api/reviewApi";
import RelatedBooks from "./RelatedBook";
import PurchaseModal from "./PurchaseModal";
import toast from "react-hot-toast";
import {
  RiArrowRightSLine,
  RiBookOpenLine,
  RiPlayCircleLine,
  RiShoppingCartLine,
  RiHeartLine,
  RiShareLine,
  RiStarFill,
  RiHeartFill,
  RiStarLine,
  RiCoinLine,
} from "react-icons/ri";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [reportText, setReportText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const [bookDetail, setBookDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // fetch dữ liệu sách và wishlist
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getBookDetail(id);
        setBookDetail(data);

        const uid = getUserId();
        if (uid) {
          try {
            const wished = await checkWishlist(id);
            setIsFavorite(!!wished);
          } catch {
            // ignore wishlist check errors
          }
        } else {
          setIsFavorite(false);
        }
      } catch (err) {
        console.error("Lỗi khi fetch BookDetail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // fetch review theo filter / phân trang
  useEffect(() => {
    (async () => {
      try {
        const list = await getReviewsByBook(id, { rating: ratingFilter, page, pageSize });
        setReviewsData(list || []);

        const uid = getUserId();
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
  }, [id, ratingFilter, page, pageSize]);

  // kiểm tra quyền đánh giá
  useEffect(() => {
    (async () => {
      try {
        const uid = getUserId();
        if (!uid) {
          setCanReview(false);
          return;
        }
        const res = await apiCanReview(id);
        const flag = typeof res?.canReview === "boolean" ? res.canReview : false;
        setCanReview(flag);
      } catch {
        setCanReview(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="text-center text-white p-6">Đang tải...</div>;
  }

  if (!bookDetail) {
    return <div className="text-center text-red-500 p-6">Không tìm thấy sách.</div>;
  }

  const {
    title,
    description,
    coverUrl,
    isbn,
    language,
    totalView,
    createdAt,
    ownerName,
    categories,
    chapters,
    reviews,
    totalPrice,
  } = bookDetail;

  const hasAudio = Array.isArray(chapters) && chapters.some((ch) => !!ch.chapterAudioUrl);
  
  // Logic cắt ngắn description
  const maxDescriptionLength = 200;
  const shouldTruncate = description && description.length > maxDescriptionLength;
  const displayDescription = shouldTruncate && !isDescriptionExpanded 
    ? description.substring(0, maxDescriptionLength) + "..."
    : description;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-white">
          Trang chủ
        </Link>
        <RiArrowRightSLine />
        <Link to="/audiobooks" className="hover:text-white">
          Sách
        </Link>
        <RiArrowRightSLine />
        <span className="text-white">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái */}
        <div className="lg:col-span-1">
          <img src={coverUrl} alt={title} className="w-full max-w-sm mx-auto rounded-lg shadow-2xl mb-6" />

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Link
                to={`/reader/${id}`}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RiBookOpenLine /> Đọc ngay
              </Link>
              {hasAudio ? (
                <Link
                  to={`/player/${id}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RiPlayCircleLine /> Nghe
                </Link>
              ) : (
                <button
                  type="button"
                  aria-disabled
                  title="Sách chưa có audio"
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg text-center font-medium flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <RiPlayCircleLine /> Nghe
                </button>
              )}
            </div>

            <button
              onClick={() => setShowPurchaseModal(true)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RiShoppingCartLine /> Mua ngay
            </button>

            <div className="flex space-x-2">
              {/* Nút Yêu thích */}
              <button
                onClick={async () => {
                  const uid = getUserId();
                  if (!uid) {
                    toast.error("Vui lòng đăng nhập để sử dụng Yêu thích");
                    navigate("/auth");
                    return;
                  }
                  try {
                    if (isFavorite) {
                      await removeFromWishlist(id);
                      setIsFavorite(false);
                      toast.success("Đã gỡ khỏi Yêu thích");
                    } else {
                      await addToWishlist(id);
                      setIsFavorite(true);
                      toast.success("Đã thêm vào Yêu thích");
                    }
                  } catch {
                    toast.error("Có lỗi khi cập nhật Yêu thích");
                  }
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {isFavorite ? <RiHeartFill className="text-red-500" /> : <RiHeartLine />}
                {isFavorite ? "Đã Yêu thích" : "Yêu thích"}
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <RiShareLine /> Báo cáo
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-300 mb-4">Tác giả: {ownerName}</p>
          <p className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-1">
            {totalPrice.toLocaleString()} <RiCoinLine className="w-5 h-5" />
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-white font-medium">
              {reviews && reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : "Chưa có"}
            </span>
            <RiStarFill className="text-yellow-400" />
            <span className="text-gray-400 text-sm">({reviews?.length || 0} đánh giá)</span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6 flex space-x-6">
            {["overview", "details", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 ${
                  activeTab === tab ? "border-b-2 border-orange-500 text-orange-400" : "text-gray-400"
                }`}
              >
                {tab === "overview" ? "Tổng quan" : tab === "details" ? "Chi tiết" : "Đánh giá"}
              </button>
            ))}
          </div>

          {/* Nội dung Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="mb-4">
                <p className="text-gray-300">{displayDescription}</p>
                {shouldTruncate && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-orange-400 hover:text-orange-300 text-sm mt-2 font-medium transition-colors"
                  >
                    {isDescriptionExpanded ? "Xem ít hơn" : "Xem thêm"}
                  </button>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Chương</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {chapters?.map((ch) => (
                    <li key={ch.chapterId}>
                      {ch.chapterTitle} ({Math.round(ch.durationSec / 60)} phút)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <ul className="text-gray-300 space-y-2">
              <li>ISBN: {isbn}</li>
              <li>Ngôn ngữ: {language}</li>
              <li>Lượt xem: {totalView}</li>
              <li>Ngày tạo: {new Date(createdAt).toLocaleDateString()}</li>
              <li>Thể loại: {categories?.join(", ")}</li>
            </ul>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Filter + Pagination Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Lọc theo sao:</span>
                  {[null, 5, 4, 3, 2, 1].map((v) => (
                    <button
                      key={String(v)}
                      className={`px-2 py-1 rounded ${
                        ratingFilter === v ? "bg-orange-600" : "bg-gray-700 hover:bg-gray-600"
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
                    <span className="text-sm text-gray-300">Đánh giá của bạn:</span>
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
                          const created = await createReview(parseInt(id, 10), newRating, newComment);
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
              {(reviewsData?.length ? reviewsData : reviews)?.length === 0 ? (
                <div className="text-gray-400 text-sm">Sách chưa được đánh giá.</div>
              ) : (
                (reviewsData?.length ? reviewsData : reviews)?.map((review) => (
                  <div key={review.reviewId} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3">
                      <img src={review.avatarUrl} alt={review.userName} className="w-10 h-10 rounded-full" />
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
                        <div className="text-gray-400">Phản hồi của tác giả:</div>
                        <div className="text-gray-200">{review.ownerReply}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Books */}
      <div className="mt-12">
        <RelatedBooks currentBookId={id} />
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowReportModal(false)}></div>
          <div className="relative bg-gray-800 backdrop-blur-sm p-6 rounded-lg max-w-md w-full shadow-xl z-10">
            <h2 className="text-lg font-bold mb-4">Báo cáo sách</h2>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Nhập lý do báo cáo..."
              className="w-full h-32 p-3 rounded-lg bg-gray-700 text-white focus:outline-none mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (reportText.trim()) {
                    toast.success(`📨 Đã gửi báo cáo: ${reportText}`);
                    setReportText("");
                    setShowReportModal(false);
                  }
                }}
                className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-500"
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        bookTitle={title}
        bookId={id}
        chapters={chapters}
        onPurchaseSuccess={(purchasedChapters) => {
          console.log("Purchased chapters:", purchasedChapters);
        }}
      />
    </div>
  );
}
