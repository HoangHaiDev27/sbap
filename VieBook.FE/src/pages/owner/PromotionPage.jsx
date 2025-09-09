import { useState } from "react";
import PromotionStats from "../../components/owner/promotion/PromotionStats";
import PromotionTable from "../../components/owner/promotion/PromotionTable";
import PromotionFormModal from "../../components/owner/promotion/PromotionFormModal";

export default function PromotionPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Quản lý Promotion</h1>

      <PromotionStats />

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Tìm kiếm promotion..."
          className="px-3 py-2 border rounded-lg w-1/3 bg-slate-800 text-white"
        />
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          onClick={() => setOpen(true)}
        >
          + Tạo Promotion
        </button>
      </div>

      <PromotionTable />

      {/* Popup */}
      <PromotionFormModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
