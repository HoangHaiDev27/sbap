import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TransactionDetailModal from "../../components/staff/transactions/TransactionDetailModal";

export default function TransactionsManagement() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState(null);

  // phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    if (userId) {
      setUserIdFilter(userId);
    } else {
      setUserIdFilter(null);
    }
  }, [location.search]);

  const transactions = [
    {
      id: "TX001",
      user: "Nguyễn Minh A",
      userId: "1",
      type: "book_purchase",
      description: "Mua sách: Sapiens",
      amount: 99000,
      status: "success",
      date: "2024-01-22",
      time: "14:30:25",
      paymentMethod: "VNPay",
      bookTitle: "Sapiens: Lược sử loài người",
    },
    {
      id: "TX002",
      user: "Trần Thị B",
      userId: "2",
      type: "vip_upgrade",
      description: "Nâng cấp VIP Premium",
      amount: 299000,
      status: "success",
      date: "2024-01-22",
      time: "10:15:42",
      paymentMethod: "MoMo",
      bookTitle: null,
    },
    {
      id: "TX003",
      user: "Lê Văn C",
      userId: "3",
      type: "package_purchase",
      description: "Mua gói 30 ngày",
      amount: 199000,
      status: "pending",
      date: "2024-01-22",
      time: "09:45:18",
      paymentMethod: "Banking",
      bookTitle: null,
    },
    {
      id: "TX004",
      user: "Phạm Thị D",
      userId: "4",
      type: "credit_topup",
      description: "Nạp xu vào tài khoản",
      amount: 150000,
      status: "success",
      date: "2024-01-21",
      time: "16:20:33",
      paymentMethod: "ViettelPay",
      bookTitle: null,
    },
    {
      id: "TX005",
      user: "Hoàng Văn E",
      userId: "5",
      type: "book_rental",
      description: "Thuê sách: Đắc nhân tâm",
      amount: 49000,
      status: "failed",
      date: "2024-01-21",
      time: "11:55:12",
      paymentMethod: "ZaloPay",
      bookTitle: "Đắc nhân tâm",
    },
    {
      id: "TX006",
      user: "Nguyễn Văn F",
      userId: "6",
      type: "book_purchase",
      description: "Mua sách: Atomic Habits",
      amount: 120000,
      status: "success",
      date: "2024-01-20",
      time: "13:40:20",
      paymentMethod: "VNPay",
      bookTitle: "Atomic Habits",
    },
    {
      id: "TX007",
      user: "Trần Văn G",
      userId: "7",
      type: "vip_upgrade",
      description: "Nâng cấp VIP Basic",
      amount: 199000,
      status: "pending",
      date: "2024-01-20",
      time: "08:25:55",
      paymentMethod: "MoMo",
      bookTitle: null,
    },
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesUserId = !userIdFilter || transaction.userId === userIdFilter;

      const matchesSearch =
        transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        const daysDiff = Math.ceil(
          (today - transactionDate) / (1000 * 60 * 60 * 24)
        );

        switch (dateFilter) {
          case "today":
            matchesDate = daysDiff <= 1;
            break;
          case "week":
            matchesDate = daysDiff <= 7;
            break;
          case "month":
            matchesDate = daysDiff <= 30;
            break;
          default:
            matchesDate = true;
        }
      }

      return (
        matchesUserId &&
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [transactions, searchTerm, typeFilter, statusFilter, dateFilter, userIdFilter]);

  const totalAmount = filteredTransactions
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  // phân trang
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeText = (type) => {
    switch (type) {
      case "book_purchase":
        return "Mua sách";
      case "book_rental":
        return "Thuê sách";
      case "vip_upgrade":
        return "Nâng cấp VIP";
      case "package_purchase":
        return "Mua gói";
      case "credit_topup":
        return "Nạp xu";
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "Thành công";
      case "pending":
        return "Đang xử lý";
      case "failed":
        return "Thất bại";
      default:
        return status;
    }
  };

  const clearUserFilter = () => {
    navigate("/staff/transactions");
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <main className="pt-25">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý Giao dịch
          </h2>
          <p className="text-gray-700 mb-6">
            Theo dõi và quản lý các giao dịch trên hệ thống
          </p>

          {/* Thống kê */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-gray-900">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTransactions.length}
                </div>
                <div className="text-sm text-gray-700">Tổng giao dịch</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {
                    filteredTransactions.filter((t) => t.status === "success")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-700">Thành công</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {
                    filteredTransactions.filter((t) => t.status === "pending")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-700">Đang xử lý</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {
                    filteredTransactions.filter((t) => t.status === "failed")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-700">Thất bại</div>
              </div>
            </div>
            <div className="border-t text-center py-4">
              <div className="text-lg font-semibold text-gray-900">
                Tổng doanh thu: {totalAmount.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>

          {/* Bộ lọc */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Tìm kiếm giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="book_purchase">Mua sách</option>
                  <option value="book_rental">Thuê sách</option>
                  <option value="vip_upgrade">Nâng cấp VIP</option>
                  <option value="package_purchase">Mua gói</option>
                  <option value="credit_topup">Nạp xu</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="success">Thành công</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="failed">Thất bại</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
                {userIdFilter && (
                  <button
                    onClick={clearUserFilter}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Xóa lọc userId
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bảng giao dịch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-gray-900">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{t.id}</td>
                    <td className="px-6 py-4">{t.user}</td>
                    <td className="px-6 py-4">
                      <div>{getTypeText(t.type)}</div>
                      <div className="text-sm text-gray-600">{t.description}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {t.amount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          t.status
                        )}`}
                      >
                        {getStatusText(t.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{t.date}</div>
                      <div className="text-sm text-gray-600">{t.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(t);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
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


        </div>
      </main>

      {showModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
