import { RiSearchLine } from "react-icons/ri";

export default function BookFilters({ search, setSearch }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0 shadow-lg">
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
      <select className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
        <option>Tất cả thể loại</option>
        <option>Triết học</option>
        <option>Kỹ năng sống</option>
      </select>
      <select className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
        <option>Tất cả trạng thái</option>
        <option>Đang bán</option>
        <option>Tạm dừng</option>
      </select>
      <select className="bg-gray-700 rounded-lg px-3 py-2 text-sm">
        <option>Mới nhất</option>
        <option>Cũ nhất</option>
        <option>Bán chạy</option>
      </select>
    </div>
  );
}
