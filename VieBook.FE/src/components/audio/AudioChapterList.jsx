import React, { useState, useEffect } from "react";
import { RiVoiceprintLine, RiCheckboxCircleLine, RiPlayCircleLine, RiArrowDownSLine, RiArrowRightSLine, RiShoppingCartLine, RiCloseLine, RiArrowLeftLine } from "react-icons/ri";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { getUserId } from "../../api/authApi";
import { getVoiceDisplayName } from "../../utils/voiceMapping";
import { purchaseChapters } from "../../api/chapterPurchaseApi";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import toast from "react-hot-toast";

export default function AudioChapterList({
  chapters,
  currentChapter,
  jumpToChapter,
  showChapters,
  setShowChapters,
  formatTime,
  allAudioData,
  selectedVoice,
  setSelectedVoice,
  purchasedAudioChapters,
  isOwner,
  bookId,
  bookTitle,
  onPurchaseSuccess,
  setShowChaptersMobile,
}) {
  const [chapterAudios, setChapterAudios] = useState({}); // { chapterId: [audios] }
  const [expandedChapters, setExpandedChapters] = useState(new Set([currentChapter]));
  const [purchaseModal, setPurchaseModal] = useState({ open: false, chapter: null });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [bookOwnerId, setBookOwnerId] = useState(null);
  const [promotionInfo, setPromotionInfo] = useState({
    hasPromotion: false,
    discountType: null,
    discountValue: null,
  });
  
  const coins = useCoinsStore((s) => s.coins || 0);
  const fetchCoins = useCoinsStore((s) => s.fetchCoins);
  const { addNotification } = useNotificationStore();
  
  // Fetch book data để lấy ownerId
  useEffect(() => {
    if (bookId) {
      const fetchBookOwner = async () => {
        try {
          // Ưu tiên dùng BOOK_DETAIL để chắc chắn có thông tin promotion
          let bookRes = await fetch(API_ENDPOINTS.BOOK_DETAIL(bookId));

          // Nếu BOOK_DETAIL lỗi, fallback sang AUDIO_BOOK_DETAIL
          if (!bookRes.ok) {
            bookRes = await fetch(API_ENDPOINTS.AUDIO_BOOK_DETAIL(bookId));
          }

          if (bookRes.ok) {
            const bookData = await bookRes.json();

            // Lấy OwnerId từ BookDetailDTO (theo backend: OwnerId là int)
            const ownerId = bookData.OwnerId || bookData.ownerId || null;

            // Lấy thông tin promotion nếu có (HasPromotion, DiscountType, DiscountValue)
            const hasPromotion = bookData.HasPromotion ?? bookData.hasPromotion ?? false;
            const discountType = bookData.DiscountType ?? bookData.discountType ?? null;
            const discountValue = bookData.DiscountValue ?? bookData.discountValue ?? null;

            console.log("AudioChapterList - Fetching book owner & promotion:", {
              bookId: bookId,
              OwnerId: bookData.OwnerId,
              ownerId: bookData.ownerId,
              finalOwnerId: ownerId,
              hasPromotion,
              discountType,
              discountValue,
            });

            setBookOwnerId(ownerId);
            setPromotionInfo({
              hasPromotion: !!hasPromotion,
              discountType,
              discountValue,
            });
          }
        } catch (error) {
          console.error("Error fetching book owner:", error);
        }
      };
      fetchBookOwner();
    }
  }, [bookId]);
  
  // Kiểm tra xem user đang đăng nhập có phải là owner không
  const currentUserId = getUserId();
  const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
  const ownerIdNum = bookOwnerId ? Number(bookOwnerId) : null;
  const isUserOwner = !!(currentUserIdNum && ownerIdNum && currentUserIdNum === ownerIdNum);
  
  // Ưu tiên dùng isOwner từ props, nếu không có thì dùng isUserOwner
  const finalIsOwner = isOwner !== null && isOwner !== undefined ? !!isOwner : isUserOwner;
  
  // Fetch audio cho các chapter
  useEffect(() => {
    if (chapters.length > 0) {
      // Fetch audio cho tất cả chapter
      const fetchAllChapterAudios = async () => {
        const promises = chapters.map(async (chapter) => {
          try {
            const response = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(chapter.chapterId));
            if (response.ok) {
              const data = await response.json();
              let audios = [];
              if (data.success && Array.isArray(data.data)) {
                audios = data.data;
              } else if (Array.isArray(data)) {
                audios = data;
              }
              return { chapterId: chapter.chapterId, audios };
            }
          } catch (error) {
            console.error(`Error fetching audios for chapter ${chapter.chapterId}:`, error);
          }
          return { chapterId: chapter.chapterId, audios: [] };
        });
        
        const results = await Promise.all(promises);
        const audioMap = {};
        results.forEach(({ chapterId, audios }) => {
          audioMap[chapterId] = audios;
        });
        setChapterAudios(audioMap);
      };
      
      fetchAllChapterAudios();
    }
  }, [chapters]);

  const toggleChapterExpand = (index) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const handlePurchase = async () => {
    if (!purchaseModal.chapter || !bookId) return;
    
    // Kiểm tra nếu là owner của chapter audio hoặc sách thì không cho mua
    const chapterAudiosForModal = chapterAudios[purchaseModal.chapter.chapterId] || [];
    const isChapterAudioOwner = chapterAudiosForModal.some(audio => {
      const audioUserId = audio.userId || audio.UserId || null;
      return currentUserIdNum && audioUserId && currentUserIdNum === Number(audioUserId);
    });
    const isChapterOwner = isChapterAudioOwner || finalIsOwner;
    
    if (isChapterOwner) {
      toast.error("Bạn là chủ sở hữu audio này, không cần mua");
      setPurchaseModal({ open: false, chapter: null });
      return;
    }
    
    const chapter = purchaseModal.chapter;
    const basePriceAudio = chapter.priceAudio || 0;

    // Áp dụng promotion nếu sách có khuyến mãi dạng phần trăm
    const hasBookPromotion =
      promotionInfo.hasPromotion &&
      promotionInfo.discountType === "Percent" &&
      promotionInfo.discountValue;
    const discountPercent = hasBookPromotion ? (promotionInfo.discountValue || 0) : 0;
    const price = discountPercent > 0
      ? Math.round(basePriceAudio * (1 - discountPercent / 100) * 100) / 100
      : basePriceAudio;
    
    if (coins < price) {
      toast.error("Bạn không đủ xu để mua audio này");
      return;
    }
    
    setIsPurchasing(true);
    try {
      // Đảm bảo bookId là số nguyên
      const bookIdInt = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      const chapterIdInt = typeof chapter.chapterId === 'string' ? parseInt(chapter.chapterId, 10) : chapter.chapterId;
      
      if (isNaN(bookIdInt) || isNaN(chapterIdInt)) {
        throw new Error("ID sách hoặc chương không hợp lệ");
      }
      
      const response = await purchaseChapters(bookIdInt, [chapterIdInt], 'audio');
      
      // Kiểm tra response.success nếu có
      if (response?.success === false) {
        const errorMessage = response.message || response.Message || "Lỗi khi mua audio";
        // Chuyển đổi thông báo lỗi tiếng Anh sang tiếng Việt nếu cần
        const translatedMessage = errorMessage.includes("your own book") 
          ? "Bạn là chủ sở hữu sách này, không thể mua audio của chính mình"
          : errorMessage;
        throw new Error(translatedMessage);
      }
      
      if (response?.error !== undefined && response.error !== 0) {
        const errorMessage = response.message || response.Message || "Lỗi khi mua audio";
        // Chuyển đổi thông báo lỗi tiếng Anh sang tiếng Việt nếu cần
        const translatedMessage = errorMessage.includes("your own book") 
          ? "Bạn là chủ sở hữu sách này, không thể mua audio của chính mình"
          : errorMessage;
        throw new Error(translatedMessage);
      }
      
      // Cập nhật số xu
      await fetchCoins();
      
      // Thêm thông báo
      const notification = {
        notificationId: Date.now(),
        userId: getUserId(),
        type: "BOOK_PURCHASE",
        title: "Mua audio thành công",
        body: `Bạn đã mua thành công audio chương "${chapter.title}" của "${bookTitle || 'sách'}". Chi phí: ${price.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      addNotification(notification);
      
      toast.success("Mua audio thành công!");
      setPurchaseModal({ open: false, chapter: null });
      
      // Refresh purchased chapters
      if (onPurchaseSuccess) {
        onPurchaseSuccess([chapter.chapterId]);
      }
    } catch (error) {
      toast.error(error.message || "Không thể mua audio");
    } finally {
      setIsPurchasing(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-800/50 overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0" style={{ pointerEvents: 'auto' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">Danh sách chương</h3>
          <span className="text-xs text-gray-400 flex-shrink-0">{chapters.length} chương</span>
        </div>
        {/* Nút ẩn danh sách chương trên mobile */}
        {setShowChaptersMobile && (
          <button
            onClick={() => setShowChaptersMobile(false)}
            className="lg:hidden p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white flex-shrink-0 ml-2"
            title="Ẩn danh sách chương"
          >
            <RiArrowLeftLine className="text-xl" />
          </button>
        )}
      </div>

      {/* List chapters */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-1.5 sm:space-y-2 custom-scrollbar min-w-0" style={{ pointerEvents: 'auto' }}>
          {chapters.map((chapter, index) => {
            const audios = chapterAudios[chapter.chapterId] || [];
            const isExpanded = expandedChapters.has(index);
            const isCurrentChapter = currentChapter === index;
            const isFree = !chapter.priceAudio || chapter.priceAudio === 0;
            const isLoggedIn = getUserId() !== null;
            const isOwned = purchasedAudioChapters.includes(chapter.chapterId);
            
            // Kiểm tra xem user hiện tại có phải là UserId trong ChapterAudio của chapter này không
            const isChapterAudioOwner = audios.some(audio => {
              const audioUserId = audio.userId || audio.UserId || null;
              return currentUserIdNum && audioUserId && currentUserIdNum === Number(audioUserId);
            });
            
            // Nếu user là owner của chapter audio hoặc owner của sách, thì có quyền truy cập
            const isChapterOwner = isChapterAudioOwner || finalIsOwner;
            
            // Log để kiểm tra
            if (index === 0) {
              console.log("AudioChapterList - Owner check:", {
                isOwner: isOwner,
                finalIsOwner: finalIsOwner,
                currentUserId: currentUserId,
                currentUserIdNum: currentUserIdNum,
                bookOwnerId: bookOwnerId,
                ownerIdNum: ownerIdNum,
                isUserOwner: isUserOwner,
                isChapterAudioOwner: isChapterAudioOwner,
                isChapterOwner: isChapterOwner,
                isLoggedIn: isLoggedIn,
                isOwned: isOwned,
                isFree: isFree,
                chapterId: chapter.chapterId,
                chapterTitle: chapter.title,
                audios: audios.map(a => ({ audioId: a.audioId, userId: a.userId || a.UserId }))
              });
            }
            
            // Logic kiểm tra quyền truy cập: owner của chapter audio hoặc owner của sách hoặc đã mua hoặc free
            const hasAudioAccess = isOwned || isChapterOwner || isFree;
            const canAccess = hasAudioAccess;
            
            return (
              <div key={chapter.id} className="space-y-1">
                {/* Chapter header - clickable */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    // Luôn cho phép toggle expand để xem danh sách giọng
                    if (audios.length > 0) {
                      toggleChapterExpand(index);
                    }
                    
                    // Chỉ chuyển chương nếu có quyền truy cập
                    if (!isLoggedIn) {
                      toast.error("Bạn phải đăng nhập để nghe audio");
                      return;
                    }
                    if (!isOwned && !isFree && !isChapterOwner) {
                      toast.error("Bạn cần mua audio này để nghe");
                      return;
                    }
                    
                    // Chọn giọng đầu tiên nếu có
                    if (audios.length > 0 && audios[0].voiceName) {
                      setSelectedVoice(audios[0].voiceName);
                    }
                    
                    jumpToChapter(index);
                  }}
                  className={`group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all min-w-0 w-full ${
                    isCurrentChapter
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 cursor-pointer"
                      : !isLoggedIn || (!hasAudioAccess && !isChapterOwner)
                      ? "bg-gray-700/30 opacity-50 cursor-not-allowed"
                      : "bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 hover:border-gray-500 cursor-pointer"
                  }`}
                >
                  {/* Chapter Number Badge */}
                  <div className={`flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCurrentChapter 
                      ? "bg-blue-800/50 text-white shadow-inner" 
                      : "bg-gray-600/50 text-gray-300 group-hover:bg-gray-600"
                  }`}>
                    {chapter.chapterNumber || index + 1}
                  </div>
                  
                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 min-w-0">
                      <RiPlayCircleLine className={`text-base sm:text-lg flex-shrink-0 transition-colors ${
                        hasAudioAccess 
                          ? isCurrentChapter ? "text-white" : "text-green-400" 
                          : "text-gray-500"
                      }`} />
                      <div className={`font-semibold truncate text-sm sm:text-base min-w-0 flex-1 ${
                        isCurrentChapter ? "text-white" : "text-gray-200"
                      }`}>
                        {chapter.title}
                      </div>
                      {isChapterOwner && (
                        <span className="text-green-300 text-xs font-medium bg-green-500/20 px-1.5 sm:px-2 py-0.5 rounded-full border border-green-500/30 flex-shrink-0 whitespace-nowrap">
                          {isChapterAudioOwner ? "Audio của bạn" : "Sách của bạn"}
                        </span>
                      )}
                      {!isChapterOwner && isOwned && (
                        <RiCheckboxCircleLine className="text-green-400 text-base sm:text-lg flex-shrink-0" />
                      )}
                    </div>
                    <div className={`text-xs flex items-center gap-3 ${
                      isCurrentChapter ? "text-blue-100" : "text-gray-400"
                    }`}>
                      {/* <span className="flex items-center gap-1">
                        <span>⏱</span>
                        <span>{formatTime(chapter.duration)}</span>
                      </span> */}
                      {audios.length > 0 && (
                        <span className="flex items-center gap-1">
                          <RiVoiceprintLine className="text-xs" />
                          <span>{audios.length} giọng</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Nút mua ngay - chỉ hiện khi đã đăng nhập, chưa mua, không phải owner của chapter audio và không phải free */}
                  {isLoggedIn && !isChapterOwner && !isOwned && !isFree && chapter.priceAudio > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPurchaseModal({ open: true, chapter });
                      }}
                      className="flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center gap-1 sm:gap-1.5 transform hover:scale-105 !opacity-100"
                      style={{ opacity: 1 }}
                    >
                      <RiShoppingCartLine className="text-xs sm:text-sm" />
                      <span className="hidden sm:inline">Mua ngay</span>
                    </button>
                  )}
                  
                  {/* Playing Indicator */}
                  {isCurrentChapter && (
                    <div className="flex-shrink-0 flex items-center gap-1 mr-2">
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '0.15s'}}></div>
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  )}
                  
                  {/* Expand/Collapse indicator */}
                  {audios.length > 0 && (
                    <div className={`flex-shrink-0 p-1.5 ${
                      isCurrentChapter 
                        ? "text-white" 
                        : "text-gray-400"
                    }`}>
                      {isExpanded ? (
                        <RiArrowDownSLine className="text-lg" />
                      ) : (
                        <RiArrowRightSLine className="text-lg" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Voice list - expanded */}
                {isExpanded && audios.length > 0 && (
                  <div className="ml-4 space-y-1.5 border-l-2 border-blue-500/50 pl-4 pt-1 min-w-0">
                    {audios.map((audio) => (
                      <button
                        key={audio.audioId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          
                          // Kiểm tra quyền truy cập trước khi chuyển chương (giống BookDetailsPage)
                          if (!isLoggedIn) {
                            toast.error("Bạn phải đăng nhập để nghe audio");
                            return;
                          }
                          if (!isOwned && !isFree && !isChapterOwner) {
                            toast.error("Bạn cần mua audio này để nghe");
                            return;
                          }
                          
                          setSelectedVoice(audio.voiceName);
                          jumpToChapter(index);
                        }}
                        className={`w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-between min-w-0 ${
                          isCurrentChapter && selectedVoice === audio.voiceName
                            ? "bg-blue-600/80 text-white font-medium shadow-md border border-blue-400/50"
                            : "bg-gray-700/50 hover:bg-gray-700 text-gray-300 border border-gray-600/30 hover:border-gray-500"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <RiVoiceprintLine className={`text-sm sm:text-base flex-shrink-0 ${
                            isCurrentChapter && selectedVoice === audio.voiceName 
                              ? "text-white" 
                              : "text-blue-400"
                          }`} />
                          <span className="font-medium truncate">{getVoiceDisplayName(audio.voiceName)}</span>
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                          isCurrentChapter && selectedVoice === audio.voiceName 
                            ? "text-blue-100" 
                            : "text-gray-400"
                        }`}>
                          {/* <span>
                            {Math.floor((audio.durationSec || 0) / 60)}:{((audio.durationSec || 0) % 60).toString().padStart(2, '0')}
                          </span> */}
                          {isCurrentChapter && selectedVoice === audio.voiceName && (
                            <span className="text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Purchase Confirmation Modal */}
        {purchaseModal.open && purchaseModal.chapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Xác nhận mua audio</h3>
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
                    <span className="text-white font-medium">{purchaseModal.chapter.title}</span>
                  </div>
                  {(() => {
                    const basePriceAudio = purchaseModal.chapter.priceAudio || 0;
                    const hasBookPromotion =
                      promotionInfo.hasPromotion &&
                      promotionInfo.discountType === "Percent" &&
                      promotionInfo.discountValue;
                    const discountPercent = hasBookPromotion ? (promotionInfo.discountValue || 0) : 0;
                    const effectivePriceAudio = discountPercent > 0
                      ? Math.round(basePriceAudio * (1 - discountPercent / 100) * 100) / 100
                      : basePriceAudio;

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Giá:</span>
                          <div className="text-right">
                            {hasBookPromotion && discountPercent > 0 ? (
                              <>
                                <div className="text-gray-400 line-through text-xs">
                                  {basePriceAudio.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                                </div>
                                <div className="text-orange-400 font-bold">
                                  {effectivePriceAudio.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                                </div>
                              </>
                            ) : (
                              <div className="text-orange-400 font-bold">
                                {basePriceAudio.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-600">
                          <span className="text-gray-400">Xu hiện có:</span>
                          <span className="text-white font-medium">
                            {coins.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Xu còn lại:</span>
                          <span className={`font-medium ${
                            coins >= effectivePriceAudio
                              ? "text-green-400" 
                              : "text-red-400"
                          }`}>
                            {(coins - effectivePriceAudio).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} xu
                          </span>
                        </div>
                      </>
                    );
                  })()}
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
                    onClick={handlePurchase}
                    disabled={isPurchasing || coins < (purchaseModal.chapter.priceAudio || 0)}
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
        )}
    </div>
  );
}

