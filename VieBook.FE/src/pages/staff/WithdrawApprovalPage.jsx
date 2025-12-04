import React, { useState, useEffect } from "react";
import WithdrawDetailModal from "../../components/staff/withdrawals/WithdrawDetailModal";
import WithdrawApproveModal from "../../components/staff/withdrawals/WithdrawApproveModal";
import WithdrawRejectModal from "../../components/staff/withdrawals/WithdrawRejectModal";
import { getAllPaymentRequests } from "../../api/paymentRequestApi";

const WithdrawApprovalPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedWithdraw, setSelectedWithdraw] = useState(null);
  const [approveWithdraw, setApproveWithdraw] = useState(null);
  const [rejectWithdraw, setRejectWithdraw] = useState(null);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    loadPaymentRequests();
  }, []);

  const loadPaymentRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPaymentRequests();
      
      // Map dữ liệu từ API sang format của component
      const mappedData = data.map((item) => {
        // Map status từ API sang tiếng Việt
        let statusText = "Chờ duyệt";
        if (item.status === "Succeeded") statusText = "Hoàn thành";
        else if (item.status === "Rejected") statusText = "Từ chối";
        else if (item.status === "Pending" || item.status === "Processing") statusText = "Chờ duyệt";
        
        // Format date - Convert UTC to Vietnam timezone (UTC+7)
        const requestDate = new Date(item.requestDate);
        // Convert UTC to Vietnam timezone (UTC+7)
        const vietnamDate = new Date(requestDate.getTime() + (7 * 60 * 60 * 1000));
        const formattedDate = `${vietnamDate.getFullYear()}-${String(vietnamDate.getMonth() + 1).padStart(2, "0")}-${String(vietnamDate.getDate()).padStart(2, "0")} ${String(vietnamDate.getHours()).padStart(2, "0")}:${String(vietnamDate.getMinutes()).padStart(2, "0")}:${String(vietnamDate.getSeconds()).padStart(2, "0")}`;
        
        // Format amount
        const amountFormatted = Math.floor(item.amountReceived).toLocaleString("vi-VN") + "đ";
        
        // Format bank info
        const bankInfo = item.bankName && item.bankNumber 
          ? `${item.bankName}\n${item.bankNumber}`
          : item.bankName || item.bankNumber || "Chưa có";
        
        return {
          id: `WD${String(item.paymentRequestId).padStart(3, "0")}`,
          paymentRequestId: item.paymentRequestId,
          user: item.userName || item.userEmail || "N/A",
          userEmail: item.userEmail,
          type: "Book Owner", // TODO: Có thể thêm logic để xác định loại user
          amount: amountFormatted,
          amountReceived: item.amountReceived,
          bank: bankInfo,
          bankName: item.bankName,
          bankNumber: item.bankNumber,
          status: statusText,
          statusRaw: item.status,
          date: formattedDate,
          requestedCoin: item.requestedCoin,
          userId: item.userId,
        };
      });
      
      setWithdraws(mappedData);
    } catch (err) {
      console.error("Error loading payment requests:", err);
      setError(err.message || "Không thể tải danh sách yêu cầu rút tiền");
      setWithdraws([]);
    } finally {
      setLoading(false);
    }
  };

  // Tính stats từ dữ liệu thực
  const stats = [
    { 
      label: "Tổng yêu cầu", 
      value: withdraws.length, 
      color: "text-blue-600" 
    },
    { 
      label: "Chờ duyệt", 
      value: withdraws.filter(w => w.status === "Chờ duyệt").length, 
      color: "text-yellow-600" 
    },
    { 
      label: "Hoàn thành", 
      value: withdraws.filter(w => w.status === "Hoàn thành").length, 
      color: "text-green-600" 
    },
    { 
      label: "Từ chối", 
      value: withdraws.filter(w => w.status === "Từ chối").length, 
      color: "text-red-600" 
    },
  ];

  // Tính tổng tiền chờ xử lý và đã chi trả
  const pendingAmount = withdraws
    .filter(w => w.status === "Chờ duyệt")
    .reduce((sum, w) => sum + (w.amountReceived || 0), 0);
  
  const completedAmount = withdraws
    .filter(w => w.status === "Hoàn thành")
    .reduce((sum, w) => sum + (w.amountReceived || 0), 0);

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
          Chờ xử lý: <span className="text-red-600">{pendingAmount.toLocaleString("vi-VN")}đ</span>
        </p>
        <p className="text-gray-700 font-semibold">
          Đã chi trả: <span className="text-green-600">{completedAmount.toLocaleString("vi-VN")}đ</span>
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button
            onClick={loadPaymentRequests}
            className="ml-4 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8 text-gray-600">
          Đang tải dữ liệu...
        </div>
      )}

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
            {!loading && paginatedWithdraws.map((w) => (
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
          onClose={() => {
            setApproveWithdraw(null);
            loadPaymentRequests(); // Reload sau khi duyệt
          }}
        />
      )}

      {rejectWithdraw && (
        <WithdrawRejectModal
          withdraw={rejectWithdraw}
          onClose={() => {
            setRejectWithdraw(null);
            loadPaymentRequests(); // Reload sau khi từ chối
          }}
        />
      )}
    </div>
  );
};

export default WithdrawApprovalPage;
