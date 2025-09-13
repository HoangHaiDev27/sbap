import React, { useState } from "react";

export default function WithdrawRejectModal({ withdraw, onClose }) {
  const [reason, setReason] = useState("");

  if (!withdraw) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do từ chối.");
      return;
    }
    console.log("❌ Từ chối:", withdraw.id, "Lý do:", reason);
    onClose();
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

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
