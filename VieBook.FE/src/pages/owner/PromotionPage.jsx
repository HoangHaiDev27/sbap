import { useEffect, useState, useCallback } from "react";
import PromotionStats from "../../components/owner/promotion/PromotionStats";
import PromotionTable from "../../components/owner/promotion/PromotionTable";
import PromotionFormModal from "../../components/owner/promotion/PromotionFormModal";
import { getUserId } from "../../api/authApi";
import { getPromotionsByOwner, getInactivePromotionsByOwner } from "../../api/promotionApi";

export default function PromotionPage() {
  const [open, setOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [inactivePromotions, setInactivePromotions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editingPromotion, setEditingPromotion] = useState(null); // state edit
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false); // checkbox để hiển thị inactive

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const ownerId = getUserId();
      if (!ownerId) {
        setLoading(false);
        return;
      }
      const data = await getPromotionsByOwner(ownerId);
      setPromotions(data || []);
    } catch (err) {
      console.error("Lỗi load promotions:", err);
      // Đảm bảo set loading false ngay cả khi có lỗi
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInactivePromotions = useCallback(async () => {
    try {
      const ownerId = getUserId();
      if (!ownerId) return;
      const data = await getInactivePromotionsByOwner(ownerId);
      setInactivePromotions(data || []);
    } catch (err) {
      console.error("Lỗi load inactive promotions:", err);
      setInactivePromotions([]);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchInactivePromotions();
  }, [fetchPromotions, fetchInactivePromotions]);

  // Chọn danh sách promotions để hiển thị (active hoặc inactive)
  const currentPromotions = showInactive ? inactivePromotions : promotions;

  // Filter promotions theo tên hoặc tên của bất kỳ sách nào
  const filteredPromotions = currentPromotions.filter((p) => {
    const lowerSearch = searchText.toLowerCase();
    const promotionMatch = p.promotionName?.toLowerCase().includes(lowerSearch);
    const anyBookMatch = Array.isArray(p.books)
      ? p.books.some((b) => b.title?.toLowerCase().includes(lowerSearch))
      : false;
    return promotionMatch || anyBookMatch;
  });

  // mở modal edit
  const handleEdit = (promo) => {
    setEditingPromotion(promo);
    setOpen(true);
  };

  // đóng modal và reset edit
  const handleCloseModal = () => {
    setOpen(false);
    setEditingPromotion(null);
  };

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Quản lý Khuyến mãi</h1>

      <PromotionStats refreshTrigger={promotions.length} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm khuyến mãi hoặc sách..."
            className="px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-600 rounded-lg w-full sm:flex-1 sm:max-w-md bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group w-full sm:w-auto">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => {
                  setShowInactive(e.target.checked);
                  if (e.target.checked) {
                    fetchInactivePromotions();
                  }
                }}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                showInactive ? 'bg-orange-500' : 'bg-slate-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  showInactive ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </div>
            <span className="text-white text-sm sm:text-base font-medium group-hover:text-orange-400 transition-colors">
              {showInactive ? 'Đã vô hiệu hóa' : 'Hiển thị đã vô hiệu hóa'}
            </span>
          </label>
        </div>
        {!showInactive && (
          <button
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto text-sm sm:text-base min-h-[44px]"
            onClick={() => setOpen(true)}
          >
            + Tạo Khuyến mãi
          </button>
        )}
      </div>

      <PromotionTable 
        promotions={filteredPromotions} 
        onEdit={handleEdit} 
        onDeleted={() => {
          fetchPromotions();
          if (showInactive) {
            fetchInactivePromotions();
          }
        }}
      />

      <PromotionFormModal
        isOpen={open}
        onClose={handleCloseModal}
        onCreated={fetchPromotions} // reload table
        editingPromotion={editingPromotion} // truyền promotion đang edit
      />
    </div>
  );
}
