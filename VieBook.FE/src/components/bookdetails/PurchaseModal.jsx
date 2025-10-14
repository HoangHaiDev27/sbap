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
  
  const { coins, setCoins } = useCoinsStore();
  const { addNotification } = useNotificationStore();
  const { userId } = useCurrentUser();
  const navigate = useNavigate();

  // Load purchased chapters when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadPurchasedChapters();
    }
  }, [isOpen, userId]);

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

  // Tính tổng giá
  const totalPrice = selectedChapters.reduce((sum, chapterId) => {
    const chapter = chapters.find(ch => ch.chapterId === chapterId);
    return sum + (chapter?.priceAudio || 0);
  }, 0);

  // Xử lý chọn/bỏ chọn chapter
  const toggleChapter = (chapterId) => {
    // Không cho phép chọn chương đã mua
    if (purchasedChapters.includes(chapterId)) {
      return;
    }
    
    setSelectedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Xử lý mua
  const handlePurchase = async () => {
    if (selectedChapters.length === 0) {
      toast.error("Vui lòng chọn ít nhất một chương để mua");
      return;
    }

    if (coins < totalPrice) {
      toast.error("Số xu trong ví không đủ để mua các chương đã chọn");
      return;
    }

    setIsPurchasing(true);
    
    try {
      // Gọi API mua chapter
      const response = await purchaseChapters(bookId, selectedChapters);
      console.log("Chapter purchase response:", response);
      
      if (response.error === 0 && response.data.success) {
        // Cập nhật số xu từ response
        console.log("PurchaseModal - Response data:", response.data);
        console.log("PurchaseModal - remainingBalance:", response.data.remainingBalance);
        setCoins(response.data.remainingBalance);
        
        // Thêm thông báo
        const notification = {
          notificationId: Date.now(),
          userId: userId,
          type: "BOOK_PURCHASE",
          title: "Mua chương thành công",
          body: `Bạn đã mua thành công ${selectedChapters.length} chương của "${bookTitle}". Tổng chi phí: ${parseFloat(totalPrice.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} xu.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          userName: "User",
          userEmail: "user@example.com"
        };
        
        addNotification(notification);
        
        // Đóng modal và reset
        onClose();
        setSelectedChapters([]);
        
        // Reload purchased chapters after successful purchase
        await loadPurchasedChapters();
        
        if (onPurchaseSuccess) {
          onPurchaseSuccess(selectedChapters);
        }
        
        toast.success(`Mua thành công ${selectedChapters.length} chương với giá ${totalPrice.toLocaleString()} xu!`);
      } else {
        toast.error(response.data?.message || response.message || "Có lỗi xảy ra khi mua chương. Vui lòng thử lại.");
      }
      
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <RiShoppingCartLine className="text-orange-500 text-xl sm:text-2xl flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">Mua chương sách</h2>
              <p className="text-gray-400 text-xs sm:text-sm truncate">{bookTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <RiCloseLine className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-96 overflow-y-auto">
          {/* Số dư ví */}
          <div className="bg-gray-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiCoinLine className="text-yellow-400 text-lg sm:text-xl" />
                <span className="text-white font-medium text-sm sm:text-base">Số dư ví</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold text-base sm:text-lg">
                  {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
                </span>
                <button
                  onClick={handleRecharge}
                  className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs sm:text-sm"
                  title="Nạp xu"
                >
                  <RiAddLine className="text-sm" />
                  <span className="hidden sm:inline">Nạp xu</span>
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={toggleSelectAll}
              className={`px-6 py-2 text-white text-sm rounded-lg transition-all duration-300 ${
                buttonState === 'selecting'
                  ? "bg-green-600 scale-105 shadow-lg"
                  : buttonState === 'deselecting'
                  ? "bg-red-600 scale-105 shadow-lg"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {buttonState === 'selecting' 
                ? "✓ Đã chọn tất cả" 
                : buttonState === 'deselecting'
                ? "✓ Đã bỏ chọn"
                : selectedChapters.length > 0 
                  ? "Bỏ chọn tất cả" 
                  : "Chọn tất cả"
              }
            </button>
            
            {/* Debug info */}
            <div className="text-xs text-gray-400">
              {loadingPurchases ? (
                <span>Đang tải...</span>
              ) : (
                <span>Đã mua: {purchasedChapters.length} chương</span>
              )}
            </div>
          </div>

          {/* Danh sách chương */}
          <div className="space-y-2">
            {chapters.map((chapter, index) => {
              const isSelected = selectedChapters.includes(chapter.chapterId);
              const isPurchased = purchasedChapters.includes(chapter.chapterId);
              const isFree = !chapter.priceAudio || chapter.priceAudio === 0;
              const duration = Math.round((chapter.durationSec || 0) / 60);
              const chapterNumber = index + 1;
              const isDisabled = isPurchased || isFree;
              
              // Debug log
              console.log(`Chapter ${chapterNumber}: isPurchased=${isPurchased}, purchasedChapters=`, purchasedChapters, 'chapterId=', chapter.chapterId);
              if (isPurchased) {
                console.log(`✓ Chapter ${chapterNumber} (${chapter.chapterTitle}) is purchased`);
              }
              
              return (
                <div
                  key={chapter.chapterId}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                    isPurchased
                      ? "border-green-500 bg-green-500/10 cursor-not-allowed opacity-75"
                      : isFree
                      ? "border-gray-600 bg-gray-700/50 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "border-orange-500 bg-orange-500/10 cursor-pointer"
                      : "border-gray-600 hover:border-gray-500 bg-gray-700/50 cursor-pointer"
                  }`}
                  onClick={() => !isDisabled && toggleChapter(chapter.chapterId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white text-sm sm:text-base truncate">
                          Chương {chapterNumber}: {chapter.chapterTitle?.replace(/chuogn/g, 'chương') || ''}
                        </h3>
                        {isSelected && !isPurchased && (
                          <RiCheckLine className="text-orange-500 text-lg flex-shrink-0" />
                        )}
                        {isPurchased && (
                          <RiCheckboxCircleLine className="text-green-500 text-lg flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <RiPlayCircleLine className="text-sm" />
                          {duration} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <RiBookOpenLine className="text-sm" />
                          {chapter.chapterView} lượt xem
                        </span>
                        {isPurchased && (
                          <span className="flex items-center gap-1 text-green-400 font-medium">
                            <RiCheckboxCircleLine className="text-sm" />
                            Đã mua
                          </span>
                        )}
                        {isFree && !isPurchased && (
                          <span className="flex items-center gap-1 text-blue-400 font-medium">
                            <RiCheckboxCircleLine className="text-sm" />
                            Miễn phí
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      {isPurchased ? (
                        <div className="text-green-500 font-bold text-base sm:text-lg">
                          Đã mua
                        </div>
                      ) : isFree ? (
                        <div className="text-blue-500 font-bold text-base sm:text-lg">
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

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <div className="text-gray-300 text-sm sm:text-base">
              <span>Đã chọn: </span>
              <span className="font-bold text-white">{selectedChapters.length}</span>
              <span> chương</span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-gray-400 text-xs sm:text-sm">Tổng cộng</div>
              <div className="text-orange-500 font-bold text-lg sm:text-xl flex items-center gap-1">
                {totalPrice.toLocaleString()}
                <RiCoinLine className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Hủy
            </button>
            <button
              onClick={handlePurchase}
              disabled={selectedChapters.length === 0 || coins < totalPrice || isPurchasing}
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isPurchasing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Đang xử lý...</span>
                  <span className="sm:hidden">Đang xử lý</span>
                </>
              ) : (
                <>
                  <RiShoppingCartLine className="text-sm sm:text-base" />
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
