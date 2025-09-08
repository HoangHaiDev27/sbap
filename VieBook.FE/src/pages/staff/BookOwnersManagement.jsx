import React, { useState } from "react";
import { FaEye, FaEnvelope, FaLock, FaLockOpen, FaCrown, FaRegCircle } from "react-icons/fa";
import BookOwnerDetailModal from "../../components/staff/book-owners/BookOwnerDetailModal";

export default function BookOwnersManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const bookOwners = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20asian%20male%20writer%20portrait&width=100&height=100&seq=avatar1&orientation=squarish",
      bookCount: 12,
      status: "active",
      joinDate: "2024-01-15",
      totalViews: 15420,
      rating: 4.8,
      vipPackage: "Gold",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20asian%20female%20author%20portrait&width=100&height=100&seq=avatar2&orientation=squarish",
      bookCount: 8,
      status: "active",
      joinDate: "2024-01-10",
      totalViews: 9850,
      rating: 4.6,
      vipPackage: "Silver",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      avatar:
        "https://readdy.ai/api/search-image?query=professional%20young%20asian%20male%20creator%20portrait&width=100&height=100&seq=avatar3&orientation=squarish",
      bookCount: 5,
      status: "blocked",
      joinDate: "2024-01-05",
      totalViews: 3200,
      rating: 3.8,
      vipPackage: "None",
    },
  ];

  const filteredOwners = bookOwners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (owner) => {
    setSelectedOwner(owner);
    setShowModal(true);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    const action = newStatus === "blocked" ? "khóa" : "mở khóa";
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      console.log("Toggling status for owner:", id, "to", newStatus);
    }
  };

  const handleSendEmail = (email) => {
    console.log("Sending email to:", email);
    alert("Đã mở ứng dụng email để gửi tin nhắn");
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
              {filteredOwners.map((owner) => (
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
                      onClick={() => handleSendEmail(owner.email)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Gửi email"
                    >
                      <FaEnvelope />
                    </button>
                    <button
                      onClick={() =>
                        handleToggleStatus(owner.id, owner.status)
                      }
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
      </div>

      {showModal && selectedOwner && (
        <BookOwnerDetailModal
          owner={selectedOwner}
          onClose={() => setShowModal(false)}
          onSendEmail={handleSendEmail}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
}
