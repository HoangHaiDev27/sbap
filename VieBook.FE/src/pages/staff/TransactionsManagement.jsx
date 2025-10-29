import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TransactionDetailModal from "../../components/staff/transactions/TransactionDetailModal";
import { transactionApi } from "../../api/transactionApi";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { isStaff, isAdmin } from "../../api/authApi";

// Hook để detect mobile
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default function TransactionsManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  
  // Mobile detection
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

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

  // API states
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    if (userId) {
      setUserIdFilter(userId);
    } else {
      setUserIdFilter(null);
    }
  }, [location.search]);

  // Load transactions and stats
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [searchTerm, typeFilter, statusFilter, dateFilter, userIdFilter, currentPage]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, dateFilter, userIdFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionApi.getTransactions({
        searchTerm,
        typeFilter,
        statusFilter,
        dateFilter,
        userId: userIdFilter,
        page: currentPage,
        pageSize: itemsPerPage
      });

      setTransactions(response.transactions || []);
      setTotalPages(response.totalPages || 0);
      setTotalCount(response.totalCount || 0);
      
      // Nếu trang hiện tại lớn hơn tổng số trang, reset về trang 1
      if (currentPage > (response.totalPages || 0) && (response.totalPages || 0) > 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading transactions:', err);
      
      // Nếu lỗi 401, redirect về login
      if (err.message.includes('Phiên đăng nhập đã hết hạn')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await transactionApi.getTransactionStats({
        typeFilter,
        statusFilter,
        dateFilter,
        userId: userIdFilter
      });

      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };


  // No need for filteredTransactions since API handles filtering

  // Stats are now loaded from API

  const getTypeText = (type) => {
    switch (type) {
      case "wallet_topup":
        return "Nạp tiền";
      case "chapter_purchase":
        return "Mua chương";
      case "withdrawal_request":
        return "Rút tiền";
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Succeeded":
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Succeeded":
        return "Thành công";
      case "Paid":
        return "Đã thanh toán";
      case "Pending":
        return "Đang xử lý";
      case "Processing":
        return "Đang xử lý";
      case "Failed":
        return "Thất bại";
      case "Rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const clearUserFilter = () => {
    navigate("/staff/transactions");
  };

  // Pagination logic - giống như StoryGrid.jsx
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 2) {
        // Show first 3 pages, ellipsis, and last page
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        // Show first page, ellipsis, and last 3 pages
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Kiểm tra quyền truy cập
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-4">Bạn cần đăng nhập để truy cập trang này</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (!isStaff() && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Bạn cần có quyền Staff hoặc Admin để truy cập trang này</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

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

          {/* Thống kê - Mobile Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className={`p-4 ${isMobile ? 'grid grid-cols-2 gap-4' : 'p-6 grid grid-cols-1 md:grid-cols-4 gap-4'} text-center text-gray-900`}>
              <div className={`${isMobile ? 'col-span-2' : ''}`}>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-blue-600`}>
                  {stats?.totalTransactions || 0}
                </div>
                <div className="text-sm text-gray-700">Tổng giao dịch</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-600`}>
                  {stats?.successfulTransactions || 0}
                </div>
                <div className="text-sm text-gray-700">Thành công</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-yellow-600`}>
                  {stats?.pendingTransactions || 0}
                </div>
                <div className="text-sm text-gray-700">Đang xử lý</div>
              </div>
              <div>
                <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>
                  {stats?.failedTransactions || 0}
                </div>
                <div className="text-sm text-gray-700">Thất bại</div>
              </div>
            </div>
            <div className="border-t text-center py-4">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'} text-sm`}>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-green-600`}>
                    +{(stats?.walletTopupAmount || 0).toLocaleString("vi-VN")}đ
                  </div>
                  <div className="text-gray-600">Nạp tiền</div>
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-red-600`}>
                    {(stats?.chapterPurchaseAmount || 0).toLocaleString("vi-VN")} xu
                  </div>
                  <div className="text-gray-600">Mua chương</div>
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-orange-600`}>
                    -{(stats?.withdrawalAmount || 0).toLocaleString("vi-VN")} xu
                  </div>
                  <div className="text-gray-600">Rút tiền</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bộ lọc - Mobile Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className={`${isMobile ? 'p-4 space-y-4' : 'p-6 flex items-center justify-between flex-wrap gap-4'}`}>
              {/* Search Input - Full width on mobile */}
              <div className={`${isMobile ? 'w-full' : 'flex items-center gap-3 flex-wrap'}`}>
                <input
                  type="text"
                  placeholder="Tìm kiếm giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 ${isMobile ? 'w-full' : ''}`}
                />
                
                {/* Filter Grid - Responsive */}
                <div className={`${isMobile ? 'grid grid-cols-1 gap-3 mt-3' : 'flex items-center gap-3 flex-wrap'}`}>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 ${isMobile ? 'w-full' : ''}`}
                >
                  <option value="all">Tất cả loại</option>
                    <option value="wallet_topup">Nạp tiền</option>
                    <option value="chapter_purchase">Mua chương</option>
                    <option value="withdrawal_request">Rút tiền</option>
                </select>
                  
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 ${isMobile ? 'w-full' : ''}`}
                >
                  <option value="all">Tất cả trạng thái</option>
                    <option value="Succeeded">Thành công</option>
                    <option value="Paid">Đã thanh toán</option>
                    <option value="Pending">Đang xử lý</option>
                    <option value="Failed">Thất bại</option>
                    <option value="Rejected">Từ chối</option>
                </select>
                  
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                    className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 ${isMobile ? 'w-full' : ''}`}
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
                  
                  {/* User Filter - Mobile friendly */}
                {userIdFilter && (
                    <div className={`flex items-center gap-2 ${isMobile ? 'justify-between bg-gray-50 p-3 rounded-lg' : ''}`}>
                      <span className="text-sm text-gray-600">
                        User ID: {userIdFilter}
                      </span>
                  <button
                    onClick={clearUserFilter}
                        className="text-red-600 hover:text-red-800 text-sm bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                  >
                        ✕ Xóa
                  </button>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {/* Bảng giao dịch */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <>
{/* Desktop Table */}
            {!isMobile ? (
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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Không có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{t.id}</td>
                        <td className="px-6 py-4">{t.userName}</td>
                    <td className="px-6 py-4">
                      <div>{getTypeText(t.type)}</div>
                      <div className="text-sm text-gray-600">{t.description}</div>
                          {t.bookTitle && (
                            <div className="text-xs text-blue-600 mt-1">
                              📖 {t.bookTitle}
                            </div>
                          )}
                          {t.chapterTitle && (
                            <div className="text-xs text-green-600 mt-1">
                              📄 {t.chapterTitle}
                            </div>
                          )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                          {t.type === "wallet_topup" && (
                            <div>
                              <div className="text-green-600">
                                +{t.amountMoney?.toLocaleString("vi-VN")}đ
                              </div>
                              <div className="text-xs text-gray-500">
                                → {t.amountCoin?.toLocaleString("vi-VN")} xu
                              </div>
                            </div>
                          )}
                          {t.type === "chapter_purchase" && (
                            <div className="text-red-600">
                              {t.amountCoin?.toLocaleString("vi-VN")} xu
                            </div>
                          )}
                          {t.type === "withdrawal_request" && (
                            <div className="text-orange-600">
                              -{t.amountCoin?.toLocaleString("vi-VN")} xu
                            </div>
                          )}
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
                          {t.provider && (
                            <div className="text-xs text-blue-600 mt-1">
                              💳 {t.provider}
                            </div>
                          )}
                          {t.transactionId && (
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {t.transactionId}
                            </div>
                          )}
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
                    ))
                  )}
              </tbody>
            </table>
            ) : (
              /* Mobile Cards */
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có giao dịch nào
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">#{t.id}</div>
                          <div className="text-sm text-gray-600">{t.userName}</div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {getStatusText(t.status)}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loại:</span>
                          <span className="text-sm font-medium">{getTypeText(t.type)}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600">{t.description}</div>
                        
                        {t.bookTitle && (
                          <div className="text-xs text-blue-600">
                            📖 {t.bookTitle}
                          </div>
                        )}
                        
                        {t.chapterTitle && (
                          <div className="text-xs text-green-600">
                            📄 {t.chapterTitle}
                          </div>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="mb-3">
                        {t.type === "wallet_topup" && (
                          <div className="text-green-600 font-semibold">
                            +{t.amountMoney?.toLocaleString("vi-VN")}đ
                            <span className="text-xs text-gray-500 ml-1">
                              → {t.amountCoin?.toLocaleString("vi-VN")} xu
                            </span>
                          </div>
                        )}
                        {t.type === "chapter_purchase" && (
                          <div className="text-red-600 font-semibold">
                            {t.amountCoin?.toLocaleString("vi-VN")} xu
                          </div>
                        )}
                        {t.type === "withdrawal_request" && (
                          <div className="text-orange-600 font-semibold">
                            -{t.amountCoin?.toLocaleString("vi-VN")} xu
                          </div>
                        )}
                      </div>

                      {/* Time & Provider */}
                      <div className="text-xs text-gray-500 mb-3">
                        <div>{t.date} {t.time}</div>
                        {t.provider && (
                          <div>💳 {t.provider}</div>
                        )}
                        {t.transactionId && (
                          <div>ID: {t.transactionId}</div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          setSelectedTransaction(t);
                          setShowModal(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Pagination - Mobile Responsive */}
            {totalPages > 1 && (
              <div className={`flex justify-center items-center ${isMobile ? 'px-4 py-4' : 'px-6 py-4'} border-t ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded ${
                    currentPage === 1 || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isMobile ? 'Trước' : 'Trang trước'}
                </button>

                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={`${isMobile ? 'px-1' : 'px-3'} py-1 text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded ${
                    currentPage === totalPages || loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isMobile ? 'Sau' : 'Trang sau'}
                </button>
              </div>
            )}
              </>
            )}
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
