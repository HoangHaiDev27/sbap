import React, { useState } from "react";
import { RiEdit2Line, RiDeleteBin6Line, RiCoinLine } from "react-icons/ri";
import { deletePromotion } from "../../../api/promotionApi";
import { getUserId } from "../../../api/authApi";

const ITEMS_PER_PAGE = 6;

function getPromotionStatus(promo) {
  const now = new Date();
  const start = new Date(promo.startAt);
  const end = new Date(promo.endAt);

  if (now < start) return { label: "Sắp diễn ra", className: "bg-yellow-600" };
  if (now > end) return { label: "Kết thúc", className: "bg-gray-500" };
  if (promo.isActive) return { label: "Đang hoạt động", className: "bg-green-600" };
  return { label: "Không hoạt động", className: "bg-red-600" };
}

export default function PromotionTable({ promotions, onEdit, onDeleted }) {
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
  const currentData = promotions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleDelete = async () => {
    try {
      if (!confirmDelete) return;
      const ownerId = getUserId();
      await deletePromotion(confirmDelete.promotionId, ownerId);

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "success", message: "Đã vô hiệu hoá promotion" }
      }));

      if (onDeleted) onDeleted();
      setConfirmDelete(null);
    } catch (err) {
      console.error("Lỗi xoá:", err);
      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "error", message: err.message || "Xoá thất bại" }
      }));
    }
  };


  if (!promotions.length) return <p className="text-white">Chưa có promotion nào</p>;

  return (
    <div>
      <div className="overflow-x-auto bg-slate-900 text-white rounded-2xl shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-3">Promotion & Sách</th>
              <th className="p-3">Loại & Giá trị</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hiệu quả</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((promo, i) => {
              const status = getPromotionStatus(promo);
              return (
                <tr
                  key={promo.promotionId}
                  className={`border-b border-slate-600 ${i % 2 === 0 ? "bg-slate-800" : "bg-slate-700"} hover:bg-slate-600 transition`}
                >
                  <td className="p-3">
                    <p className="font-semibold">{promo.promotionName}</p>
                    <p className="text-xs opacity-70">{promo.book?.title}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-orange-400">
                      {promo.discountType === "Percent"
                        ? `${promo.discountValue}%`
                        : `${promo.discountValue.toLocaleString()} đ`}
                    </p>
                    <p className="text-xs opacity-70 flex items-center gap-1">
                      {promo.book?.totalPrice?.toLocaleString()} <RiCoinLine className="inline text-yellow-400" /> →{" "}
                      {promo.book?.discountedPrice?.toLocaleString()} <RiCoinLine className="inline text-yellow-400" />
                    </p>
                  </td>
                  <td className="p-3">
                    {new Date(promo.startAt).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(promo.endAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <span className={`${status.className} text-white px-2 py-1 rounded-lg text-xs`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3">
                    {0}/{promo.quantity} lượt
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button
                      className="p-2 bg-green-500 rounded hover:bg-green-600"
                      onClick={() => onEdit && onEdit(promo)}
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      className="p-2 bg-red-500 rounded hover:bg-red-600"
                      onClick={() => setConfirmDelete(promo)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
{totalPages > 1 && (
  <div className="flex justify-center items-center gap-2 mt-4">
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => Math.max(p - 1, 1))}
      className={`px-3 py-1 rounded ${page === 1 ? "bg-gray-600 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600"}`}
    >
      Trước
    </button>

    {/* Hiển thị số trang */}
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setPage(i + 1)}
        className={`px-3 py-1 rounded ${
          page === i + 1 ? "bg-orange-500 text-white" : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        {i + 1}
      </button>
    ))}

    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
      className={`px-3 py-1 rounded ${page === totalPages ? "bg-gray-600 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600"}`}
    >
      Sau
    </button>
  </div>
)}

      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-white w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Xác nhận xoá</h2>
            <p>
              Bạn có chắc chắn muốn xoá promotion{" "}
              <span className="text-orange-400">{confirmDelete.promotionName}</span> không?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}