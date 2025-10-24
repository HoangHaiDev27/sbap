import React, { useState, useEffect } from "react";
import { 
  RiCloseLine, 
  RiShoppingCartLine, 
  RiCoinLine,
  RiCheckLine,
  RiPlayCircleLine,
  RiBookOpenLine,
  RiAddLine,
  RiCheckboxCircleLine
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { purchaseChapters, getMyPurchases } from "../../api/chapterPurchaseApi";
import { getChapterAudioPrices } from "../../api/ownerBookApi";
import toast from "react-hot-toast";

export default function PurchaseModal({ 
  isOpen, 
  onClose, 
  bookTitle, 
  bookId,
  chapters = [], 
  onPurchaseSuccess 
}) {
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchasedChapters, setPurchasedChapters] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [buttonState, setButtonState] = useState('normal'); // Track button state: 'normal', 'selecting', 'deselecting'
  const [selectedSoftChapters, setSelectedSoftChapters] = useState([]);
  const [selectedAudioChapters, setSelectedAudioChapters] = useState([]);
  const [audioPrices, setAudioPrices] = useState({});
  
  const { coins, setCoins } = useCoinsStore();
  const { addNotification } = useNotificationStore();
  const { userId } = useCurrentUser();
  const navigate = useNavigate();

  // Load purchased chapters when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadPurchasedChapters();
      loadAudioPrices();
    }
  }, [isOpen, userId]);

  // Load audio prices
  const loadAudioPrices = async () => {
    try {
      const prices = await getChapterAudioPrices(bookId);
      setAudioPrices(prices);
    } catch (err) {
      console.error("Failed to load audio prices:", err);
    }
  };

  const loadPurchasedChapters = async () => {
    try {
      setLoadingPurchases(true);
      const response = await getMyPurchases();
      console.log("All purchases response:", response);
      
      // Backend trả về format: { code: 0, message: "Success", data: [...] }
      const purchases = response?.data || [];
      console.log("All purchases data:", purchases);
      
      // Lấy tất cả chương đã mua (không filter theo bookId)
      const purchasedChapterIds = [];
      
      if (Array.isArray(purchases)) {
        // Lấy tất cả chapterIds đã mua
        purchasedChapterIds.push(...purchases.map(p => p.chapterId));
      }
      
      console.log("Purchased chapter IDs for all books:", purchasedChapterIds);
      setPurchasedChapters(purchasedChapterIds);
    } catch (error) {
      console.error("Error loading purchased chapters:", error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Tính tổng giá cho bản mềm
  const softTotalPrice = selectedSoftChapters.reduce((sum, chapterId) => {
    const chapter = chapters.find(ch => ch.chapterId === chapterId);
    return sum + (chapter?.priceAudio || 0);
  }, 0);

  // Tính tổng giá cho bản audio
  const audioTotalPrice = selectedAudioChapters.reduce((sum, chapterId) => {
    const audioPrice = audioPrices[chapterId] || 0;
    return sum + audioPrice;
  }, 0);

  // Tổng giá tất cả
  const totalPrice = softTotalPrice + audioTotalPrice;

  // Xử lý chọn/bỏ chọn bản mềm
  const toggleSoftChapter = (chapterId) => {
    if (purchasedChapters.includes(chapterId)) return;
    
    setSelectedSoftChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Xử lý chọn/bỏ chọn bản audio
  const toggleAudioChapter = (chapterId) => {
    if (purchasedChapters.includes(chapterId)) return;
    
    setSelectedAudioChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Xử lý mua cả hai
  const toggleBothChapter = (chapterId) => {
    if (purchasedChapters.includes(chapterId)) return;
    
    const isSelected = selectedSoftChapters.includes(chapterId) && selectedAudioChapters.includes(chapterId);
    
    if (isSelected) {
      // Bỏ chọn cả hai
      setSelectedSoftChapters(prev => prev.filter(id => id !== chapterId));
      setSelectedAudioChapters(prev => prev.filter(id => id !== chapterId));
    } else {
      // Chọn cả hai
      setSelectedSoftChapters(prev => [...prev, chapterId]);
      setSelectedAudioChapters(prev => [...prev, chapterId]);
    }
  };

  // Xử lý mua
  const handlePurchase = async () => {
    const totalSelected = selectedSoftChapters.length + selectedAudioChapters.length;
    if (totalSelected === 0) {
      toast.error("Vui lòng chọn ít nhất một chương để mua");
      return;
    }

    if (coins < totalPrice) {
      toast.error("Số xu trong ví không đủ để mua các chương đã chọn");
      return;
    }

    setIsPurchasing(true);
    
    try {
      // Mua bản mềm
      if (selectedSoftChapters.length > 0) {
        await purchaseChapters(bookId, selectedSoftChapters, 'soft');
      }
      
      // Mua bản audio
      if (selectedAudioChapters.length > 0) {
        await purchaseChapters(bookId, selectedAudioChapters, 'audio');
      }
      
      console.log("Chapter purchase completed");
      
      // Cập nhật số xu (giảm đi tổng giá)
      setCoins(coins - totalPrice);
      
      // Thêm thông báo
      const notification = {
        notificationId: Date.now(),
        userId: userId,
        type: "BOOK_PURCHASE",
        title: "Mua chương thành công",
        body: `Bạn đã mua thành công ${totalSelected} chương của "${bookTitle}". Tổng chi phí: ${parseFloat(totalPrice.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} xu.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userName: "User",
        userEmail: "user@example.com"
      };
      
      addNotification(notification);
      
      // Đóng modal và reset
      onClose();
      setSelectedSoftChapters([]);
      setSelectedAudioChapters([]);
      
      // Reload purchased chapters after successful purchase
      await loadPurchasedChapters();
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess([...selectedSoftChapters, ...selectedAudioChapters]);
      }
      
      toast.success(`Mua thành công ${totalSelected} chương với giá ${totalPrice.toLocaleString()} xu!`);
      
    } catch (error) {
      console.error("Error purchasing chapters:", error);
      toast.error("Có lỗi xảy ra khi mua chương. Vui lòng thử lại.");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Toggle chọn tất cả / bỏ chọn tất cả
  const toggleSelectAll = () => {
    const availableChapters = chapters
      .filter(ch => {
        const isPurchased = purchasedChapters.includes(ch.chapterId);
        const isFree = !ch.priceAudio || ch.priceAudio === 0;
        return !isPurchased && !isFree;
      })
      .map(ch => ch.chapterId);
    
    const allAvailableSelected = availableChapters.length > 0 && 
      availableChapters.every(chapterId => selectedChapters.includes(chapterId));
    
    if (allAvailableSelected) {
      // Nếu đã chọn tất cả -> bỏ chọn tất cả
      setSelectedChapters([]);
      setButtonState('deselecting');
    } else {
      // Nếu chưa chọn tất cả -> chọn tất cả
      setSelectedChapters(availableChapters);
      setButtonState('selecting');
    }
    
    // Reset button state after 1.5 seconds
    setTimeout(() => setButtonState('normal'), 1500);
  };

  // Xử lý nạp xu
  const handleRecharge = () => {
    onClose(); // Đóng modal trước
    navigate("/recharge"); // Chuyển sang trang nạp tiền
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-6">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80vh] overflow-hidden shadow-2xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 lg:p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <RiShoppingCartLine className="text-orange-500 text-lg sm:text-xl md:text-2xl flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">Mua chương sách</h2>
              <p className="text-gray-400 text-xs sm:text-sm truncate">{bookTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-1 sm:ml-2"
          >
            <RiCloseLine className="text-gray-400 text-lg sm:text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 overflow-y-auto min-h-0">
          {/* Số dư ví */}
          <div className="bg-gray-700 rounded-lg p-2.5 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <RiCoinLine className="text-yellow-400 text-base sm:text-lg md:text-xl" />
                <span className="text-white font-medium text-sm sm:text-base">Số dư ví</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold text-sm sm:text-base md:text-lg">
                  {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
                </span>
                <button
                  onClick={handleRecharge}
                  className="p-1.5 sm:p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs sm:text-sm"
                  title="Nạp xu"
                >
                  <RiAddLine className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Nạp xu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Thông tin đã mua */}
          <div className="text-xs text-gray-400 text-center mb-4">
            {loadingPurchases ? (
              <span>Đang tải...</span>
            ) : (
              <span>Đã mua: {purchasedChapters.length} chương</span>
            )}
          </div>

          {/* Danh sách chương */}
          <div className="space-y-1.5 sm:space-y-2 max-h-96 sm:max-h-80 md:max-h-96 lg:max-h-[28rem] overflow-y-auto">
            {chapters.length > 8 && (
              <div className="text-center py-2 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  <RiBookOpenLine className="text-sm" />
                  <span>Cuộn để xem tất cả {chapters.length} chương</span>
                </div>
              </div>
            )}
            {chapters.map((chapter, index) => {
              const isPurchased = purchasedChapters.includes(chapter.chapterId);
              const isFree = !chapter.priceAudio || chapter.priceAudio === 0;
              const duration = Math.round((chapter.durationSec || 0) / 60);
              const chapterNumber = index + 1;
              const isDisabled = isPurchased || isFree;
              
              // Check if has audio
              const hasAudio = audioPrices[chapter.chapterId] > 0;
              
              // Check selections
              const isSoftSelected = selectedSoftChapters.includes(chapter.chapterId);
              const isAudioSelected = selectedAudioChapters.includes(chapter.chapterId);
              const isBothSelected = isSoftSelected && isAudioSelected;
              
              return (
                <div
                  key={chapter.chapterId}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isPurchased
                      ? "border-green-500 bg-green-500/10 cursor-not-allowed opacity-75"
                      : isFree
                      ? "border-gray-600 bg-gray-700/50 cursor-not-allowed opacity-60"
                      : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white text-sm">
                      Chương {chapterNumber}: {chapter.chapterTitle?.replace(/chuogn/g, 'chương') || ''}
                    </h3>
                    {isPurchased && (
                      <span className="text-green-400 text-sm font-medium">Đã mua</span>
                    )}
                    {isFree && !isPurchased && (
                      <span className="text-blue-400 text-sm font-medium">Miễn phí</span>
                    )}
                  </div>
                  
                  {/* Options */}
                  {!isDisabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Bản mềm */}
                      <button
                        onClick={() => toggleSoftChapter(chapter.chapterId)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          isSoftSelected
                            ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                            : 'border-gray-600 bg-gray-600/20 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <RiBookOpenLine className="text-sm" />
                          <span className="font-medium text-xs">Bản mềm</span>
                        </div>
                        <div className="text-xs text-orange-400 font-bold">
                          {chapter.priceAudio?.toLocaleString() || 0} xu
                        </div>
                      </button>
                      
                      {/* Bản audio */}
                      {hasAudio && (
                        <button
                          onClick={() => toggleAudioChapter(chapter.chapterId)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            isAudioSelected
                              ? 'border-green-500 bg-green-500/20 text-green-400'
                              : 'border-gray-600 bg-gray-600/20 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <RiPlayCircleLine className="text-sm" />
                            <span className="font-medium text-xs">Bản audio</span>
                          </div>
                          <div className="text-xs text-green-400 font-bold">
                            {audioPrices[chapter.chapterId]?.toLocaleString() || 0} xu
                          </div>
                        </button>
                      )}
                      
                      {/* Mua cả hai */}
                      {hasAudio && (
                        <button
                          onClick={() => toggleBothChapter(chapter.chapterId)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            isBothSelected
                              ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                              : 'border-gray-600 bg-gray-600/20 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <RiCheckLine className="text-sm" />
                            <span className="font-medium text-xs">Cả hai</span>
                          </div>
                          <div className="text-xs text-blue-400 font-bold">
                            {((chapter.priceAudio || 0) + (audioPrices[chapter.chapterId] || 0)).toLocaleString()} xu
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {chapters.length > 8 && (
              <div className="text-center py-2 mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-600/30 text-gray-400 text-xs rounded-full">
                  <span>Đã hiển thị tất cả {chapters.length} chương</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 border-t border-gray-700 bg-gray-700/30 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
            <div className="text-gray-300 text-xs sm:text-sm md:text-base">
              <span>Đã chọn: </span>
              <span className="font-bold text-white">{selectedSoftChapters.length + selectedAudioChapters.length}</span>
              <span> chương</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-gray-400 text-xs sm:text-sm">Tổng cộng</div>
              <div className="text-orange-500 font-bold text-base sm:text-lg md:text-xl flex items-center gap-1">
                {totalPrice.toLocaleString()}
                <RiCoinLine className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm md:text-base"
            >
              Hủy
            </button>
            <button
              onClick={handlePurchase}
              disabled={selectedSoftChapters.length + selectedAudioChapters.length === 0 || coins < totalPrice || isPurchasing}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
            >
              {isPurchasing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Đang xử lý...</span>
                  <span className="sm:hidden">Đang xử lý</span>
                </>
              ) : (
                <>
                  <RiShoppingCartLine className="text-xs sm:text-sm md:text-base" />
                  <span className="hidden sm:inline">Mua ngay</span>
                  <span className="sm:hidden">Mua</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
