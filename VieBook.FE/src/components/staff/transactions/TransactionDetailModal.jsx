import React from "react";

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

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

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết giao dịch
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-600"
          >
            ✖
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID Giao dịch
              </label>
              <div className="text-gray-900 font-mono">{transaction.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  transaction.status
                )}`}
              >
                {getStatusText(transaction.status)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Người thực hiện
              </label>
              <div className="text-gray-900">{transaction.user}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loại giao dịch
              </label>
              <div className="text-gray-900">{getTypeText(transaction.type)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số tiền
              </label>
              <div className="text-gray-900 font-semibold text-lg">
                {transaction.amount.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phương thức thanh toán
              </label>
              <div className="text-gray-900">{transaction.paymentMethod}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày giao dịch
              </label>
              <div className="text-gray-900">{transaction.date}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thời gian
              </label>
              <div className="text-gray-900">{transaction.time}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <div className="text-gray-900">{transaction.description}</div>
          </div>

          {transaction.bookTitle && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sách liên quan
              </label>
              <div className="text-gray-900">{transaction.bookTitle}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
