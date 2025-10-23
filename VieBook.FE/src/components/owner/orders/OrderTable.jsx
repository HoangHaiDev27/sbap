import { useState } from "react";
import { Link } from "react-router-dom";

// Export to CSV function with proper UTF-8 BOM for Vietnamese characters
const exportToCSV = (data, filename = 'orders.csv') => {
  const headers = ['Ma don', 'Khach hang', 'Email', 'Sach', 'Chuong', 'Trang thai', 'Tong tien (xu)', 'Thoi gian'];
  const csvContent = [
    headers.join(','),
    ...data.map(order => [
      order.id,
      `"${order.customer.replace(/"/g, '""')}"`,
      `"${order.customerEmail.replace(/"/g, '""')}"`,
      `"${order.bookTitle.replace(/"/g, '""')}"`,
      `"${order.chapterTitle.replace(/"/g, '""')}"`,
      `"${order.status.replace(/"/g, '""')}"`,
      order.total,
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
  const [status, setStatus] = useState("all");
  const pageSize = 6;

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.bookTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "all" || o.status === status;
    
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow">
      {/* Filter */}
      <div className="space-y-4 mb-4">
        {/* Search and Status */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          type="text"
            placeholder="Tìm mã đơn, khách hàng hoặc tên sách..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded bg-gray-700 text-white flex-1"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded bg-gray-700 text-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Đang chờ">Đang chờ</option>
          <option value="Đã hoàn tiền">Đã hoàn tiền</option>
        </select>
      </div>

        {/* Clear filters button */}
        {(search || status !== "all") && (
          <div className="flex justify-center">
            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setPage(1);
              }}
              className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm transition-colors"
            >
              🔄 Xóa bộ lọc
            </button>
          </div>
        )}
        
        {/* Results count and Export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-400">
            Hiển thị {paginated.length} trong {filtered.length} đơn hàng
            {filtered.length !== orders.length && ` (từ ${orders.length} đơn hàng)`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(orders, `don-hang-${new Date().toISOString().split('T')[0]}.csv`)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty state when no results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-300">Không tìm thấy đơn hàng</h3>
          <p className="text-gray-400 mb-4">
            Không có đơn hàng nào phù hợp với bộ lọc hiện tại
          </p>
          <button
            onClick={() => {
              setSearch("");
              setStatus("all");
              setPage(1);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            🔄 Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-700 text-gray-300">
            <th className="p-3">Mã</th>
            <th className="p-3">Sách / Chương</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((o) => (
            <tr key={o.id} className="border-b border-gray-600">
              <td className="p-3">{o.id}</td>

              {/* Sách / Chương */}
              <td className="p-3 flex items-center space-x-3">
                <img
                  src={o.image}
                  alt={o.bookTitle}
                  className="w-10 h-14 object-cover rounded"
                />
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">{o.bookTitle}</span>
                  <span className="text-gray-400 text-xs mt-1">{o.chapterTitle}</span>
                </div>
              </td>

              <td className="p-3">{o.customer}</td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${o.status === "Hoàn thành"
                      ? "bg-green-600"
                      : o.status === "Đang chờ"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                >
                  {o.status}
                </span>
              </td>

              <td className="p-3">{o.total.toLocaleString()} xu</td>
              <td className="p-3">{o.date}</td>

              <td className="p-3">
                <Link
                  to={`/owner/orders/${o.id}`}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm text-white"
                >
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Nút Trước */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1 rounded text-sm ${page === 1
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Trước
          </button>

          {/* Các số trang với logic thông minh */}
          {(() => {
            const maxVisiblePages = 5; // Số trang tối đa hiển thị
            const pages = [];
            
            if (totalPages <= maxVisiblePages) {
              // Nếu tổng số trang <= 5, hiển thị tất cả
              for (let i = 1; i <= totalPages; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 rounded text-sm ${page === i
                        ? "bg-orange-500 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {i}
                  </button>
                );
              }
            } else {
              // Logic cho nhiều trang
              const startPage = Math.max(1, page - 2);
              const endPage = Math.min(totalPages, page + 2);
              
              // Trang đầu
              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => setPage(1)}
                    className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                  >
                    1
                  </button>
                );
                
                if (startPage > 2) {
                  pages.push(
                    <span key="start-ellipsis" className="px-2 py-1 text-gray-400">
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
                    className={`px-3 py-1 rounded text-sm ${page === i
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
                    <span key="end-ellipsis" className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => setPage(totalPages)}
                    className="px-3 py-1 rounded text-sm bg-gray-800 text-gray-300 hover:bg-gray-700"
                  >
                    {totalPages}
            </button>
                );
              }
            }
            
            return pages;
          })()}

          {/* Nút Sau */}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded text-sm ${page === totalPages
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Sau
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
