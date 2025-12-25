import React, { useState, useEffect } from "react";
import { RiCloseLine, RiBookOpenLine, RiLockLine, RiCoinLine, RiShoppingCartLine, RiEyeLine } from "react-icons/ri";
import { getUserId } from "../../api/authApi";
import { checkChapterOwnership, purchaseChapters } from "../../api/chapterPurchaseApi";
import { incrementChapterView } from "../../api/ownerBookApi";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import toast from "react-hot-toast";

export default function ReaderContents({ book, purchasedChapters = [], onClose, onRefreshPurchases, mode = "modal" }) {
  // Sử dụng dữ liệu thật từ book prop thay vì mock data
  const chapters = book?.chapters || [];
  const [chapterOwnership, setChapterOwnership] = useState({}); // Lưu trạng thái sở hữu chương
  const [purchaseModal, setPurchaseModal] = useState({ open: false, chapter: null });
  const [isPurchasing, setIsPurchasing] = useState(false);

  const coins = useCoinsStore((s) => s.coins || 0);
  const fetchCoins = useCoinsStore((s) => s.fetchCoins);
  const { addNotification } = useNotificationStore();
  
  // Debug logs
  console.log("ReaderContents - book object:", book);
  console.log("ReaderContents - book.id:", book?.id);
  console.log("ReaderContents - book.bookId:", book?.bookId);
  console.log("ReaderContents - chapters:", chapters);
  console.log("ReaderContents - purchasedChapters:", purchasedChapters);

  // Kiểm tra quyền sở hữu chương khi component mount hoặc khi chapters thay đổi
  useEffect(() => {
    async function checkOwnership() {
      const isLoggedIn = getUserId() !== null;
      if (isLoggedIn && chapters.length > 0) {
        console.log("ReaderContents - Checking ownership for chapters:", chapters.map(c => c.chapterId));
        try {
          const ownershipPromises = chapters.map(async (chapter) => {
            const result = await checkChapterOwnership(chapter.chapterId);
            console.log(`ReaderContents - Chapter ${chapter.chapterId} ownership:`, result);
            return { chapterId: chapter.chapterId, isOwned: result.isOwned || false };
          });
          
          const ownershipResults = await Promise.all(ownershipPromises);
          const ownershipMap = {};
          ownershipResults.forEach(result => {
            ownershipMap[result.chapterId] = result.isOwned;
          });
          setChapterOwnership(ownershipMap);
          console.log("ReaderContents - Updated ownership map:", ownershipMap);
        } catch (error) {
          console.error("ReaderContents - Error checking ownership:", error);
        }
      } else {
        setChapterOwnership({});
      }
    }
    checkOwnership();
  }, [chapters]); // Chạy khi chapters thay đổi

  // Refresh ownership mỗi khi component được mount (modal mở)
  useEffect(() => {
    if (chapters.length > 0) {
      async function refreshOwnership() {
        const isLoggedIn = getUserId() !== null;
        if (isLoggedIn) {
          console.log("ReaderContents - Refreshing ownership on modal open");
          try {
            const ownershipPromises = chapters.map(async (chapter) => {
              const result = await checkChapterOwnership(chapter.chapterId);
              console.log(`ReaderContents - Modal open - Chapter ${chapter.chapterId} ownership:`, result);
              return { chapterId: chapter.chapterId, isOwned: result.isOwned || false };
            });
            
            const ownershipResults = await Promise.all(ownershipPromises);
            const ownershipMap = {};
            ownershipResults.forEach(result => {
              ownershipMap[result.chapterId] = result.isOwned;
            });
            setChapterOwnership(ownershipMap);
            console.log("ReaderContents - Refreshed ownership map on open:", ownershipMap);
          } catch (error) {
            console.error("ReaderContents - Error refreshing ownership:", error);
          }
        }
      }
      refreshOwnership();
    }
  }, []); // Empty dependency - chỉ chạy khi component mount

  // Phần nội dung danh sách chương tái sử dụng cho cả modal và sidebar
  const renderChapterList = () => (
    <div className="space-y-2 sm:space-y-3">
            {chapters.map((chapter, index) => {
              const hasSoftUrl = chapter.chapterSoftUrl && chapter.chapterSoftUrl.trim() !== "";
              const isLoggedIn = getUserId() !== null;
              const currentUserId = getUserId();
              const isOwner = isLoggedIn && (String(currentUserId) === String(book?.ownerId));
              // Ưu tiên sử dụng purchasedChapters prop, fallback về chapterOwnership
              const isOwned = purchasedChapters.includes(chapter.chapterId) || chapterOwnership[chapter.chapterId] || false;
              const isFree = !chapter.priceSoft || chapter.priceSoft === 0;
              // Áp dụng promotion nếu sách có khuyến mãi dạng phần trăm
              const hasBookPromotion =
                book?.hasPromotion && book?.discountType === "Percent" && book?.discountValue;
              const basePriceSoft = chapter.priceSoft || 0;
              const discountPercent = hasBookPromotion ? (book.discountValue || 0) : 0;
              // Giá sau khi áp dụng promotion, giữ 2 chữ số thập phân nếu có
              const effectivePriceSoft = !isFree && discountPercent > 0
                ? Math.round(basePriceSoft * (1 - discountPercent / 100) * 100) / 100
                : basePriceSoft;
              const isDisabled = !hasSoftUrl || !isLoggedIn || (!isOwned && !isFree && !isOwner);
              const chapterNumber = index + 1;
              
              // Debug logs
              console.log(`ReaderContents - Chapter ${chapterNumber}:`, {
                chapterId: chapter.chapterId,
                chapterTitle: chapter.chapterTitle,
                chapterNumber: chapterNumber,
                index: index,
                isOwned: isOwned,
                isFree: isFree,
                isDisabled: isDisabled,
                purchasedChapters: purchasedChapters,
                chapterOwnership: chapterOwnership,
                priceSoft: chapter.priceSoft,
                purchasedChaptersIncludes: purchasedChapters.includes(chapter.chapterId),
                chapterOwnershipValue: chapterOwnership[chapter.chapterId]
              });
              
              return (
                <div
                  key={chapter.chapterId || index}
                  className={`p-2 sm:p-3 md:p-4 rounded-lg border transition-all duration-200 ${
                    isDisabled
                      ? "bg-gray-700 border-gray-600 opacity-60 cursor-not-allowed"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-orange-500 cursor-pointer"
                  }`}
                  onClick={async () => {
                    if (!isLoggedIn) {
                      toast.error("Bạn phải đăng nhập để đọc chương");
                      return;
                    }
                    // Nếu sách đang InActive thì chỉ chặn khi chương chưa mua, không free và user không phải owner
                    if (book?.status === "InActive" && !isOwned && !isFree && !isOwner) {
                      toast.error("Bạn không thể mua chương này vì sách đang tạm dừng phát hành");
                      return;
                    }
                    if (!isOwned && !isFree && !isOwner) {
                      // Mở popup xác nhận mua bản mềm thay vì chỉ báo lỗi
                      setPurchaseModal({ open: true, chapter });
                      return;
                    }
                    if (!hasSoftUrl) {
                      return;
                    }
                    // Tăng chapter view trước khi navigate
                    try {
                      await incrementChapterView(chapter.chapterId);
                    } catch (err) {
                      // Không block navigation nếu có lỗi
                      console.error("Failed to increment chapter view:", err);
                    }
                    // Navigate to chapter reader
                    const bookId = book.id || book.bookId;
                    console.log("ReaderContents - Navigating to chapter:", { bookId, chapterId: chapter.chapterId });
                    window.location.href = `/reader/${bookId}/chapter/${chapter.chapterId}`;
                  }}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                      {/* Số thứ tự chương */}
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                        isDisabled 
                          ? "bg-gray-600 text-gray-400" 
                          : "bg-orange-600 text-white"
                      }`}>
                        {chapterNumber}
                      </div>
                      
                      <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[400px]">
                        <h4 className="font-semibold text-white mb-1 truncate text-sm sm:text-base" title={chapter.chapterTitle}>
                          {chapter.chapterTitle}
                        </h4>
                        {isOwner && (
                          <p className="text-xs text-green-400 mb-1">
                            Sách của bạn – Có quyền đọc
                          </p>
                        )}
                        {!isLoggedIn && (
                          <p className="text-xs text-red-400 mb-1">
                            Vui lòng đăng nhập để đọc chương
                          </p>
                        )}
                        {isLoggedIn && !isOwner && !isOwned && !isFree && (
                          <p className="text-xs text-orange-400 mb-1">
                            Cần mua chương này để đọc
                          </p>
                        )}
                        {isLoggedIn && isOwned && !hasSoftUrl && (
                          <p className="text-xs text-gray-400 mb-1">
                            Chương không có bản mềm
                          </p>
                        )}
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 flex-wrap">
                          {isFree ? (
                            <span className="text-green-400 font-medium">
                              Miễn phí
                            </span>
                          ) : basePriceSoft > 0 && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              {hasBookPromotion && discountPercent > 0 ? (
                                <>
                                  <span className="text-gray-400 line-through text-xs">
                                    {basePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                                  </span>
                                  <span className="text-orange-400 flex items-center gap-1 font-semibold">
                                    {effectivePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                                    <RiCoinLine className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </span>
                                </>
                              ) : (
                                <span className="text-orange-400 flex items-center gap-1">
                                  {basePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                                  <RiCoinLine className="w-3 h-3 sm:w-4 sm:h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-6 h-6">
                    </div>
                  </div>
                </div>
              );
            })}
    </div>
  );

  // Popup xác nhận mua bản mềm (dùng chung cho cả sidebar và modal)
  const renderPurchaseModal = () => {
    if (!purchaseModal.open || !purchaseModal.chapter) return null;

    const hasBookPromotion = book?.hasPromotion && book?.discountType === "Percent" && book?.discountValue;
    const basePriceSoft = purchaseModal.chapter.priceSoft || 0;
    const discountPercent = hasBookPromotion ? (book.discountValue || 0) : 0;
    const effectivePriceSoft = discountPercent > 0
      ? Math.round(basePriceSoft * (1 - discountPercent / 100) * 100) / 100
      : basePriceSoft;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Xác nhận mua chương đọc</h3>
            <button
              onClick={() => setPurchaseModal({ open: false, chapter: null })}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isPurchasing}
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Chương:</span>
                <span className="text-white font-medium max-w-[60%] text-right truncate" title={purchaseModal.chapter.chapterTitle}>
                  {purchaseModal.chapter.chapterTitle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Giá:</span>
                <div className="text-right">
                  {hasBookPromotion && discountPercent > 0 ? (
                    <>
                      <div className="text-gray-400 line-through text-xs">
                        {basePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                      </div>
                      <div className="text-orange-400 font-bold">
                        {effectivePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                      </div>
                    </>
                  ) : (
                    <div className="text-orange-400 font-bold">
                      {basePriceSoft.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-600">
                <span className="text-gray-400">Xu hiện có:</span>
                <span className="text-white font-medium">
                  {coins.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Xu còn lại:</span>
                <span
                  className={`font-medium ${
                    coins >= effectivePriceSoft
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {(coins - effectivePriceSoft).toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPurchaseModal({ open: false, chapter: null })}
                disabled={isPurchasing}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!purchaseModal.chapter) return;
                  const chapter = purchaseModal.chapter;
                  const price = effectivePriceSoft;
                  const bookId = book.id || book.bookId;

                  // Check if book is InActive before purchase
                  if (book?.status === "InActive") {
                    toast.error("Bạn không thể mua chương này vì sách đang tạm dừng phát hành");
                    return;
                  }

                  if (!bookId) {
                    toast.error("Không xác định được sách để mua chương");
                    return;
                  }

                  if (coins < price) {
                    toast.error("Bạn không đủ xu để mua chương này");
                    return;
                  }

                  setIsPurchasing(true);
                  try {
                    const bookIdInt = typeof bookId === "string" ? parseInt(bookId, 10) : bookId;
                    const chapterIdInt = typeof chapter.chapterId === "string" ? parseInt(chapter.chapterId, 10) : chapter.chapterId;

                    if (isNaN(bookIdInt) || isNaN(chapterIdInt)) {
                      throw new Error("ID sách hoặc chương không hợp lệ");
                    }

                    const response = await purchaseChapters(bookIdInt, [chapterIdInt], "soft");

                    if (response?.success === false || (response?.error !== undefined && response.error !== 0)) {
                      const msg = response.message || response.Message || "Lỗi khi mua chương";
                      throw new Error(msg);
                    }

                    await fetchCoins();

                    const notification = {
                      notificationId: Date.now(),
                      userId: getUserId(),
                      type: "BOOK_PURCHASE",
                      title: "Mua chương đọc thành công",
                      body: `Bạn đã mua thành công chương "${chapter.chapterTitle}" của "${book.title || "sách"}". Chi phí: ${price.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu.`,
                      isRead: false,
                      createdAt: new Date().toISOString(),
                    };
                    addNotification(notification);

                    toast.success("Mua chương đọc thành công!");

                    // Cập nhật trạng thái sở hữu chương ngay lập tức để không cần F5
                    setChapterOwnership((prev) => ({
                      ...prev,
                      [chapterIdInt]: true,
                    }));

                    setPurchaseModal({ open: false, chapter: null });

                    if (onRefreshPurchases) {
                      await onRefreshPurchases();
                    }
                  } catch (error) {
                    toast.error(error.message || "Không thể mua chương");
                  } finally {
                    setIsPurchasing(false);
                  }
                }}
                disabled={
                  isPurchasing ||
                  coins < effectivePriceSoft
                }
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPurchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <RiShoppingCartLine />
                    Xác nhận mua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar mode: hiển thị như cột trái cố định, không overlay
  if (mode === "sidebar") {
    return (
      <>
        <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-700 bg-gray-800">
            <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <RiBookOpenLine className="text-base sm:text-lg" />
              <span className="truncate" title="Mục lục">Mục lục</span>
            </h3>
          </div>
          <div className="p-2 sm:p-3 md:p-4 overflow-y-auto flex-1 overflow-x-hidden">
            {renderChapterList()}
          </div>
        </div>
        {renderPurchaseModal()}
      </>
    );
  }

  // Modal mode (mặc định) như cũ
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Popup */}
      <div className="relative bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] shadow-2xl z-10 overflow-hidden m-4">
        {/* Header */}
        <div className="bg-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-600">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 min-w-0">
              <RiBookOpenLine className="flex-shrink-0" /> <span className="truncate" title={`Mục lục - ${book?.title}`}>Mục lục - {book?.title}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors flex-shrink-0"
            >
              <RiCloseLine size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            {renderChapterList()}
          </div>
        </div>
      </div>

      {renderPurchaseModal()}
    </div>
  );
}
