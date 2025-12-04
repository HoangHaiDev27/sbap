import React from "react";

export default function ConfirmStatusModal({ owner, onClose, onConfirm }) {
  const newStatus = owner.status === "Active" ? "khóa" : "mở khóa";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Xác nhận thay đổi trạng thái</h3>
        <p className="text-gray-700 mb-6">
          Bạn có chắc chắn muốn{" "}
          <span className="font-bold">
            {owner.name}
          </span>{" "}
          {newStatus} tài khoản này?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(owner)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
