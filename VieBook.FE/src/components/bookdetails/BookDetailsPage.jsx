import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookDetail } from "../../api/bookApi";
import {
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../api/wishlistApi";
import { getUserId } from "../../api/authApi";
import RelatedBooks from "./RelatedBook";
import PurchaseModal from "./PurchaseModal";
import ReportBookModal from "./ReportBookModal";
import OverviewTab from "./OverviewTab";
import DetailsTab from "./DetailsTab";
import ReviewsTab from "./ReviewsTab";
import { getMyPurchases } from "../../api/chapterPurchaseApi";
import toast from "react-hot-toast";
import { dispatchWishlistChangeDelayed } from "../../utils/wishlistEvents";
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
  RiCloseLine,
  RiCheckboxCircleLine,
  RiCoinLine,
} from "react-icons/ri";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [bookDetail, setBookDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasedChapters, setPurchasedChapters] = useState([]); // Lưu danh sách chương đã mua
  const [chapterOwnership, setChapterOwnership] = useState({}); // Lưu trạng thái sở hữu chương

  // fetch dữ liệu sách và wishlist
  useEffect(() => {
    // Scroll to top when component mounts or id changes
    window.scrollTo(0, 0);

    async function fetchData() {
      try {
        const data = await getBookDetail(id);
        setBookDetail(data);

        // Load wishlist state if logged in
        const uid = getUserId();
        if (uid) {
          try {
            const wished = await checkWishlist(id);
            setIsFavorite(!!wished);

            // Load purchased chapters nếu user đã đăng nhập
            if (data.chapters && data.chapters.length > 0) {
              try {
                console.log("BookDetailsPage - Loading purchased chapters");
                const response = await getMyPurchases();
                console.log("BookDetailsPage - Full API response:", response);
                console.log(
                  "BookDetailsPage - Response type:",
                  typeof response
                );
                console.log("BookDetailsPage - Response.data:", response?.data);
                console.log(
                  "BookDetailsPage - Response.data type:",
                  typeof response?.data
                );
                console.log(
                  "BookDetailsPage - Response.data length:",
                  response?.data?.length
                );

                const purchases = response?.data || [];
                console.log("BookDetailsPage - Purchases array:", purchases);
                const purchasedChapterIds = purchases.map((p) => p.chapterId);
                console.log(
                  "BookDetailsPage - Purchased chapter IDs:",
                  purchasedChapterIds
                );
                setPurchasedChapters(purchasedChapterIds);
              } catch (error) {
                console.error(
                  "BookDetailsPage - Error loading purchased chapters:",
                  error
                );
                console.error(
                  "BookDetailsPage - Error details:",
                  error.message
                );
                setPurchasedChapters([]);
              }
            }
          } catch {
            // ignore wishlist check errors
          }
        } else {
          setIsFavorite(false);
          setPurchasedChapters([]);
        }
      } catch (err) {
        console.error("Lỗi khi fetch BookDetail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);


  if (loading) {
    return <div className="text-center text-white p-6">Đang tải...</div>;
  }

  if (!bookDetail) {
    return (
      <div className="text-center text-red-500 p-6">Không tìm thấy sách.</div>
    );
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

  const hasAudio =
    Array.isArray(chapters) && chapters.some((ch) => !!ch.chapterAudioUrl);

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
          <img
            src={coverUrl}
            alt={title}
            className="w-full max-w-sm mx-auto rounded-lg shadow-2xl mb-6"
          />

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowChapterModal(true)}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RiBookOpenLine /> Đọc ngay
              </button>
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
                    // Dispatch event to update wishlist count
                    dispatchWishlistChangeDelayed();
                  } catch {
                    toast.error("Có lỗi khi cập nhật Yêu thích");
                  }
                }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                {isFavorite ? (
                  <RiHeartFill className="text-red-500" />
                ) : (
                  <RiHeartLine />
                )}
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
            {reviews && reviews.length > 0 ? (
              <>
                <span className="text-white font-medium">
                  {(
                    reviews.reduce((sum, r) => sum + r.rating, 0) /
                    reviews.length
                  ).toFixed(1)}
                </span>
                <RiStarFill className="text-yellow-400" />
                <span className="text-gray-400 text-sm">
                  ({reviews.length} đánh giá)
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">
                Chưa có đánh giá
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex space-x-8">
              {["overview", "details", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 px-1 font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "text-orange-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {tab === "overview"
                    ? "Tổng quan"
                    : tab === "details"
                    ? "Chi tiết"
                    : "Đánh giá"}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Nội dung Tab */}
          {activeTab === "overview" && <OverviewTab bookDetail={bookDetail} />}
          {activeTab === "details" && <DetailsTab bookDetail={bookDetail} />}
          {activeTab === "reviews" && <ReviewsTab bookId={id} reviews={reviews} />}
        </div>
      </div>

      {/* Related Books */}
      <div className="mt-12">
        <RelatedBooks currentBookId={id} />
      </div>

      {/* Report Modal */}
      <ReportBookModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        bookId={id}
        bookTitle={title}
      />

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        bookTitle={title}
        bookId={id}
        chapters={chapters}
        onPurchaseSuccess={async (newlyPurchasedChapters) => {
          console.log("Newly purchased chapters:", newlyPurchasedChapters);
          // Cập nhật state ngay lập tức bằng cách thêm các chương vừa mua
          setPurchasedChapters(prevPurchased => {
            const updatedPurchased = [...new Set([...prevPurchased, ...newlyPurchasedChapters])];
            console.log("BookDetailsPage - Updated purchased chapters immediately:", updatedPurchased);
            return updatedPurchased;
          });
          
          // Cũng reload từ API để đảm bảo sync (chạy ngầm)
          try {
            const response = await getMyPurchases();
            const purchases = response?.data || [];
            const purchasedChapterIds = purchases.map((p) => p.chapterId);
            setPurchasedChapters(purchasedChapterIds);
            console.log("BookDetailsPage - Synced with API:", purchasedChapterIds);
          } catch (error) {
            console.error("Error syncing purchased chapters:", error);
          }
        }}
      />

      {/* Chapter Modal - Mục lục chương */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChapterModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gray-700 px-4 sm:px-6 py-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                  <RiBookOpenLine className="text-orange-500" />
                  Mục lục - {title}
                </h3>
                <button
                  onClick={() => setShowChapterModal(false)}
                  className="text-gray-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-600"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* Danh sách chương */}
              <div className="space-y-2">
                {chapters?.map((chapter, index) => {
                  const hasSoftUrl =
                    chapter.chapterSoftUrl &&
                    chapter.chapterSoftUrl.trim() !== "";
                  const isLoggedIn = getUserId() !== null;
                  const isOwned = purchasedChapters.includes(chapter.chapterId);
                  // Debug log để theo dõi trạng thái sở hữu
                  if (index === 0) {
                    console.log("BookDetailsPage - Chapter ownership check:", {
                      chapterId: chapter.chapterId,
                      isOwned,
                      purchasedChapters,
                      totalPurchased: purchasedChapters.length
                    });
                  }
                  const isFree =
                    !chapter.priceAudio || chapter.priceAudio === 0;
                  const isDisabled =
                    !hasSoftUrl || !isLoggedIn || (!isOwned && !isFree);
                  const chapterNumber = index + 1;

                  // Debug log
                  console.log(
                    `Chapter ${chapterNumber}: isOwned=${isOwned}, isFree=${isFree}, isLoggedIn=${isLoggedIn}, hasSoftUrl=${hasSoftUrl}, purchasedChapters=`,
                    purchasedChapters
                  );

                  return (
                    <div
                      key={chapter.chapterId || index}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        isDisabled
                          ? "border-gray-600 bg-gray-700/50 cursor-not-allowed opacity-60"
                          : "border-gray-600 hover:border-orange-500 bg-gray-700/50 hover:bg-gray-600 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isLoggedIn) {
                          toast.error("Bạn phải đăng nhập để đọc chương");
                          return;
                        }
                        if (!isOwned && !isFree) {
                          toast.error("Bạn cần mua chương này để đọc");
                          return;
                        }
                        if (!hasSoftUrl) {
                          return;
                        }
                        // Navigate to chapter reader
                        window.location.href = `/reader/${id}/chapter/${chapter.chapterId}`;
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white text-sm sm:text-base truncate">
                              Chương {chapterNumber}:{" "}
                              {chapter.chapterTitle?.replace(
                                /chuogn/g,
                                "chương"
                              ) || ""}
                            </h3>
                            {isOwned && (
                              <RiCheckboxCircleLine className="text-green-500 text-lg flex-shrink-0" />
                            )}
                            {!isLoggedIn && (
                              <svg
                                className="w-5 h-5 text-red-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {isLoggedIn && !isOwned && !isFree && (
                              <svg
                                className="w-5 h-5 text-orange-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                            {!isLoggedIn && (
                              <span className="flex items-center gap-1 text-red-400 font-medium">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Bạn phải đăng nhập để đọc chương
                              </span>
                            )}
                            {isLoggedIn && !isOwned && !isFree && (
                              <span className="flex items-center gap-1 text-orange-400 font-medium">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Cần mua chương này để đọc
                              </span>
                            )}
                            {isLoggedIn && isOwned && !hasSoftUrl && (
                              <span className="flex items-center gap-1 text-gray-400 font-medium">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Chương không có bản mềm
                              </span>
                            )}
                            {isLoggedIn && isOwned && hasSoftUrl && (
                              <span className="flex items-center gap-1 text-green-400 font-medium">
                                <RiCheckboxCircleLine className="w-4 h-4" />
                                Đã mua
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          {isFree ? (
                            <div className="text-green-500 font-bold text-base sm:text-lg">
                              Miễn phí
                            </div>
                          ) : (
                            <div className="text-orange-500 font-bold text-base sm:text-lg flex items-center gap-1">
                              {chapter.priceAudio?.toLocaleString() || 0}
                              <RiCoinLine className="w-4 h-4 text-yellow-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
