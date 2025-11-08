import React from "react";

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-14 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Điều khoản sử dụng
        </h1>
        <p className="text-gray-600 mb-4">
          Chào mừng bạn đến với <strong>VieBook</strong> — nền tảng sách thông
          minh. Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng
          ý tuân thủ các điều khoản dưới đây.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          1. Quyền và nghĩa vụ của người dùng
        </h2>
        <ul className="list-disc pl-6 text-gray-600 space-y-2">
          <li>Không chia sẻ, sao chép nội dung sách khi chưa được phép.</li>
          <li>Không sử dụng nền tảng vào mục đích vi phạm pháp luật.</li>
          <li>Người dùng chịu trách nhiệm với hoạt động của tài khoản mình.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          2. Quyền của VieBook
        </h2>
        <p className="text-gray-600">
          VieBook có quyền cập nhật, chỉnh sửa hoặc ngừng cung cấp dịch vụ khi
          cần thiết. Mọi thay đổi sẽ được thông báo trên hệ thống hoặc qua
          email.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">
          3. Giới hạn trách nhiệm
        </h2>
        <p className="text-gray-600">
          VieBook không chịu trách nhiệm về thiệt hại phát sinh từ việc sử dụng
          sai cách, vi phạm bản quyền hoặc hành vi trái pháp luật của người dùng.
        </p>

        <p className="text-gray-600 mt-8 italic">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>
  );
}
