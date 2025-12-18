import { RiSearchLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { getCategories } from "../../../api/ownerBookApi";

export default function BookFilters({
  search,
  setSearch,
  category,
  setCategory,
  status,
  setStatus,
  sort,
  setSort,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-slate-800 p-3 sm:p-4 rounded-lg mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 shadow-lg overflow-hidden">
      {/*  Tìm kiếm */}
      <div className="relative flex-1 w-full min-w-0">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sách..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 text-xs sm:text-sm focus:outline-none"
        />
      </div>

      {/*  Thể loại */}
      <div className="w-full md:w-auto min-w-0">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-auto bg-gray-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none"
        >
          <option value="Tất cả">Tất cả thể loại</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/*  Trạng thái */}
      <div className="w-full md:w-auto min-w-0">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full md:w-auto bg-gray-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Approved">Đang bán</option>
          <option value="Active">Chờ duyệt</option>
          <option value="Refused">Bị từ chối</option>
          <option value="InActive">Tạm dừng</option>
        </select>
      </div>

      {/*  Sắp xếp theo ngày tạo */}
      <div className="w-full md:w-auto min-w-0">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full md:w-auto bg-gray-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="bestseller">Bán chạy</option>
        </select>
      </div>
    </div>
  );
}
