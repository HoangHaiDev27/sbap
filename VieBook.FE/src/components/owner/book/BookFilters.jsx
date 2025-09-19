import { RiSearchLine } from "react-icons/ri";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://localhost:7058";

export default function BookFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  sort,
  setSort, // 📌 thêm prop sort
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 shadow-lg">
      {/* 🔍 Tìm kiếm */}
      <div className="relative flex-1">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 text-sm focus:outline-none"
        />
      </div>

      {/* ✅ Thể loại */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
      >
        <option value="Tất cả">Tất cả thể loại</option>
        {categories.map((cat) => (
          <option key={cat.categoryId} value={cat.categoryId}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* ✅ Trạng thái */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
      >
        <option value="Tất cả">Tất cả trạng thái</option>
        <option value="Approved">Đang bán</option>
        <option value="Active">Chờ duyệt</option>
        <option value="InActive">Tạm dừng</option>
      </select>

      {/* ✅ Sắp xếp theo ngày tạo */}
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
      >
        <option value="newest">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="oldest">Bán chạy</option>
      </select>
    </div>
  );
}
