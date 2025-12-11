import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CustomerDetailModal from "../../components/staff/customers/CustomerDetailModal";
import ConfirmModal from "../../components/staff/customers/ConfirmModal";
import { getCustomerAccounts, toggleAccountStatus } from "../../api/userManagementApi";

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionCustomer, setActionCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data từ API
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerAccounts();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading customer accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo search + trạng thái
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleConfirmToggle = (customer) => {
    setActionCustomer(customer);
    setShowConfirmModal(true);
  };

  const handleToggleStatus = async () => {
    if (actionCustomer) {
      try {
        await toggleAccountStatus(actionCustomer.userId);
        await loadCustomers(); // Reload data
        setShowConfirmModal(false);
        
        // Hiển thị toast thành công
        const newStatus = actionCustomer.status === "Active" ? "khóa" : "mở khóa";
        toast.success(`Đã ${newStatus} tài khoản ${actionCustomer.fullName || actionCustomer.email} thành công!`);
      } catch (err) {
        setError(err.message);
        toast.error(`Lỗi khi ${actionCustomer.status === "Active" ? "khóa" : "mở khóa"} tài khoản: ${err.message}`);
        console.error('Error toggling account status:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-30">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h2>
      <p className="text-gray-600 mb-6">Quản lý người dùng sử dụng nền tảng</p>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Filter */}
        <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:space-x-0">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64 text-gray-800 placeholder:text-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 w-full sm:w-auto"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Locked">Bị khóa</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày đăng ký</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      {customer.avatarUrl ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={customer.avatarUrl} alt={customer.fullName} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <i className="ri-user-line text-gray-600"></i>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{customer.fullName || 'Chưa cập nhật'}</div>
                        <div className="text-gray-500 text-sm">{customer.email}</div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.status === "Active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 space-x-2 flex">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                    <button
                      onClick={() => (window.location.href = `/staff/transactions?userId=${customer.userId}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                      title="Xem lịch sử giao dịch"
                    >
                      <i className="ri-history-line"></i>
                    </button>
                    <button
                      onClick={() => handleConfirmToggle(customer)}
                      className={`p-2 rounded-lg ${
                        customer.status === "Active" ? "text-red-600 hover:bg-red-100" : "text-green-600 hover:bg-green-100"
                      }`}
                      title={customer.status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      <i className={customer.status === "Active" ? "ri-lock-line" : "ri-lock-unlock-line"}></i>
                    </button>
                  </td>
                </tr>
              ))
              )}
              {!loading && paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      {/* Detail Modal */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Confirm Toggle Modal */}
      {showConfirmModal && actionCustomer && (
        <ConfirmModal
          title={actionCustomer.status === "Active" ? "Xác nhận khóa tài khoản" : "Xác nhận mở khóa tài khoản"}
          message={`Bạn có chắc chắn muốn ${
            actionCustomer.status === "Active" ? "khóa" : "mở khóa"
          } tài khoản ${actionCustomer.fullName || actionCustomer.email}?`}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
