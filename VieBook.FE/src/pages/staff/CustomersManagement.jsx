import React, { useState } from "react";
import CustomerDetailModal from "../../components/staff/customers/CustomerDetailModal";
import ConfirmModal from "../../components/staff/customers/ConfirmModal";

export default function CustomersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionCustomer, setActionCustomer] = useState(null);

  // Fake data để test (12 khách hàng)
  const customers = [
    { id: 1, name: "Nguyễn Minh A", email: "a@email.com", avatar: "https://i.pravatar.cc/100?img=1", totalListens: 1250, feedbackCount: 8, status: "active", joinDate: "2024-01-20" },
    { id: 2, name: "Trần Thị B", email: "b@email.com", avatar: "https://i.pravatar.cc/100?img=2", totalListens: 850, feedbackCount: 12, status: "active", joinDate: "2024-01-18" },
    { id: 3, name: "Lê Văn C", email: "c@email.com", avatar: "https://i.pravatar.cc/100?img=3", totalListens: 450, feedbackCount: 3, status: "blocked", joinDate: "2024-01-15" },
    { id: 4, name: "Phạm Thị D", email: "d@email.com", avatar: "https://i.pravatar.cc/100?img=4", totalListens: 2100, feedbackCount: 15, status: "active", joinDate: "2023-12-10" },
    { id: 5, name: "Hoàng Văn E", email: "e@email.com", avatar: "https://i.pravatar.cc/100?img=5", totalListens: 1800, feedbackCount: 9, status: "active", joinDate: "2023-11-25" },
    { id: 6, name: "Nguyễn Văn F", email: "f@email.com", avatar: "https://i.pravatar.cc/100?img=6", totalListens: 600, feedbackCount: 2, status: "active", joinDate: "2023-11-15" },
    { id: 7, name: "Trần Văn G", email: "g@email.com", avatar: "https://i.pravatar.cc/100?img=7", totalListens: 1400, feedbackCount: 5, status: "blocked", joinDate: "2023-11-05" },
    { id: 8, name: "Lê Thị H", email: "h@email.com", avatar: "https://i.pravatar.cc/100?img=8", totalListens: 1950, feedbackCount: 10, status: "active", joinDate: "2023-10-30" },
    { id: 9, name: "Phạm Văn I", email: "i@email.com", avatar: "https://i.pravatar.cc/100?img=9", totalListens: 2300, feedbackCount: 20, status: "active", joinDate: "2023-10-15" },
    { id: 10, name: "Hoàng Thị J", email: "j@email.com", avatar: "https://i.pravatar.cc/100?img=10", totalListens: 720, feedbackCount: 4, status: "active", joinDate: "2023-10-01" },
    { id: 11, name: "Đỗ Văn K", email: "k@email.com", avatar: "https://i.pravatar.cc/100?img=11", totalListens: 1320, feedbackCount: 6, status: "active", joinDate: "2023-09-20" },
    { id: 12, name: "Ngô Thị L", email: "l@email.com", avatar: "https://i.pravatar.cc/100?img=12", totalListens: 980, feedbackCount: 7, status: "blocked", joinDate: "2023-09-05" },
  ];

  // Lọc theo search + trạng thái
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleToggleStatus = () => {
    if (actionCustomer) {
      const newStatus = actionCustomer.status === "active" ? "blocked" : "active";
      console.log("Toggling status for customer:", actionCustomer.id, "to", newStatus);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-30">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h2>
      <p className="text-gray-600 mb-6">Quản lý người dùng sử dụng nền tảng</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Filter */}
        <div className="p-6 border-b border-gray-200 flex space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 text-gray-800 placeholder:text-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tổng lượt nghe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Đánh giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Ngày đăng ký</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src={customer.avatar} alt={customer.name} />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-gray-500 text-sm">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{customer.totalListens.toLocaleString()}</td>
                  <td className="px-6 py-4">{customer.feedbackCount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {customer.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{customer.joinDate}</td>
                  <td className="px-6 py-4 space-x-2 flex">
                    <button
                      onClick={() => handleViewDetails(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                    <button
                      onClick={() => (window.location.href = `/staff/transactions?userId=${customer.id}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                      title="Xem lịch sử giao dịch"
                    >
                      <i className="ri-history-line"></i>
                    </button>
                    <button
                      onClick={() => handleConfirmToggle(customer)}
                      className={`p-2 rounded-lg ${
                        customer.status === "active" ? "text-red-600 hover:bg-red-100" : "text-green-600 hover:bg-green-100"
                      }`}
                      title={customer.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      <i className={customer.status === "active" ? "ri-lock-line" : "ri-lock-unlock-line"}></i>
                    </button>
                  </td>
                </tr>
              ))}
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
          onToggleStatus={handleConfirmToggle}
        />
      )}

      {/* Confirm Toggle Modal */}
      {showConfirmModal && actionCustomer && (
        <ConfirmModal
          title="Xác nhận"
          message={`Bạn có chắc chắn muốn ${
            actionCustomer.status === "active" ? "khóa" : "mở khóa"
          } tài khoản ${actionCustomer.name}?`}
          onConfirm={handleToggleStatus}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}
