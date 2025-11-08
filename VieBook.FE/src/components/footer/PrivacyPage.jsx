import React from "react";

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-14 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Chính sách bảo mật
        </h1>

        <p className="text-gray-600 mb-4">
          VieBook cam kết bảo vệ thông tin cá nhân của người dùng. Chính sách
          này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          1. Dữ liệu được thu thập
        </h2>
        <p className="text-gray-600">
          Chúng tôi có thể thu thập thông tin như họ tên, email, số điện thoại,
          lịch sử giao dịch và hoạt động trên nền tảng để cải thiện dịch vụ.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          2. Mục đích sử dụng dữ liệu
        </h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Cung cấp và cải thiện trải nghiệm người dùng.</li>
          <li>Gửi thông báo, khuyến mãi và hỗ trợ kỹ thuật.</li>
          <li>Bảo mật tài khoản và ngăn chặn gian lận.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          3. Bảo mật và lưu trữ
        </h2>
        <p className="text-gray-600">
          Dữ liệu người dùng được mã hóa và lưu trữ an toàn. VieBook không chia
          sẻ thông tin với bên thứ ba nếu không có sự đồng ý.
        </p>

        <p className="text-gray-600 mt-8 italic">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>
  );
}
