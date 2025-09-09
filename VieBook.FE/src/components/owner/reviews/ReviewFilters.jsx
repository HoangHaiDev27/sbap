export default function ReviewFilters() {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="Tìm kiếm tên sách, độc giả..."
        className="px-3 py-2 rounded bg-gray-700 text-white flex-1"
      />
      <select className="px-3 py-2 rounded bg-gray-700 text-white">
        <option>Tất cả sao</option>
        <option>5 sao</option>
        <option>4 sao</option>
        <option>3 sao</option>
        <option>2 sao</option>
        <option>1 sao</option>
      </select>
      <select className="px-3 py-2 rounded bg-gray-700 text-white">
        <option>Tất cả trạng thái</option>
        <option>Đã phản hồi</option>
        <option>Chưa phản hồi</option>
      </select>
      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded">
        Lọc
      </button>
      <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">
        Làm mới
      </button>
    </div>
  );
}
