import React from "react";
import { FaEnvelope, FaLock, FaLockOpen, FaCrown, FaRegCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function BookOwnerDetailModal({
  owner,
  onClose,
  onSendEmail,
  onToggleStatus,
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
          <img
            className="h-16 w-16 rounded-full object-cover"
            src={owner.avatar}
            alt=""
          />
          <div>
            <h4 className="text-lg font-medium text-gray-900">{owner.name}</h4>
            <p className="text-gray-600">{owner.email}</p>
            <div className="mt-1 text-sm text-gray-600">
              ⭐ {owner.rating} điểm
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Số sách đã đăng</div>
            <div className="text-2xl font-bold text-gray-900">
              {owner.bookCount}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Tổng lượt xem</div>
            <div className="text-2xl font-bold text-gray-900">
              {owner.totalViews.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Trạng thái</div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  owner.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {owner.status === "active" ? "Hoạt động" : "Bị khóa"}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Ngày tham gia</div>
            <div className="text-lg font-semibold text-gray-900">
              {owner.joinDate}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg col-span-2">
            <div className="text-sm text-gray-600">Gói VIP</div>
            <div className="mt-1">{renderVipBadge(owner.vipPackage)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => onSendEmail(owner.email)}
            className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaEnvelope className="mr-2" /> Gửi email
          </button>
          <button
            onClick={() => onToggleStatus(owner.id, owner.status)}
            className={`px-4 py-2 flex items-center rounded-lg text-white ${
              owner.status === "active"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {owner.status === "active" ? (
              <>
                <FaLock className="mr-2" /> Khóa tài khoản
              </>
            ) : (
              <>
                <FaLockOpen className="mr-2" /> Mở khóa tài khoản
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
