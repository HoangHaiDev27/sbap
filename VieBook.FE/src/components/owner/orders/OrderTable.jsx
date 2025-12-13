import { useState } from "react";
import { Link } from "react-router-dom";

// Export to CSV function with proper UTF-8 BOM for Vietnamese characters
const exportToCSV = (data, filename = 'orders.csv') => {
  const headers = ['Ma don', 'Khach hang', 'Email', 'Sach', 'Chuong', 'Loai', 'Tong tien (xu)', 'Gia goc (xu)', 'Thoi gian'];
  const csvContent = [
    headers.join(','),
    ...data.map(order => [
      order.id,
      `"${order.customer.replace(/"/g, '""')}"`,
      `"${order.customerEmail.replace(/"/g, '""')}"`,
      `"${order.bookTitle.replace(/"/g, '""')}"`,
      `"${order.chapterTitle.replace(/"/g, '""')}"`,
      `"${(order.orderTypeLabel || order.orderType).replace(/"/g, '""')}"`,
      order.total,
      order.unitPrice || order.total,
      `"${order.date.replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');
  
  // Add UTF-8 BOM for proper Vietnamese character support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function OrderTable({ orders }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState("all");
  const pageSize = 6;

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.bookTitle.toLowerCase().includes(search.toLowerCase());
    const matchOrderType = orderType === "all" || o.orderType === orderType;
    
    return matchSearch && matchOrderType;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-slate-800 p-3 sm:p-4 rounded-lg shadow">
      {/* Filter */}
      <div className="space-y-3 sm:space-y-4 mb-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
            placeholder="Tìm mã đơn, khách hàng hoặc tên sách..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-gray-700 text-white flex-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        />
        <select
          value={orderType}
          onChange={(e) => {
            setOrderType(e.target.value);
            setPage(1);
          }}
          className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-gray-700 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
        >
          <option value="all">Tất cả loại</option>
          <option value="BuyChapter">Mua chương</option>
          <option value="BuyChapterSoft">Bản mềm</option>
          <option value="BuyChapterAudio">Bản audio</option>
          <option value="BuyChapterBoth">Cả hai</option>
          <option value="Refund">Hoàn tiền</option>
        </select>
      </div>

        {/* Clear filters button */}
        {(search || orderType !== "all") && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setSearch("");
                setOrderType("all");
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm sm:text-base transition-colors min-h-[44px]"
            >
              🔄 Xóa bộ lọc
            </button>
          </div>
        )}
        
        {/* Results count and Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-400">
            Hiển thị {paginated.length} trong {filtered.length} đơn hàng
            {filtered.length !== orders.length && ` (từ ${orders.length} đơn hàng)`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(orders, `don-hang-${new Date().toISOString().split('T')[0]}.csv`)}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 min-h-[44px]"
            >
              <span>📊</span>
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty state when no results */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-300">Không tìm thấy đơn hàng</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-4 px-4">
            Không có đơn hàng nào phù hợp với bộ lọc hiện tại
          </p>
          <button
            onClick={() => {
              setSearch("");
              setOrderType("all");
              setPage(1);
            }}
            className="px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-colors text-sm sm:text-base min-h-[44px]"
          >
            🔄 Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-700 text-gray-300">
              <th className="p-3 whitespace-nowrap">Mã</th>
              <th className="p-3 whitespace-nowrap">Sách / Chương</th>
              <th className="p-3 whitespace-nowrap">Khách hàng</th>
              <th className="p-3 whitespace-nowrap">Loại</th>
              <th className="p-3 whitespace-nowrap">Số tiền</th>
              <th className="p-3 whitespace-nowrap">Thời gian</th>
              <th className="p-3 whitespace-nowrap">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr key={o.id} className="border-b border-gray-600 hover:bg-slate-700 transition-colors">
                <td className="p-3 text-white">{o.id}</td>

                {/* Sách / Chương */}
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={o.image}
                      alt={o.bookTitle}
                      className="w-10 h-14 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-sm font-medium truncate">{o.bookTitle}</span>
                      <span className="text-gray-400 text-xs mt-1 truncate">{o.chapterTitle}</span>
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-sm truncate">{o.customer}</span>
                    <span className="text-gray-400 text-xs truncate">{o.customerEmail}</span>
                  </div>
                </td>

                {/* Order Type Badge */}
                <td className="p-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs whitespace-nowrap ${o.orderTypeBadgeColor || 'bg-gray-600'}`}>
                    {o.orderTypeLabel || o.orderType}
                  </span>
                </td>

                {/* Price with discount indicator */}
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-white font-medium whitespace-nowrap">{o.total.toLocaleString()} xu</span>
                    {o.unitPrice && o.unitPrice !== o.total && (
                      <span className="text-gray-400 text-xs line-through whitespace-nowrap">
                        {o.unitPrice.toLocaleString()} xu
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3 text-xs text-gray-300 whitespace-nowrap">{o.date}</td>

                <td className="p-3">
                  <Link
                    to={`/owner/orders/${o.orderItemId}`}
                    className="inline-block px-3 py-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded text-sm text-white transition-colors whitespace-nowrap"
                  >
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-3">
        {paginated.map((o) => (
          <div key={o.id} className="bg-slate-700 rounded-lg p-4 border border-gray-600">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1 font-mono">{o.id}</div>
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={o.image}
                    alt={o.bookTitle}
                    className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-semibold text-white mb-1 line-clamp-2">{o.bookTitle}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{o.chapterTitle}</p>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs whitespace-nowrap flex-shrink-0 ${o.orderTypeBadgeColor || 'bg-gray-600'}`}>
                {o.orderTypeLabel || o.orderType}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Khách hàng:</span>
                <div className="text-right flex-1 ml-2 min-w-0">
                  <div className="text-xs sm:text-sm text-white truncate">{o.customer}</div>
                  <div className="text-xs text-gray-400 truncate">{o.customerEmail}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Số tiền:</span>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-semibold text-white">{o.total.toLocaleString()} xu</span>
                  {o.unitPrice && o.unitPrice !== o.total && (
                    <span className="text-xs text-gray-400 line-through block">
                      {o.unitPrice.toLocaleString()} xu
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Thời gian:</span>
                <span className="text-xs text-gray-300 truncate ml-2">{o.date}</span>
              </div>
            </div>

            <Link
              to={`/owner/orders/${o.orderItemId}`}
              className="block w-full text-center px-4 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-lg text-sm text-white transition-colors font-medium min-h-[44px] flex items-center justify-center"
            >
              Chi tiết
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="text-xs sm:text-sm text-gray-400">
              Trang {page} / {totalPages}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {/* Nút Trước */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${page === 1
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600"
                }`}
            >
              Trước
            </button>

          {/* Các số trang với logic thông minh */}
          {(() => {
            const maxVisiblePages = 5; // Số trang tối đa hiển thị
            const pages = [];
            const visiblePages = Math.min(maxVisiblePages, totalPages);
            
            let startPage = Math.max(1, page - Math.floor(visiblePages / 2));
            let endPage = Math.min(totalPages, startPage + visiblePages - 1);
            
            if (endPage - startPage < visiblePages - 1) {
              startPage = Math.max(1, endPage - visiblePages + 1);
            }
            
            // Trang đầu
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => setPage(1)}
                  className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  1
                </button>
              );
              
              if (startPage > 2) {
                pages.push(
                  <span key="start-ellipsis" className="px-2 py-2 text-gray-400 min-h-[44px] flex items-center">
                    ...
                  </span>
                );
              }
            }
            
            // Các trang giữa
            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${page === i
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600"
                    }`}
                >
                  {i}
                </button>
              );
            }
            
            // Trang cuối
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="end-ellipsis" className="px-2 py-2 text-gray-400 min-h-[44px] flex items-center">
                    ...
                  </span>
                );
              }
              
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setPage(totalPages)}
                  className="px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                >
                  {totalPages}
                </button>
              );
            }
            
            return pages;
          })()}

            {/* Nút Sau */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${page === totalPages
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 active:bg-gray-600"
                }`}
            >
              Sau
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
