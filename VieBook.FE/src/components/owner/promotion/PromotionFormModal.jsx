import { useEffect, useState } from "react";
import { getUserId } from "../../../api/authApi";
import { createPromotion, updatePromotion, getBooksByOwner } from "../../../api/promotionApi";

export default function PromotionFormModal({ isOpen, onClose, onCreated, editingPromotion }) {
  const [form, setForm] = useState({
    name: "",
    value: "",
    startDate: "",
    endDate: "",
    books: [],
    description: "",
  });
  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState(""); // search state
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state

  useEffect(() => {
    if (isOpen) {
      const ownerId = getUserId();
      if (ownerId) {
        getBooksByOwner(ownerId)
          .then((data) => setBooks(data))
          .catch((err) => console.error("Lỗi load sách:", err));
      }
      
      // Reset submitting state khi mở modal
      setIsSubmitting(false);

      if (editingPromotion) {
        // Convert UTC string từ backend về local datetime string cho datetime-local input
        // datetime-local input cần format "YYYY-MM-DDTHH:mm" trong local timezone
        const toLocalDatetimeString = (utcString) => {
          const date = new Date(utcString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        setForm({
          name: editingPromotion.promotionName,
          value: editingPromotion.discountValue,
          startDate: toLocalDatetimeString(editingPromotion.startAt),
          endDate: toLocalDatetimeString(editingPromotion.endAt),
          books: Array.isArray(editingPromotion.books) ? editingPromotion.books.map(b => b.bookId) : [],
          description: editingPromotion.description || "",
        });
      } else {
        setForm({
          name: "",
          value: "",
          startDate: "",
          endDate: "",
          books: [],
          description: "",
        });
      }
      setBookSearch("");
    }
  }, [isOpen, editingPromotion]);

  if (!isOpen) return null;

  // Helper: Parse datetime-local string thành Date object một cách nhất quán
  // Safari có thể parse "2025-01-15T10:00" khác với Chrome/Firefox
  const parseDatetimeLocal = (datetimeStr) => {
    if (!datetimeStr) return null;
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    const [datePart, timePart] = datetimeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    // Tạo Date object từ components -> đảm bảo là LOCAL time
    return new Date(year, month - 1, day, hours, minutes);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submit
    
    try {
      if (!form.name || !form.value || !form.startDate || !form.endDate || !form.books?.length) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Vui lòng điền đầy đủ thông tin" }}));
        return;
      }
      
      setIsSubmitting(true);

      // Parse datetime-local một cách nhất quán (tránh bug Safari)
      const startDate = parseDatetimeLocal(form.startDate);
      const endDate = parseDatetimeLocal(form.endDate);
      const now = new Date();
      
      if (startDate.getTime() <= now.getTime()) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Ngày bắt đầu phải sau thời điểm hiện tại" }}));
        setIsSubmitting(false);
        return;
      }
      
      if (endDate.getTime() <= startDate.getTime()) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Ngày kết thúc phải sau ngày bắt đầu" }}));
        setIsSubmitting(false);
        return;
      }

      const ownerId = getUserId();
      
      // Convert local Date sang ISO UTC string
      const startAtUTC = startDate.toISOString();
      const endAtUTC = endDate.toISOString();
      
      const payload = {
        ownerId,
        promotionName: form.name,
        description: form.description,
        discountPercent: parseFloat(form.value),
        startAt: startAtUTC,
        endAt: endAtUTC,
        bookIds: form.books,
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.promotionId, payload);
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Cập nhật promotion thành công" }}));
      } else {
        await createPromotion(payload);
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Tạo promotion thành công" }}));
      }

      // Reload data trước khi đóng modal
      if (onCreated) await onCreated();
      onClose();
    } catch (err) {
      console.error("Lỗi thao tác promotion:", err);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Thao tác thất bại" }}));
    } finally {
      setIsSubmitting(false);
    }
  };

  // filter theo từ khóa search và chỉ lấy sách đã được duyệt (Approved)
  const filteredBooks = books.filter(b => 
    b.status === "Approved" && b.title.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh] text-white custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold">{editingPromotion ? "Cập nhật Khuyến mãi" : "Tạo Khuyến mãi Mới"}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Thông báo cảnh báo */}
        <div className="bg-amber-900/50 border border-amber-600 rounded-lg p-3 mb-4 flex items-start gap-3">
          <span className="text-amber-400 text-lg sm:text-xl flex-shrink-0">⚠️</span>
          <div className="text-xs sm:text-sm min-w-0">
            <p className="font-semibold text-amber-400">Lưu ý quan trọng</p>
            <p className="text-amber-200/90 mt-1">
              Khi khuyến mãi đã bắt đầu diễn ra, bạn sẽ <span className="font-semibold text-amber-400">không thể chỉnh sửa hoặc xóa</span> được nữa. 
              Vui lòng kiểm tra kỹ thông tin trước khi tạo.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs sm:text-sm font-medium block mb-1">Tên Khuyến mãi *</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium block mb-1">Giá trị giảm (%) *</label>
            <input
              type="number"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
        </div>

        {/* Thời gian ngang hàng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs sm:text-sm font-medium block mb-1">Ngày bắt đầu *</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium block mb-1">Ngày kết thúc *</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Search sách */}
        <div className="mt-4">
          <label className="text-xs sm:text-sm font-medium block mb-1">Chọn sách áp dụng *</label>
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base min-h-[44px]"
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
          />
          <div className="mt-2 space-y-2 bg-slate-800 p-3 rounded-lg max-h-40 overflow-y-auto">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((b) => (
                <label key={b.bookId} className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.books.includes(b.bookId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm({ ...form, books: [...form.books, b.bookId] });
                      } else {
                        setForm({ ...form, books: form.books.filter(id => id !== b.bookId) });
                      }
                    }}
                    className="w-4 h-4 flex-shrink-0"
                  />
                  <img src={b.coverUrl} alt={b.title} className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{b.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.totalPrice?.toLocaleString()} đ • {b.sold} đã bán
                    </p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">Không tìm thấy sách</p>
            )}
          </div>
        </div>

        {/* Mô tả */}
        <div className="mt-4">
          <label className="text-xs sm:text-sm font-medium block mb-1">Mô tả khuyến mãi</label>
          <textarea
            rows="4"
            className="w-full px-3 py-2.5 sm:py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base resize-none"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button 
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white text-sm sm:text-base font-medium min-h-[44px] transition-colors" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button 
            className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg text-white text-sm sm:text-base font-medium min-h-[44px] transition-colors ${
              isSubmitting 
                ? "bg-orange-400 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Đang xử lý..." 
              : (editingPromotion ? "Cập nhật" : "Tạo Khuyến mãi")
            }
          </button>
        </div>
      </div>
    </div>
  );
}