import React from "react";
import { FaRegCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function BookOwnerDetailModal({
  owner,
  onClose,
}) {
  const renderVipBadge = (vip) => {
    switch (vip) {
      case "Gold":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <FaCrown className="mr-1 text-yellow-500" /> Gold
          </span>
        );
      case "Silver":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
            🥈 Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
            <FaRegCircle className="mr-1" /> None
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết Book Owner
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Thông tin cơ bản */}
        <div className="flex items-center space-x-4 mb-6">
          {owner.avatarUrl ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={owner.avatarUrl}
              alt={owner.fullName}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
              <i className="ri-user-line text-gray-600 text-2xl"></i>
            </div>
          )}
          <div>
            <h4 className="text-lg font-medium text-gray-900">{owner.fullName || 'Chưa cập nhật'}</h4>
            <div className="mt-1 text-sm text-gray-600">
              📧 {owner.email}
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Số sách đã đăng</div>
            <div className="text-2xl font-bold text-gray-900">
              {owner.bookCount || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Số đơn hàng</div>
            <div className="text-2xl font-bold text-gray-900">
              {owner.orderCount || 0}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Trạng thái</div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  owner.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {owner.status === "Active" ? "Hoạt động" : "Bị khóa"}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Ngày tạo tài khoản</div>
            <div className="text-lg font-semibold text-gray-900">
              {new Date(owner.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
