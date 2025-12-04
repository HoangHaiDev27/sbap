import React from "react";
import {
  FaDatabase,
  FaShieldAlt,
  FaLock,
  FaUserCheck,
  FaShareAlt,
} from "react-icons/fa";

export default function PrivacyPage() {
  return (
    <div className="bg-gray-900 min-h-screen pt-20 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Chính sách bảo mật
        </h1>

        <p className="text-gray-300 mb-8 leading-relaxed">
          VieBook cam kết bảo vệ thông tin cá nhân và quyền riêng tư của người
          dùng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng, chia sẻ
          và bảo vệ dữ liệu khi bạn sử dụng nền tảng VieBook.
        </p>

        {/* 1. Dữ liệu được thu thập */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaDatabase className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">1. Dữ liệu được thu thập</h2>
          </div>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
            <li>Thông tin cá nhân như họ tên, email, số điện thoại.</li>
            <li>Thông tin đăng nhập, lịch sử hoạt động và tìm kiếm.</li>
            <li>
              Nội dung người dùng tải lên, ví dụ: sách, bình luận, đánh giá.
            </li>
          </ul>
        </div>

        {/* 2. Mục đích sử dụng dữ liệu */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaShieldAlt className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">2. Mục đích sử dụng dữ liệu</h2>
          </div>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
            <li>Cung cấp và cải thiện chất lượng dịch vụ VieBook.</li>
            <li>Hỗ trợ kỹ thuật, xử lý yêu cầu hoặc phản hồi của người dùng.</li>
            <li>Gửi thông báo, bản tin, ưu đãi và nội dung liên quan.</li>
            <li>Đảm bảo an ninh, ngăn chặn gian lận hoặc hành vi vi phạm.</li>
          </ul>
        </div>

        {/* 3. Bảo mật và lưu trữ */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaLock className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">3. Bảo mật và lưu trữ</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Dữ liệu người dùng được mã hóa và lưu trữ trong hệ thống bảo mật cao.
            VieBook sử dụng các biện pháp kỹ thuật như HTTPS, xác thực hai lớp và
            kiểm soát truy cập nội bộ. Dữ liệu sẽ được lưu trữ trong thời gian cần
            thiết để cung cấp dịch vụ hoặc tuân thủ quy định pháp luật.
          </p>
        </div>

        {/* 4. Quyền của người dùng */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaUserCheck className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">4. Quyền của người dùng</h2>
          </div>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed">
            <li>Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân.</li>
            <li>Từ chối nhận thông tin quảng cáo bất kỳ lúc nào.</li>
            <li>
              Liên hệ với VieBook để được hỗ trợ về quyền riêng tư và dữ liệu cá
              nhân.
            </li>
          </ul>
        </div>

        {/* 5. Chia sẻ thông tin với bên thứ ba */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <FaShareAlt className="text-indigo-400 w-5 h-5" />
            <h2 className="text-xl font-semibold">
              5. Chia sẻ thông tin với bên thứ ba
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            VieBook không chia sẻ thông tin người dùng với bất kỳ bên thứ ba nào
            ngoại trừ khi:
          </p>
          <ul className="list-disc pl-6 text-gray-300 space-y-2 leading-relaxed mt-2">
            <li>Được người dùng đồng ý rõ ràng.</li>
            <li>
              Tuân thủ yêu cầu của pháp luật hoặc cơ quan nhà nước có thẩm quyền.
            </li>
            <li>
              Hợp tác với đối tác cung cấp dịch vụ (ví dụ: thanh toán, lưu trữ dữ
              liệu) – trong phạm vi cần thiết và có ràng buộc bảo mật.
            </li>
          </ul>
        </div>

            <p className="text-gray-500 mt-10 italic text-sm text-center">
          Cập nhật lần cuối: 01/11/2025
        </p>
      </div>
    </div>
  );
}
