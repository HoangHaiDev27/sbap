import { useState } from "react";

export default function PromotionFormModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: "",
    type: "percent",
    value: "",
    limit: "",
    startDate: "",
    endDate: "",
    target: "all",
    books: [],
    description: "",
  });

  const books = [
    { id: 1, title: "Đắc Nhân Tâm - Bản E-book Đặc Biệt", price: 150000, sold: 245, cover: "/book1.jpg" },
    { id: 2, title: "Tư Duy Nhanh Và Chậm - Digital Edition", price: 200000, sold: 189, cover: "/book2.jpg" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] text-white custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tạo Promotion Mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Tên Promotion *</label>
            <input
              type="text"
              placeholder="Ví dụ: Flash Sale Cuối Tuần"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Loại giảm giá *</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="percent">Giảm theo phần trăm (%)</option>
              <option value="amount">Giảm theo số tiền (VND)</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Giá trị giảm giá *</label>
            <input
              type="number"
              placeholder="30"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Số lượt sử dụng tối đa *</label>
            <input
              type="number"
              placeholder="100"
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
            />
          </div>

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

          <div className="col-span-2">
            <label className="text-sm">Đối tượng áp dụng</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            >
              <option value="all">Tất cả khách hàng</option>
              <option value="vip">Chỉ khách VIP</option>
            </select>
          </div>
        </div>

        {/* Books select */}
        <div className="mt-4">
          <label className="text-sm">Chọn sách áp dụng promotion *</label>
          <div className="mt-2 space-y-2 bg-slate-800 p-3 rounded max-h-40 overflow-y-auto">
            {books.map((b) => (
              <label key={b.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={form.books.includes(b.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, books: [...form.books, b.id] });
                    } else {
                      setForm({ ...form, books: form.books.filter((id) => id !== b.id) });
                    }
                  }}
                />
                <img src={b.cover} alt={b.title} className="w-10 h-14 object-cover rounded" />
                <div>
                  <p className="font-medium">{b.title}</p>
                  <p className="text-xs opacity-70">{b.price.toLocaleString()} đ • {b.sold} đã bán</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm">Mô tả promotion</label>
          <textarea
            rows="3"
            placeholder="Mô tả chi tiết về promotion này..."
            className="w-full mt-1 px-3 py-2 rounded bg-slate-800"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
            onClick={onClose}
          >
            Hủy
          </button>
          <button className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-600">
            Tạo Promotion
          </button>
        </div>
      </div>
    </div>
  );
}
