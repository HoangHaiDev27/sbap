import React, { useState } from "react";
import {
  FaEye,
  FaEnvelope,
  FaLock,
  FaLockOpen,
  FaCrown,
  FaRegCircle,
} from "react-icons/fa";
import BookOwnerDetailModal from "../../components/staff/book-owners/BookOwnerDetailModal";
import EmailModal from "../../components/staff/book-owners/EmailModal";
import ConfirmStatusModal from "../../components/staff/book-owners/ConfirmStatusModal";

export default function BookOwnersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fake data nhiều trang
  const bookOwners = Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    name: `Người dùng ${i + 1}`,
    email: `user${i + 1}@email.com`,
    avatar: `https://i.pravatar.cc/100?img=${i + 1}`,
    bookCount: Math.floor(Math.random() * 20),
    status: i % 3 === 0 ? "blocked" : "active",
    joinDate: "2024-01-15",
    totalViews: Math.floor(Math.random() * 20000),
    rating: (Math.random() * 5).toFixed(1),
    vipPackage: i % 2 === 0 ? "Gold" : i % 3 === 0 ? "Silver" : "None",
  }));

  // Lọc + phân trang
  const filteredOwners = bookOwners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const confirmToggleStatus = (owner) => {
    const newStatus = owner.status === "active" ? "blocked" : "active";
    console.log("Toggling status for owner:", owner.id, "to", newStatus);
    setShowStatusModal(false);
  };

  const handleSendEmail = (owner) => {
    setSelectedOwner(owner);
    setShowEmailModal(true);
  };

  const renderVipBadge = (vip) => {
    switch (vip) {
      case "Gold":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            <FaCrown className="mr-1 text-yellow-500" /> Gold
          </span>
        );
      case "Silver":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
            🥈 Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
            <FaRegCircle className="mr-1" /> None
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Quản lý Book Owner
      </h2>
      <p className="text-gray-600 mb-6">
        Quản lý người dùng đăng sách trên hệ thống
      </p>

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
            <option value="active">Đang hoạt động</option>
            <option value="blocked">Bị khóa</option>
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
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Đánh giá
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
              {paginatedOwners.map((owner) => (
                <tr key={owner.id} className="hover:bg-gray-50 text-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <img
                      src={owner.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">
                        {owner.name}
                      </div>
                      <div className="text-gray-600 text-sm">{owner.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{owner.bookCount}</td>
                  <td className="px-6 py-4">
                    {owner.totalViews.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{owner.rating}</td>
                  <td className="px-6 py-4">{renderVipBadge(owner.vipPackage)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        owner.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {owner.status === "active" ? "Hoạt động" : "Bị khóa"}
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
                        owner.status === "active"
                          ? "text-red-600 hover:bg-red-100"
                          : "text-green-600 hover:bg-green-100"
                      }`}
                      title={
                        owner.status === "active"
                          ? "Khóa tài khoản"
                          : "Mở khóa tài khoản"
                      }
                    >
                      {owner.status === "active" ? <FaLock /> : <FaLockOpen />}
                    </button>
                  </td>
                </tr>
              ))}
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
