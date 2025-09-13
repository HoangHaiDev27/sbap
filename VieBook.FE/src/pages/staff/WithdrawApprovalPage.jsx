import React, { useState } from "react";
import WithdrawDetailModal from "../../components/staff/withdrawals/WithdrawDetailModal";
import WithdrawApproveModal from "../../components/staff/withdrawals/WithdrawApproveModal";
import WithdrawRejectModal from "../../components/staff/withdrawals/WithdrawRejectModal";

const WithdrawApprovalPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [approveWithdraw, setApproveWithdraw] = useState(null);
  const [rejectWithdraw, setRejectWithdraw] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const stats = [
    { label: "Tổng yêu cầu", value: 12, color: "text-blue-600" },
    { label: "Chờ duyệt", value: 5, color: "text-yellow-600" },
    { label: "Hoàn thành", value: 3, color: "text-green-600" },
    { label: "Từ chối", value: 2, color: "text-red-600" },
  ];

  const withdraws = [
    { id: "WD001", user: "Nguyễn Văn A", type: "Book Owner", amount: "2.500.000đ", bank: "Vietcombank\n1234567890", status: "Chờ duyệt", date: "2024-01-22 14:30:25" },
    { id: "WD002", user: "Trần Thị B", type: "Book Owner", amount: "1.800.000đ", bank: "Techcombank\n0987654321", status: "Đã duyệt", date: "2024-01-21 10:15:42" },
    { id: "WD003", user: "Lê Văn C", type: "Book Owner", amount: "500.000đ", bank: "BIDV\n5555666677", status: "Từ chối", date: "2024-01-20 16:45:30" },
    { id: "WD004", user: "Phạm Thị D", type: "Affiliate", amount: "350.000đ", bank: "ACB\n1111222233", status: "Chờ duyệt", date: "2024-01-22 11:28:00" },
    { id: "WD005", user: "Hoàng Văn E", type: "Book Owner", amount: "4.200.000đ", bank: "VPBank\n9999888877", status: "Hoàn thành", date: "2024-01-19 15:30:00" },
    { id: "WD006", user: "Nguyễn Văn F", type: "Affiliate", amount: "750.000đ", bank: "Agribank\n8888777766", status: "Chờ duyệt", date: "2024-01-18 09:45:00" },
    { id: "WD007", user: "Trần Thị G", type: "Book Owner", amount: "3.100.000đ", bank: "MB Bank\n2222333344", status: "Đã duyệt", date: "2024-01-17 14:00:00" },
    { id: "WD008", user: "Phạm Văn H", type: "Affiliate", amount: "1.250.000đ", bank: "TPBank\n5555444433", status: "Từ chối", date: "2024-01-16 18:10:00" },
    { id: "WD009", user: "Hoàng Thị I", type: "Book Owner", amount: "2.700.000đ", bank: "Sacombank\n9999000011", status: "Hoàn thành", date: "2024-01-15 13:20:00" },
    { id: "WD010", user: "Lê Văn J", type: "Affiliate", amount: "950.000đ", bank: "VIB\n4444333322", status: "Chờ duyệt", date: "2024-01-14 07:30:00" },
  ];

  const filteredWithdraws = withdraws.filter(
    (w) =>
      (statusFilter === "all" || w.status === statusFilter) &&
      (w.user.toLowerCase().includes(search.toLowerCase()) ||
        w.id.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredWithdraws.length / pageSize);
  const paginatedWithdraws = filteredWithdraws.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="pt-30 p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Phê duyệt rút tiền</h2>
        <p className="text-sm text-gray-500">
          Quản lý và phê duyệt các yêu cầu rút tiền của người dùng
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl shadow-md p-4 text-center bg-white border border-gray-200"
          >
            <p className={`${s.color} text-2xl font-bold`}>{s.value}</p>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tổng tiền */}
      <div className="flex justify-center gap-12 mb-6">
        <p className="text-gray-700 font-semibold">
          Chờ xử lý: <span className="text-red-600">2.850.000đ</span>
        </p>
        <p className="text-gray-700 font-semibold">
          Đã chi trả: <span className="text-green-600">4.200.000đ</span>
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm yêu cầu rút tiền..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 shadow-sm"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đã duyệt">Đã duyệt</option>
          <option value="Hoàn thành">Hoàn thành</option>
          <option value="Từ chối">Từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-xl bg-white shadow-sm">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-3">ID Yêu cầu</th>
              <th className="p-3">Người yêu cầu</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Số tiền</th>
              <th className="p-3">Ngân hàng</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày yêu cầu</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWithdraws.map((w) => (
              <tr
                key={w.id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 font-semibold">{w.id}</td>
                <td className="p-3">{w.user}</td>
                <td className="p-3">{w.type}</td>
                <td className="p-3 font-bold">{w.amount}</td>
                <td className="p-3 whitespace-pre-line text-sm text-gray-600">
                  {w.bank}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      w.status === "Chờ duyệt"
                        ? "bg-yellow-100 text-yellow-700"
                        : w.status === "Đã duyệt"
                        ? "bg-blue-100 text-blue-700"
                        : w.status === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {w.status}
                  </span>
                </td>
                <td className="p-3 text-sm">{w.date}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedWithdraw(w)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      title="Xem"
                    >
                      <i className="ri-eye-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => setApproveWithdraw(w)}
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                      title="Duyệt"
                    >
                      <i className="ri-check-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => setRejectWithdraw(w)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      title="Từ chối"
                    >
                      <i className="ri-close-line text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredWithdraws.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Không có dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 border-t">
          <p className="text-sm text-gray-600">
            Trang {currentPage}/{totalPages}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedWithdraw && (
        <WithdrawDetailModal
          withdraw={selectedWithdraw}
          onClose={() => setSelectedWithdraw(null)}
        />
      )}

      {approveWithdraw && (
        <WithdrawApproveModal
          withdraw={approveWithdraw}
          onClose={() => setApproveWithdraw(null)}
        />
      )}

      {rejectWithdraw && (
        <WithdrawRejectModal
          withdraw={rejectWithdraw}
          onClose={() => setRejectWithdraw(null)}
        />
      )}
    </div>
  );
};

export default WithdrawApprovalPage;
