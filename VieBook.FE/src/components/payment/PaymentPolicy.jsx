import React, { useState } from "react";
import { RiInformationLine, RiCloseLine, RiCheckLine, RiAlertLine } from "react-icons/ri";

const PaymentPolicy = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Chính sách cố định của nền tảng
  const policies = [
    {
      title: "Tỷ lệ quy đổi",
      content: "1,000 VNĐ = 1 xu",
      icon: "💰",
      details: "Mỗi 1,000 VNĐ bạn nạp sẽ được quy đổi thành 1 xu trong tài khoản",
      important: true
    },
    {
      title: "Mục đích sử dụng",
      content: "Xu chỉ dùng để mua sách",
      icon: "📚",
      details: "Xu trong tài khoản chỉ có thể sử dụng để mua sách và các nội dung số trên nền tảng",
      important: true
    },
    {
      title: "Không thể rút tiền",
      content: "Người dùng không thể rút tiền",
      icon: "🚫",
      details: "Chỉ chủ sách mới có quyền yêu cầu rút tiền từ doanh thu bán sách. Người đọc nạp xu không thể rút xu.",
      important: true
    },
    {
      title: "Xu thưởng",
      content: "Nhận thêm xu khi nạp gói lớn",
      icon: "🎁",
      details: "Khi nạp các gói tiền lớn, bạn sẽ nhận được xu thưởng theo tỷ lệ quy định"
    },
    {
      title: "Bảo mật",
      content: "Giao dịch được bảo mật tuyệt đối",
      icon: "🔒",
      details: "Mọi giao dịch nạp tiền đều được mã hóa và bảo mật theo tiêu chuẩn quốc tế"
    },
    {
      title: "Hỗ trợ",
      content: "Liên hệ nếu có vấn đề",
      icon: "💬",
      details: "Nếu gặp vấn đề trong quá trình nạp tiền, vui lòng liên hệ bộ phận hỗ trợ"
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <RiInformationLine className="text-blue-400" />
          <span>Chính sách nạp tiền</span>
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <RiCloseLine className="w-5 h-5" />
          ) : (
            <RiInformationLine className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Tóm tắt chính sách quan trọng */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {policies.filter(policy => policy.important).map((policy, index) => (
          <div key={index} className={`rounded-lg p-4 ${
            policy.important ? 'bg-orange-900/30 border border-orange-500/50' : 'bg-gray-700'
          }`}>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{policy.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-orange-400">{policy.title}</h3>
                <p className="text-xs text-gray-300">{policy.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chi tiết chính sách */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            Chi tiết chính sách
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">{policy.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      {policy.title}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {policy.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lưu ý quan trọng */}
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <RiAlertLine className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-400 mb-2">
                  ⚠️ Lưu ý quan trọng
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <strong>Xu đã nạp không thể hoàn lại</strong> dưới mọi hình thức</li>
                  <li>• Xu chỉ có thể sử dụng để mua sách trên nền tảng</li>
                  <li>• <strong>Chỉ chủ sách mới có quyền yêu cầu rút tiền từ doanh thu bán sách</strong>. Người đọc nạp xu không thể rút xu thành tiền mặt.</li>
                  <li>• Mọi giao dịch đều được ghi nhận và lưu trữ</li>
                  <li>• Vui lòng đọc kỹ trước khi thực hiện giao dịch</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <RiInformationLine className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">
                  Cần hỗ trợ?
                </h4>
                <p className="text-sm text-gray-300">
                  Nếu bạn có thắc mắc về chính sách nạp tiền, vui lòng liên hệ:
                </p>
                <div className="mt-2 text-sm text-gray-300">
                  <p>📧 Email: vie.book.contact@gmail.com</p>
                  <p>📞 Hotline: 0909000001</p>
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nút xem chi tiết */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          📋 Xem chi tiết chính sách nạp tiền
        </button>
      )}
    </div>
  );
};

export default PaymentPolicy;
