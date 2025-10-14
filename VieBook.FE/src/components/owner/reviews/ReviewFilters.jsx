export default function ReviewFilters({ ratingFilter, replyStatusFilter, searchTerm, onRatingFilterChange, onReplyStatusFilterChange, onSearchTermChange, onFilterChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <input
        type="text"
        placeholder="Tìm kiếm theo tên sách..."
        value={searchTerm || ""}
        onChange={(e) => {
          onSearchTermChange(e.target.value);
          // Không gọi onFilterChange ngay lập tức, sẽ dùng debounce
        }}
        className="px-3 py-2 rounded bg-gray-700 text-white flex-1 min-w-0"
      />
      
      <select 
        className="px-3 py-2 rounded bg-gray-700 text-white"
        value={ratingFilter || ""}
        onChange={(e) => {
          const value = e.target.value === "" ? null : parseInt(e.target.value);
          onRatingFilterChange(value);
          onFilterChange();
        }}
      >
        <option value="">Tất cả sao</option>
        <option value="5">5 sao</option>
        <option value="4">4 sao</option>
        <option value="3">3 sao</option>
        <option value="2">2 sao</option>
        <option value="1">1 sao</option>
      </select>
      
      <select 
        className="px-3 py-2 rounded bg-gray-700 text-white"
        value={replyStatusFilter === null ? "" : replyStatusFilter ? "replied" : "not_replied"}
        onChange={(e) => {
          let value = null;
          if (e.target.value === "replied") value = true;
          else if (e.target.value === "not_replied") value = false;
          onReplyStatusFilterChange(value);
          onFilterChange();
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="replied">Đã phản hồi</option>
        <option value="not_replied">Chưa phản hồi</option>
      </select>
    </div>
  );
}
