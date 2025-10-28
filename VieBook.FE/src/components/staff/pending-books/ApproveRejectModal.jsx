import React, { useState } from "react";
import { approveBookApproval, refuseBookApproval } from "../../../api/staffApi";

export default function ApproveRejectModal({ type, book, staffId, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (type === "reject" && !reason.trim()) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Bạn cần nhập lý do từ chối!" },
        })
      );
      return;
    }

    if (!staffId) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Không tìm thấy user, vui lòng đăng nhập!" },
        })
      );
      return;
    }

    setLoading(true);
    try {
      if (type === "approve") {
        await approveBookApproval(book.id, staffId);
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "success", message: `Duyệt sách "${book.title}" thành công` },
          })
        );
      } else {
        await refuseBookApproval(book.id, staffId, reason);
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "success", message: `Từ chối sách "${book.title}" thành công` },
          })
        );
      }

      onConfirm(type, book.id, reason); // cập nhật danh sách ở cha
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Đã có lỗi xảy ra" },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {type === "approve" ? "Xác nhận duyệt sách" : "Từ chối sách"}
        </h3>
        <p className="text-gray-700 mb-4">
          {type === "approve"
            ? `Bạn có chắc chắn muốn duyệt sách "${book.title}"?`
            : `Nhập lý do từ chối sách "${book.title}":`}
        </p>

        {type === "reject" && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-red-500 text-black"
            rows="3"
            disabled={loading}
          />
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-lg text-white ${
              type === "approve"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : type === "approve" ? "Xác nhận" : "Từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}