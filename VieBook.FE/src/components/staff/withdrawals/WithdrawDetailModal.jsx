import React from "react";

const WithdrawDetailModal = ({ withdraw, onClose }) => {

  if (!withdraw) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose} // click nền để đóng
    >
      {/* Modal content */}
      <div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()} // chặn click bên trong
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4">Chi tiết yêu cầu rút tiền</h2>

        {/* Content */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-semibold">ID Yêu cầu:</span> {withdraw.id}
          </p>
          <p>
            <span className="font-semibold">Trạng thái:</span>{" "}
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                withdraw.status === "Chờ duyệt"
                  ? "bg-yellow-100 text-yellow-700"
                  : withdraw.status === "Đã duyệt"
                  ? "bg-blue-100 text-blue-700"
                  : withdraw.status === "Hoàn thành"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {withdraw.status}
            </span>
          </p>

          <p>
            <span className="font-semibold">Người yêu cầu:</span>{" "}
            {withdraw.user}
          </p>
          <p>
            <span className="font-semibold">Loại tài khoản:</span>{" "}
            {withdraw.type}
          </p>

          <p>
            <span className="font-semibold">Số tiền yêu cầu:</span>{" "}
            {withdraw.amount}
          </p>

          <p>
            <span className="font-semibold">Ngân hàng:</span>{" "}
            {withdraw.bank.split("\n")[0]}
          </p>
          <p>
            <span className="font-semibold">Số tài khoản:</span>{" "}
            {withdraw.bank.split("\n")[1]}
          </p>

          <p className="col-span-2">
            <span className="font-semibold">Ngày yêu cầu:</span>{" "}
            {withdraw.date}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawDetailModal;
