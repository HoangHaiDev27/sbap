import React from "react";

export default function CustomerDetailModal({ customer, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose} // click nền để đóng
    >
      {/* Modal content */}
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()} // chặn click trong modal
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết Customer
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <i className="ri-close-line text-gray-700 text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {customer.avatarUrl ? (
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={customer.avatarUrl}
                alt={customer.fullName}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <i className="ri-user-line text-gray-600 text-2xl"></i>
              </div>
            )}
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {customer.fullName || 'Chưa cập nhật'}
              </h4>
              <p className="text-gray-600">{customer.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Số đơn hàng</div>
              <div className="text-2xl font-bold text-gray-900">
                {customer.orderCount || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Số sách đã mua</div>
              <div className="text-2xl font-bold text-gray-900">
                {customer.bookCount || 0}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Trạng thái</div>
              <div
                className={`text-lg font-semibold ${
                  customer.status === "Active"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {customer.status === "Active" ? "Hoạt động" : "Bị khóa"}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Ngày tạo tài khoản</div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
