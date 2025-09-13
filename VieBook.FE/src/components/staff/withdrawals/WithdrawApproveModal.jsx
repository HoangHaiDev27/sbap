import React from "react";

export default function WithdrawApproveModal({ withdraw, onClose }) {
  if (!withdraw) return null;

  const handleConfirm = () => {
    console.log("✅ Duyệt thành công:", withdraw.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Xác nhận duyệt yêu cầu
        </h2>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn <span className="font-semibold">duyệt</span> yêu cầu rút tiền{" "}
          <span className="font-bold">{withdraw.id}</span> của{" "}
          <span className="font-semibold">{withdraw.user}</span>?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
