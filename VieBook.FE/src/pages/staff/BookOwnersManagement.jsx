import React, { useState, useEffect } from "react";
import {
  FaEye,
  FaEnvelope,
  FaLock,
  FaLockOpen,
  FaCrown,
  FaRegCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import BookOwnerDetailModal from "../../components/staff/book-owners/BookOwnerDetailModal";
import EmailModal from "../../components/staff/book-owners/EmailModal";
import ConfirmStatusModal from "../../components/staff/book-owners/ConfirmStatusModal";
import { getBookOwnerAccounts, toggleAccountStatus, getUserSubscription } from "../../api/userManagementApi";

export default function BookOwnersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookOwners, setBookOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState({});

  // Load data từ API
  useEffect(() => {
    loadBookOwners();
  }, []);

  const loadBookOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookOwnerAccounts();
      setBookOwners(data);
      
      // Load subscription data for each book owner
      const subscriptionPromises = data.map(async (owner) => {
        try {
          const subscription = await getUserSubscription(owner.userId);
          return { userId: owner.userId, subscription };
        } catch (err) {
          console.warn(`Failed to load subscription for user ${owner.userId}:`, err);
          return { userId: owner.userId, subscription: null };
        }
      });
      
      const subscriptionResults = await Promise.all(subscriptionPromises);
      const subscriptionMap = {};
      subscriptionResults.forEach(({ userId, subscription }) => {
        subscriptionMap[userId] = subscription;
      });
      console.log('Loaded subscriptions:', subscriptionMap);
      setSubscriptions(subscriptionMap);
    } catch (err) {
      setError(err.message);
      console.error('Error loading book owner accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lọc + phân trang
  const filteredOwners = bookOwners.filter((owner) => {
    const matchesSearch =
      (owner.fullName && owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ownersPerPage = 5;
  const totalPages = Math.ceil(filteredOwners.length / ownersPerPage);
  const paginatedOwners = filteredOwners.slice(
    (currentPage - 1) * ownersPerPage,
    currentPage * ownersPerPage
  );

  // Actions
  const handleViewDetails = (owner) => {
    setSelectedOwner(owner);
    setShowDetailModal(true);
  };

  const handleToggleStatus = (owner) => {
    setSelectedOwner(owner);
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async (owner) => {
    try {
      await toggleAccountStatus(owner.userId);
      await loadBookOwners(); // Reload data
      setShowStatusModal(false);
      
      // Hiển thị toast thành công
      const newStatus = owner.status === "Active" ? "khóa" : "mở khóa";
      toast.success(`Đã ${newStatus} tài khoản ${owner.fullName || owner.email} thành công!`);
    } catch (err) {
      setError(err.message);
      toast.error(`Lỗi khi ${owner.status === "Active" ? "khóa" : "mở khóa"} tài khoản: ${err.message}`);
      console.error('Error toggling account status:', err);
    }
  };

  const handleSendEmail = (owner) => {
    setSelectedOwner(owner);
    setShowEmailModal(true);
  };

  const renderVipBadge = (owner) => {
    const subscription = subscriptions[owner.userId];
    
    // Debug log để kiểm tra dữ liệu
    console.log('Owner:', owner.userId, 'Subscription:', subscription);
    
    // Nếu có subscription và đang active
    if (subscription && subscription.status === 'Active') {
      const planId = subscription.planId || subscription.plan?.id;
      const planName = subscription.plan?.name || subscription.planName;
      
      // Check theo PlanId trước
      switch (planId) {
        case 1:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              <FaCrown className="mr-1 text-yellow-500" /> Reader Plus
            </span>
          );
        case 2:
          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              <FaCrown className="mr-1 text-purple-500" /> Owner Pro
            </span>
          );
        default:
          // Fallback theo tên plan nếu có
          if (planName) {
            return (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                <FaCrown className="mr-1 text-blue-500" /> {planName}
              </span>
            );
          }
      }
    }
    
    // Nếu không có subscription hoặc không active
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        <FaRegCircle className="mr-1" /> None
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-30">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Quản lý Book Owner
      </h2>
      <p className="text-gray-600 mb-6">
        Quản lý người dùng đăng sách trên hệ thống
      </p>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 text-gray-800"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Locked">Bị khóa</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Book Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Số sách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gói VIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOwners.map((owner) => (
                  <tr key={owner.userId} className="hover:bg-gray-50 text-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      {owner.avatarUrl ? (
                        <img
                          src={owner.avatarUrl}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <i className="ri-user-line text-gray-600"></i>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {owner.fullName || 'Chưa cập nhật'}
                        </div>
                        <div className="text-gray-600 text-sm">{owner.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{owner.bookCount}</td>
                    <td className="px-6 py-4">
                      {renderVipBadge(owner)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          owner.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {owner.status === "Active" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                  <td className="px-6 py-4 space-x-2 flex">
                    <button
                      onClick={() => handleViewDetails(owner)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleSendEmail(owner)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Gửi email"
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(owner)}
                      className={`p-2 rounded-lg ${
                        owner.status === "Active"
                          ? "text-red-600 hover:bg-red-100"
                          : "text-green-600 hover:bg-green-100"
                      }`}
                      title={
                        owner.status === "Active"
                          ? "Khóa tài khoản"
                          : "Mở khóa tài khoản"
                      }
                    >
                      {owner.status === "Active" ? <FaLock /> : <FaLockOpen />}
                    </button>
                  </td>
                </tr>
              ))
              )}
              {!loading && paginatedOwners.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t border-gray-200">
          <span className="text-sm text-gray-600">
            Trang {currentPage}/{totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-gray-800"
            >
              Trước
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 text-gray-800"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedOwner && (
        <BookOwnerDetailModal
          owner={selectedOwner}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showEmailModal && selectedOwner && (
        <EmailModal
          owner={selectedOwner}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showStatusModal && selectedOwner && (
        <ConfirmStatusModal
          owner={selectedOwner}
          onClose={() => setShowStatusModal(false)}
          onConfirm={confirmToggleStatus}
        />
      )}
    </div>
  );
}
