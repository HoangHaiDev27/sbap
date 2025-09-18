import React from "react";
import { RiCheckLine, RiCloseLine, RiErrorWarningLine } from "react-icons/ri";

const PaymentModal = ({ isOpen, onClose, status, message, amount }) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <RiCheckLine className="w-16 h-16 text-green-500" />;
      case "error":
        return <RiErrorWarningLine className="w-16 h-16 text-red-500" />;
      case "pending":
        return <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <RiErrorWarningLine className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "pending":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return "Thanh toán thành công!";
      case "error":
        return "Thanh toán thất bại!";
      case "pending":
        return "Đang xử lý thanh toán...";
      default:
        return "Thông báo thanh toán";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <RiCloseLine className="w-6 h-6" />
        </button>

        {/* Icon trạng thái */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Tiêu đề */}
        <h2 className={`text-2xl font-bold text-center mb-4 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h2>

        {/* Thông báo */}
        <p className="text-gray-300 text-center mb-6">
          {message || "Vui lòng kiểm tra lại thông tin thanh toán."}
        </p>

        {/* Số tiền (nếu có) */}
        {amount && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Số tiền:</span>
              <span className="text-orange-500 font-bold text-lg">
                {amount.toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        )}

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
