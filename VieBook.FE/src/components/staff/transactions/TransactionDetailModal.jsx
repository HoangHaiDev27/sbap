import React, { useState, useEffect } from "react";
import { transactionApi } from "../../../api/transactionApi";

export default function TransactionDetailModal({ transaction, onClose }) {
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transaction?.id) {
      loadTransactionDetail();
    }
  }, [transaction?.id]);

  const loadTransactionDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await transactionApi.getTransactionDetail(transaction.id);
      setTransactionDetail(detail);
    } catch (err) {
      setError(err.message);
      console.error('Error loading transaction detail:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (!transaction) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-xl shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          onClick={onClose}
        >
          <i className="ri-close-line text-2xl"></i>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Chi tiết giao dịch
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Lỗi:</strong> {error}
            </div>
          ) : transactionDetail ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Giao dịch
                  </label>
                  <p className="text-gray-900 font-mono">{transactionDetail.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giao dịch
                  </label>
                  <p className="text-gray-900">{getTypeText(transactionDetail.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người thực hiện
                  </label>
                  <p className="text-gray-900">{transactionDetail.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{transactionDetail.userEmail}</p>
                </div>
              </div>

              {/* Amount Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Thông tin số tiền</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transactionDetail.amountMoney && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số tiền thật
                      </label>
                      <p className="text-lg font-semibold text-green-600">
                        {transactionDetail.amountMoney.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  )}
                  {transactionDetail.amountCoin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số xu
                      </label>
                      <p className="text-lg font-semibold text-blue-600">
                        {transactionDetail.amountCoin.toLocaleString("vi-VN")} xu
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    transactionDetail.status
                  )}`}
                >
                  {getStatusText(transactionDetail.status)}
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <p className="text-gray-900">{transactionDetail.description}</p>
              </div>

              {/* Book/Chapter Info */}
              {(transactionDetail.bookTitle || transactionDetail.chapterTitle) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin sách/chương</h4>
                  {transactionDetail.bookTitle && (
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sách
                      </label>
                      <p className="text-gray-900">📖 {transactionDetail.bookTitle}</p>
                    </div>
                  )}
                  {transactionDetail.chapterTitle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chương
                      </label>
                      <p className="text-gray-900">📄 {transactionDetail.chapterTitle}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Info */}
              {(transactionDetail.provider || transactionDetail.transactionId) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin thanh toán</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transactionDetail.provider && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nhà cung cấp
                        </label>
                        <p className="text-gray-900">💳 {transactionDetail.provider}</p>
                      </div>
                    )}
                    {transactionDetail.transactionId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Giao dịch
                        </label>
                        <p className="text-gray-900 font-mono">{transactionDetail.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Time Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <p className="text-gray-900">
                    {new Date(transactionDetail.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-gray-900">
                    {new Date(transactionDetail.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {transactionDetail.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">
                    {transactionDetail.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không thể tải chi tiết giao dịch
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}