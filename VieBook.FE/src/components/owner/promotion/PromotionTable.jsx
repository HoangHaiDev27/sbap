import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiEdit2Line, RiDeleteBin6Line, RiCoinLine, RiEyeLine } from "react-icons/ri";
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

  // Tự động điều chỉnh page khi promotions thay đổi (sau khi xóa)
  useEffect(() => {
    const newTotalPages = Math.ceil(promotions.length / ITEMS_PER_PAGE);
    setPage((currentPage) => {
      if (newTotalPages > 0 && currentPage > newTotalPages) {
        // Nếu trang hiện tại vượt quá tổng số trang, chuyển về trang cuối cùng
        return newTotalPages;
      } else if (newTotalPages === 0 && currentPage > 1) {
        // Nếu không còn trang nào, reset về trang 1
        return 1;
      }
      return currentPage; // Giữ nguyên trang hiện tại nếu không cần thay đổi
    });
  }, [promotions.length]);

  const handleDelete = async () => {
    try {
      if (!confirmDelete) return;
      const ownerId = getUserId();
      
      // Optimistic update: đóng modal ngay
      const deletedPromotionId = confirmDelete.promotionId;
      setConfirmDelete(null);
      
      // Gọi API xóa
      await deletePromotion(deletedPromotionId, ownerId);

      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "success", message: "Đã vô hiệu hoá promotion" }
      }));

      // Đảm bảo reload sau khi xóa thành công
      if (onDeleted) {
        await onDeleted();
      }
    } catch (err) {
      console.error("Lỗi xoá:", err);
      window.dispatchEvent(new CustomEvent("app:toast", {
        detail: { type: "error", message: err.message || "Xoá thất bại" }
      }));
      // Nếu có lỗi, reload lại để đảm bảo state đồng bộ
      if (onDeleted) {
        try {
          await onDeleted();
        } catch (reloadErr) {
          console.error("Lỗi reload sau khi xóa:", reloadErr);
        }
      }
    }
  };


  if (!promotions.length) return (
    <div className="bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-lg p-6 text-center">
      <p className="text-sm sm:text-base">Chưa có khuyến mãi nào</p>
    </div>
  );

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-3 whitespace-nowrap">Khuyến mãi & Sách</th>
              <th className="p-3 whitespace-nowrap">Loại & Giá trị</th>
              <th className="p-3 whitespace-nowrap">Thời gian</th>
              <th className="p-3 whitespace-nowrap">Trạng thái</th>
              <th className="p-3 text-center w-28 whitespace-nowrap">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((promo, i) => {
              const status = getPromotionStatus(promo);
              const isInactive = !promo.isActive;
              return (
                <tr
                  key={promo.promotionId}
                  className={`border-b border-slate-600 ${i % 2 === 0 ? "bg-slate-800" : "bg-slate-700"} hover:bg-slate-600 transition ${
                    isInactive ? "opacity-75" : ""
                  }`}
                >
                  <td className="p-3 cursor-pointer align-top" onClick={() => navigate(`/owner/promotions/${promo.promotionId}`)}>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold truncate pr-4 ${isInactive ? "line-through text-slate-400" : ""}`}>
                        {promo.promotionName}
                      </p>
                      {isInactive && (
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">Đã vô hiệu hóa</span>
                      )}
                    </div>
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
                  <td className="p-3 align-top whitespace-nowrap text-sm">
                    {new Date(promo.startAt).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(promo.endAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 align-top">
                    <span className={`${status.className} text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 align-top">
                    <div className="flex gap-2 justify-center">
                      {(() => {
                        // Kiểm tra trạng thái promotion
                        const now = new Date().getTime();
                        const start = new Date(promo.startAt).getTime();
                        const isUpcoming = now < start; // Chỉ "Sắp diễn ra" mới được sửa
                        
                        if (isInactive) {
                          // Nếu đã vô hiệu hóa, chỉ hiển thị nút xem detail
                          return (
                            <button
                              className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/owner/promotions/${promo.promotionId}`);
                              }}
                              title="Xem chi tiết"
                            >
                              <RiEyeLine />
                            </button>
                          );
                        }
                        
                        return (
                          <>
                            {/* Nút xem chi tiết */}
                            <button
                              className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/owner/promotions/${promo.promotionId}`);
                              }}
                              title="Xem chi tiết"
                            >
                              <RiEyeLine />
                            </button>
                            {/* Nút sửa - chỉ hiển thị nếu promotion chưa bắt đầu */}
                            {isUpcoming && (
                              <button
                                className="p-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit && onEdit(promo);
                                }}
                                title="Chỉnh sửa"
                              >
                                <RiEdit2Line />
                              </button>
                            )}
                            {/* Nút xóa - chỉ hiển thị nếu promotion chưa bắt đầu */}
                            {isUpcoming && (
                              <button
                                className="p-2 bg-red-500 rounded hover:bg-red-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete(promo);
                                }}
                                title="Xóa"
                              >
                                <RiDeleteBin6Line />
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {currentData.map((promo) => {
          const status = getPromotionStatus(promo);
          const isInactive = !promo.isActive;
          const now = new Date().getTime();
          const start = new Date(promo.startAt).getTime();
          const isUpcoming = now < start;

          return (
            <div
              key={promo.promotionId}
              className={`bg-slate-900 rounded-xl shadow-lg p-4 border border-slate-700 ${isInactive ? 'opacity-75' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold text-white truncate ${isInactive ? 'line-through text-slate-400' : ''}`}>
                      {promo.promotionName}
                    </h3>
                    {isInactive && (
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded flex-shrink-0">Đã vô hiệu hóa</span>
                    )}
                  </div>
                  <span className={`inline-block ${status.className} text-white px-2 py-1 rounded-lg text-xs whitespace-nowrap`}>
                    {status.label}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    onClick={() => navigate(`/owner/promotions/${promo.promotionId}`)}
                    title="Xem chi tiết"
                  >
                    <RiEyeLine className="text-white" />
                  </button>
                  {!isInactive && isUpcoming && (
                    <>
                      <button
                        className="p-2 bg-green-500 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        onClick={() => onEdit && onEdit(promo)}
                        title="Chỉnh sửa"
                      >
                        <RiEdit2Line className="text-white" />
                      </button>
                      <button
                        className="p-2 bg-red-500 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        onClick={() => setConfirmDelete(promo)}
                        title="Xóa"
                      >
                        <RiDeleteBin6Line className="text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Books */}
              <div className="mb-3">
                <div className="text-xs text-slate-400 mb-1">Sách áp dụng:</div>
                {Array.isArray(promo.books) && promo.books.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {promo.books.slice(0, 2).map((b) => (
                      <span key={b.bookId} className="bg-slate-700 px-2 py-1 rounded text-xs text-white">
                        {b.title}
                      </span>
                    ))}
                    {promo.books.length > 2 && (
                      <span className="text-xs text-slate-400 px-2 py-1">+{promo.books.length - 2} nữa</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Chưa có sách</span>
                )}
              </div>

              {/* Discount & Price */}
              <div className="mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Giá trị giảm:</span>
                  <span className="font-medium text-orange-400 text-sm">
                    {promo.discountType === "Percent"
                      ? `${promo.discountValue}%`
                      : `${promo.discountValue.toLocaleString()} đ`}
                  </span>
                </div>
                {Array.isArray(promo.books) && promo.books.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">Tổng giá:</span>
                    <span className="flex items-center gap-1">
                      {promo.books.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}{' '}
                      <RiCoinLine className="inline text-yellow-400" /> →{' '}
                      {promo.books.reduce((sum, b) => sum + (b.discountedPrice || 0), 0).toLocaleString()}{' '}
                      <RiCoinLine className="inline text-yellow-400" />
                    </span>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                {new Date(promo.startAt).toLocaleDateString("vi-VN")} -{' '}
                {new Date(promo.endAt).toLocaleDateString("vi-VN")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="text-xs sm:text-sm text-white/70">
              Trang {page} / {totalPages}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                page === 1 
                  ? "bg-gray-600 cursor-not-allowed opacity-50" 
                  : "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white"
              }`}
            >
              Trước
            </button>

            {/* Hiển thị số trang */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                    page === pageNum 
                      ? "bg-orange-500 text-white" 
                      : "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                page === totalPages 
                  ? "bg-gray-600 cursor-not-allowed opacity-50" 
                  : "bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white"
              }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(null);
          }}
        >
          <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg text-white w-full max-w-md">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Xác nhận xoá</h2>
            <p className="text-sm sm:text-base">
              Bạn có chắc chắn muốn xoá khuyến mãi{" "}
              <span className="text-orange-400 font-semibold">{confirmDelete.promotionName}</span> không?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6">
              <button
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-sm sm:text-base font-medium min-h-[44px] transition-colors"
                onClick={() => setConfirmDelete(null)}
              >
                Hủy
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm sm:text-base font-medium min-h-[44px] transition-colors"
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