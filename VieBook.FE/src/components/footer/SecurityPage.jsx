import React from "react";
import {
  FaLock,
  FaUserShield,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function SecurityPage() {
  return (
    <div className="bg-gray-900 min-h-screen pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Bảo mật thông tin
        </h1>

        <p className="text-gray-300 mb-8 leading-relaxed">
          VieBook đặt ưu tiên hàng đầu vào việc bảo vệ thông tin của người dùng
          và tác giả. Mọi hoạt động lưu trữ, xử lý dữ liệu đều tuân thủ tiêu
          chuẩn bảo mật cao nhất để đảm bảo an toàn tuyệt đối.
        </p>

        {/* 1. Mã hóa dữ liệu */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaLock className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">1. Mã hóa dữ liệu</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Toàn bộ dữ liệu cá nhân và giao dịch được mã hóa bằng chuẩn SSL
            256-bit để đảm bảo an toàn tuyệt đối trong quá trình truyền tải.
            Các thông tin nhạy cảm như mật khẩu hoặc thông tin thanh toán được
            xử lý riêng biệt và không bao giờ lưu dưới dạng văn bản thuần túy.
          </p>
        </div>

        {/* 2. Quản lý truy cập */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaUserShield className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">2. Quản lý truy cập</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            VieBook sử dụng hệ thống phân quyền chặt chẽ giữa quản trị viên,
            nhân viên và người dùng nhằm ngăn chặn truy cập trái phép. Mọi hành
            động đăng nhập, chỉnh sửa dữ liệu đều được ghi log để đảm bảo tính
            minh bạch và dễ dàng truy vết khi cần thiết.
          </p>
        </div>

        {/* 3. Xử lý vi phạm bảo mật */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaExclamationTriangle className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">
              3. Xử lý vi phạm bảo mật
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Trong trường hợp phát hiện rò rỉ hoặc vi phạm dữ liệu, VieBook sẽ
            ngay lập tức:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed mt-2">
            <li>Thông báo cho người dùng bị ảnh hưởng và cơ quan có thẩm quyền.</li>
            <li>Tiến hành cô lập khu vực bị tấn công và khôi phục hệ thống an toàn.</li>
            <li>Cập nhật biện pháp bảo mật để ngăn chặn tái diễn.</li>
          </ul>
        </div>

        {/* Last updated */}
        <p className="text-gray-500 mt-10 italic text-sm text-center">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>
  );
}
