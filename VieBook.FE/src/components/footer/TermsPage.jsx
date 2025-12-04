import React from "react";
import { FaBook, FaUser, FaGavel } from "react-icons/fa";

export default function TermsPage() {
  return (
    <div className="bg-gray-900 min-h-screen pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-white">
    <h1 className="text-3xl font-bold mb-8 text-center text-white">
      Điều khoản sử dụng
    </h1>

    <p className="text-gray-300 mb-8 leading-relaxed">
      Chào mừng bạn đến với <strong>VieBook</strong> — nền tảng sách thông minh. 
      Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.
    </p>

    {/* 1. Quyền và nghĩa vụ người dùng */}
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-3">
        <FaUser className="text-indigo-400 w-5 h-5" />
        <h2 className="text-xl font-semibold text-white">
          1. Quyền và nghĩa vụ của người dùng
        </h2>
      </div>
      <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
        <li>Không chia sẻ, sao chép nội dung sách khi chưa được phép.</li>
        <li>Không sử dụng nền tảng vào mục đích vi phạm pháp luật.</li>
        <li>Người dùng chịu trách nhiệm với hoạt động của tài khoản mình.</li>
      </ul>
    </div>

    {/* 2. Quyền của VieBook */}
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-3">
        <FaBook className="text-indigo-400 w-5 h-5" />
        <h2 className="text-xl font-semibold text-white">2. Quyền của VieBook</h2>
      </div>
      <p className="text-gray-300 leading-relaxed">
        VieBook có quyền cập nhật, chỉnh sửa hoặc ngừng cung cấp dịch vụ khi cần thiết. 
        Mọi thay đổi sẽ được thông báo trên hệ thống hoặc qua email.
      </p>
    </div>

    {/* 3. Giới hạn trách nhiệm */}
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-3">
        <FaGavel className="text-indigo-400 w-5 h-5" />
        <h2 className="text-xl font-semibold text-white">3. Giới hạn trách nhiệm</h2>
      </div>
      <p className="text-gray-300 leading-relaxed">
        VieBook không chịu trách nhiệm về thiệt hại phát sinh từ việc sử dụng sai cách, 
        vi phạm bản quyền hoặc hành vi trái pháp luật của người dùng.
      </p>
    </div>

    {/* Last updated */}
        <p className="text-gray-500 mt-10 italic text-sm text-center">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>

  );
}
