import React from "react";

export default function SecurityPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-14 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Bảo mật thông tin
        </h1>

        <p className="text-gray-600 mb-4">
          VieBook đặt ưu tiên hàng đầu vào việc bảo vệ thông tin của người dùng
          và tác giả. Mọi hoạt động lưu trữ, xử lý dữ liệu đều tuân thủ tiêu
          chuẩn bảo mật cao nhất.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          1. Mã hóa dữ liệu
        </h2>
        <p className="text-gray-600">
          Toàn bộ dữ liệu cá nhân và giao dịch được mã hóa SSL 256-bit để đảm
          bảo an toàn trong quá trình truyền tải.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          2. Quản lý truy cập
        </h2>
        <p className="text-gray-600">
          Hệ thống sử dụng phân quyền nghiêm ngặt giữa quản trị viên, nhân viên
          và người dùng để tránh truy cập trái phép.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          3. Xử lý vi phạm bảo mật
        </h2>
        <p className="text-gray-600">
          Trong trường hợp phát hiện rò rỉ hoặc vi phạm dữ liệu, VieBook sẽ lập
          tức thông báo đến người dùng và cơ quan có thẩm quyền, đồng thời tiến
          hành khắc phục.
        </p>

        <p className="text-gray-600 mt-8 italic">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>
  );
}
