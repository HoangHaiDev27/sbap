import React, { useState } from "react";
import { rejectPaymentRequest } from "../../../api/paymentRequestApi";
import toast from "react-hot-toast";

export default function WithdrawRejectModal({ withdraw, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!withdraw) return null;

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await rejectPaymentRequest(withdraw.paymentRequestId, reason);
      toast.success("Đã từ chối yêu cầu rút tiền. Xu đã được hoàn lại vào ví của người dùng.");
      onClose();
    } catch (err) {
      console.error("Error rejecting payment request:", err);
      const errorMsg = err.message || "Không thể từ chối yêu cầu. Vui lòng thử lại.";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Từ chối yêu cầu rút tiền
        </h2>
        <p className="text-gray-700 mb-4">
          Nhập lý do từ chối cho yêu cầu{" "}
          <span className="font-bold">{withdraw.id}</span> của{" "}
          <span className="font-semibold">{withdraw.user}</span>:
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do..."
          className="w-full border rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-red-500 focus:outline-none mb-4"
          rows={4}
        ></textarea>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}
