import { useEffect, useState } from "react";
import PromotionStats from "../../components/owner/promotion/PromotionStats";
import PromotionTable from "../../components/owner/promotion/PromotionTable";
import PromotionFormModal from "../../components/owner/promotion/PromotionFormModal";
import { getUserId } from "../../api/authApi";
import { getPromotionsByOwner } from "../../api/promotionApi";

export default function PromotionPage() {
  const [open, setOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [editingPromotion, setEditingPromotion] = useState(null); // state edit

  const fetchPromotions = async () => {
    try {
      const ownerId = getUserId();
      if (!ownerId) return;
      const data = await getPromotionsByOwner(ownerId);
      setPromotions(data);
    } catch (err) {
      console.error("Lỗi load promotions:", err);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filter promotions theo tên hoặc tên sách
  const filteredPromotions = promotions.filter((p) => {
    const lowerSearch = searchText.toLowerCase();
    const promotionMatch = p.promotionName?.toLowerCase().includes(lowerSearch);
    const bookMatch = p.book?.title?.toLowerCase().includes(lowerSearch);
    return promotionMatch || bookMatch;
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quản lý Promotion</h1>

      <PromotionStats promotions={filteredPromotions} />

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Tìm kiếm promotion hoặc sách..."
          className="px-3 py-2 border rounded-lg w-1/3 bg-slate-800 text-white"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setOpen(true)}
        >
          + Tạo Promotion
        </button>
      </div>

      <PromotionTable promotions={filteredPromotions} onEdit={handleEdit} />

      <PromotionFormModal
        isOpen={open}
        onClose={handleCloseModal}
        onCreated={fetchPromotions} // reload table
        editingPromotion={editingPromotion} // truyền promotion đang edit
      />
    </div>
  );
}
