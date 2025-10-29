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

  useEffect(() => {
    if (isOpen) {
      const ownerId = getUserId();
      if (ownerId) {
        getBooksByOwner(ownerId)
          .then((data) => setBooks(data))
          .catch((err) => console.error("Lỗi load sách:", err));
      }

      if (editingPromotion) {
        setForm({
          name: editingPromotion.promotionName,
          value: editingPromotion.discountValue,
          startDate: editingPromotion.startAt.slice(0, 16),
          endDate: editingPromotion.endAt.slice(0, 16),
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

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.value || !form.startDate || !form.endDate || !form.books?.length) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Vui lòng điền đầy đủ thông tin" }}));
        return;
      }

      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const now = new Date();
      
      if (start <= now) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Ngày bắt đầu phải sau thời điểm hiện tại" }}));
        return;
      }
      
      if (end <= start) {
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: "Ngày kết thúc phải sau ngày bắt đầu" }}));
        return;
      }

      const ownerId = getUserId();
      const payload = {
        ownerId,
        promotionName: form.name,
        description: form.description,
        discountPercent: parseFloat(form.value),
        startAt: form.startDate,
        endAt: form.endDate,
        bookIds: form.books,
      };

      if (editingPromotion) {
        await updatePromotion(editingPromotion.promotionId, payload);
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Cập nhật promotion thành công" }}));
      } else {
        await createPromotion(payload);
        window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "success", message: "Tạo promotion thành công" }}));
      }

      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      console.error("Lỗi thao tác promotion:", err);
      window.dispatchEvent(new CustomEvent("app:toast", { detail: { type: "error", message: err.message || "Thao tác thất bại" }}));
    }
  };

  // filter theo từ khóa search
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] text-white custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{editingPromotion ? "Cập nhật Khuyến mãi" : "Tạo Khuyến mãi Mới"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Tên Khuyến mãi *</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Giá trị giảm (%) *</label>
            <input
              type="number"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
        </div>

        {/* Thời gian ngang hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm">Ngày bắt đầu *</label>
            <input
              type="datetime-local"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Ngày kết thúc *</label>
            <input
              type="datetime-local"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Search sách */}
        <div className="mt-4">
          <label className="text-sm">Chọn sách áp dụng *</label>
          <input
            type="text"
            placeholder="Tìm kiếm sách..."
            className="w-full mt-2 px-3 py-2 rounded bg-slate-800"
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
          />
          <div className="mt-2 space-y-2 bg-slate-800 p-3 rounded max-h-40 overflow-y-auto">
            {filteredBooks.map((b) => (
              <label key={b.bookId} className="flex items-center space-x-3">
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
                />
                <img src={b.coverUrl} alt={b.title} className="w-10 h-14 object-cover rounded" />
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs opacity-70">
                    {b.totalPrice?.toLocaleString()} đ • {b.sold} đã bán
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mô tả */}
        <div className="mt-4">
          <label className="text-sm">Mô tả khuyến mãi</label>
          <textarea
            rows="6"
            className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" onClick={onClose}>Hủy</button>
          <button className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600" onClick={handleSubmit}>
            {editingPromotion ? "Cập nhật" : "Tạo Khuyến mãi"}
          </button>
        </div>
      </div>
    </div>
  );
}