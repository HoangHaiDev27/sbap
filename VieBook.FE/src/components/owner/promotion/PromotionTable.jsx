import React, { useState } from "react";
import { RiEdit2Line, RiDeleteBin6Line, RiCoinLine } from "react-icons/ri";

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

export default function PromotionTable({ promotions, onEdit }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
  const currentData = promotions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (!promotions.length) return <p className="text-white">Chưa có promotion nào</p>;

  return (
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
                  <button className="p-2 bg-red-500 rounded hover:bg-red-600">
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
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded text-sm ${page === 1
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Trước
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${page === i + 1
                ? "bg-orange-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded text-sm ${page === totalPages
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}