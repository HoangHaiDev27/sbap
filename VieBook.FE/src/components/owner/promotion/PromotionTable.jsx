import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiEdit2Line, RiDeleteBin6Line, RiCoinLine } from "react-icons/ri";
import { deletePromotion } from "../../../api/promotionApi";
import { getUserId } from "../../../api/authApi";

const ITEMS_PER_PAGE = 6;

function getPromotionStatus(promo) {
  // So sánh timestamp chính xác đến millisecond
  const now = new Date().getTime();
  const start = new Date(promo.startAt).getTime();
  const end = new Date(promo.endAt).getTime();

  // Ưu tiên kiểm tra thời gian trước
  if (now < start) {
    return { label: "Sắp diễn ra", className: "bg-yellow-600" };
  }
  if (now > end) {
    return { label: "Kết thúc", className: "bg-gray-500" };
  }
  // Nếu đang trong khoảng thời gian, kiểm tra isActive
  if (now >= start && now <= end) {
    if (promo.isActive) {
      return { label: "Đang hoạt động", className: "bg-green-600" };
    }
    return { label: "Không hoạt động", className: "bg-red-600" };
  }
  return { label: "Không hoạt động", className: "bg-red-600" };
}

export default function PromotionTable({ promotions, onEdit, onDeleted }) {
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

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
      <div className="bg-slate-900 text-white rounded-2xl shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-3">Khuyến mãi & Sách</th>
              <th className="p-3">Loại & Giá trị</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center w-28">Hành động</th>
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
                  <td className="p-3 cursor-pointer align-top" onClick={() => navigate(`/owner/promotions/${promo.promotionId}`)}>
                    <p className="font-semibold truncate pr-4">{promo.promotionName}</p>
                    <div className="text-xs opacity-80">
                      {Array.isArray(promo.books) && promo.books.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {promo.books.slice(0,3).map((b) => (
                            <span key={b.bookId} className="bg-slate-600 px-2 py-0.5 rounded">
                              {b.title}
                            </span>
                          ))}
                          {promo.books.length > 3 && (
                            <span className="opacity-60">+{promo.books.length - 3} nữa</span>
                          )}
                        </div>
                      ) : (
                        <span className="opacity-60">Chưa có sách</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 align-top">
                    <p className="font-medium text-orange-400">
                      {promo.discountType === "Percent"
                        ? `${promo.discountValue}%`
                        : `${promo.discountValue.toLocaleString()} đ`}
                    </p>
                    {/* Hiển thị tổng giá của tất cả sách trong promotion */}
                    {Array.isArray(promo.books) && promo.books.length > 0 && (
                      <p className="text-xs opacity-70 flex items-center gap-1">
                        {promo.books.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()} <RiCoinLine className="inline text-yellow-400" /> →{" "}
                        {promo.books.reduce((sum, b) => sum + (b.discountedPrice || 0), 0).toLocaleString()} <RiCoinLine className="inline text-yellow-400" />
                      </p>
                    )}
                  </td>
                  <td className="p-3 align-top whitespace-nowrap">
                    {new Date(promo.startAt).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(promo.endAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 align-top">
                    <span className={`${status.className} text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 align-top flex gap-2 justify-center">
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