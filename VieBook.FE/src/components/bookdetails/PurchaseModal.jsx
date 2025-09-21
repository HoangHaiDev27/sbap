import React, { useState } from "react";
import { 
  RiCloseLine, 
  RiShoppingCartLine, 
  RiCoinLine,
  RiCheckLine,
  RiPlayCircleLine,
  RiBookOpenLine
} from "react-icons/ri";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { purchaseChapters } from "../../api/chapterPurchaseApi";
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
  
  const { coins, setCoins } = useCoinsStore();
  const { addNotification } = useNotificationStore();
  const { userId } = useCurrentUser();

  // Tính tổng giá
  const totalPrice = selectedChapters.reduce((sum, chapterId) => {
    const chapter = chapters.find(ch => ch.chapterId === chapterId);
    return sum + (chapter?.priceAudio || 0);
  }, 0);

  // Xử lý chọn/bỏ chọn chapter
  const toggleChapter = (chapterId) => {
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

  // Chọn tất cả
  const selectAll = () => {
    setSelectedChapters(chapters.map(ch => ch.chapterId));
  };

  // Bỏ chọn tất cả
  const deselectAll = () => {
    setSelectedChapters([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <RiShoppingCartLine className="text-orange-500 text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-white">Mua chương sách</h2>
              <p className="text-gray-400 text-sm">{bookTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RiCloseLine className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Số dư ví */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiCoinLine className="text-yellow-400 text-xl" />
                <span className="text-white font-medium">Số dư ví</span>
              </div>
              <span className="text-yellow-400 font-bold text-lg">
                {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={selectAll}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Chọn tất cả
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              Bỏ chọn tất cả
            </button>
          </div>

          {/* Danh sách chương */}
          <div className="space-y-2">
            {chapters.map((chapter) => {
              const isSelected = selectedChapters.includes(chapter.chapterId);
              const duration = Math.round((chapter.durationSec || 0) / 60);
              
              return (
                <div
                  key={chapter.chapterId}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
                  }`}
                  onClick={() => toggleChapter(chapter.chapterId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">
                          {chapter.chapterTitle}
                        </h3>
                        {isSelected && (
                          <RiCheckLine className="text-orange-500 text-lg" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <RiPlayCircleLine />
                          {duration} phút
                        </span>
                        <span className="flex items-center gap-1">
                          <RiBookOpenLine />
                          {chapter.chapterView} lượt xem
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-500 font-bold text-lg">
                        {chapter.priceAudio?.toLocaleString() || 0} xu
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300">
              <span>Đã chọn: </span>
              <span className="font-bold text-white">{selectedChapters.length}</span>
              <span> chương</span>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm">Tổng cộng</div>
              <div className="text-orange-500 font-bold text-xl">
                {totalPrice.toLocaleString()} xu
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handlePurchase}
              disabled={selectedChapters.length === 0 || coins < totalPrice || isPurchasing}
              className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RiShoppingCartLine />
                  Mua ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
