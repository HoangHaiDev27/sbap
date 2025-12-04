import React, { useState } from "react";
import toast from "react-hot-toast";
import { sendEmailToBookOwner } from "../../../api/userManagementApi";

export default function EmailModal({ owner, onClose }) {
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Email templates
  const emailTemplates = {
    welcome: {
      subject: "Chào mừng bạn đến với VieBook!",
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">📚 VieBook</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Nền tảng sách điện tử hàng đầu</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${owner.fullName || 'Book Owner'}!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Chào mừng bạn đến với cộng đồng VieBook! Chúng tôi rất vui khi bạn tham gia với tư cách là <strong>Book Owner</strong>.
            </p>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">🎯 Với tài khoản Book Owner, bạn có thể:</h3>
              <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>📖 Đăng tải và quản lý sách của mình</li>
                <li>📊 Theo dõi thống kê và doanh thu</li>
                <li>💬 Tương tác với độc giả</li>
                <li>🎁 Tham gia các chương trình khuyến mãi đặc biệt</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0;">
                Trân trọng,<br>
                <strong style="color: #2563eb;">Đội ngũ VieBook</strong>
              </p>
            </div>
          </div>
        </div>
      `
    },
    warning: {
      subject: "Thông báo quan trọng về tài khoản của bạn",
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">⚠️ VieBook</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Thông báo quan trọng</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${owner.fullName || 'Book Owner'}!</h2>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
              <p style="color: #374151; line-height: 1.6; margin: 0;">
Chúng tôi muốn thông báo với bạn về một số vấn đề liên quan đến tài khoản của bạn trên VieBook.
              </p>
            </div>

            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
Vui lòng kiểm tra và cập nhật thông tin tài khoản để đảm bảo hoạt động bình thường.
            </p>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-weight: 500;">
                🔔 Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi ngay lập tức.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0;">
                Trân trọng,<br>
                <strong style="color: #dc2626;">Đội ngũ VieBook</strong>
              </p>
            </div>
          </div>
        </div>
      `
    },
    promotion: {
      subject: "Chương trình khuyến mãi đặc biệt cho Book Owner",
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0; font-size: 28px;">🎉 VieBook</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Chương trình khuyến mãi đặc biệt</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Xin chào ${owner.fullName || 'Book Owner'}!</h2>
            
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 24px;">🎁 Tin vui dành cho bạn!</h3>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">
                VieBook đang triển khai chương trình khuyến mãi đặc biệt dành riêng cho các Book Owner.
              </p>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0; margin-bottom: 15px;">✨ Chi tiết chương trình:</h3>
              <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>💰 <strong>Giảm phí hoa hồng xuống còn 5%</strong></li>
                <li>📈 <strong>Tăng hiển thị sách lên 200%</strong></li>
                <li>📢 <strong>Hỗ trợ marketing miễn phí</strong></li>
                <li>⚡ <strong>Ưu tiên xử lý yêu cầu</strong></li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #92400e; margin: 0; font-weight: 500;">
                📅 Chương trình có hiệu lực từ ngày <strong>1/1/2024</strong> đến <strong>31/12/2024</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #374151; line-height: 1.6; font-size: 18px; font-weight: 500;">
                🚀 Hãy nhanh tay tham gia để không bỏ lỡ cơ hội tuyệt vời này!
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; margin: 0;">
                Trân trọng,<br>
                <strong style="color: #059669;">Đội ngũ VieBook</strong>
              </p>
            </div>
          </div>
        </div>
      `
    }
  };

  // Function to convert plain text to HTML
  const convertTextToHtml = (text) => {
    if (!text) return '';
    
    // Convert line breaks to <br> tags
    let html = text.replace(/\n/g, '<br>');
    
    // Convert bullet points to HTML list
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in <ul> tags
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
      return `<ul style="margin: 10px 0; padding-left: 20px;">${match}</ul>`;
    });
    
    // Wrap in basic HTML structure
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="color: #374151; line-height: 1.6;">
            ${html}
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
            <p style="color: #6b7280; margin: 0;">
              Trân trọng,<br>
              <strong style="color: #2563eb;">Đội ngũ VieBook</strong>
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey && emailTemplates[templateKey]) {
      setSubject(emailTemplates[templateKey].subject);
      setMessage(emailTemplates[templateKey].message);
    }
  };

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề email");
      return;
    }
    if (!message.trim()) {
      toast.error("Vui lòng nhập nội dung email");
      return;
    }

    setIsSending(true);
    try {
      // Convert message to HTML if it's not already HTML (from templates)
      let htmlMessage = message.trim();
      
      // If message doesn't contain HTML tags and is not from a template, convert to HTML
      if (!htmlMessage.includes('<div') && !htmlMessage.includes('<p') && !htmlMessage.includes('<h')) {
        htmlMessage = convertTextToHtml(htmlMessage);
      }

      const emailData = {
        to: owner.email,
        subject: subject.trim(),
        message: htmlMessage,
        cc: cc.trim() || undefined,
        attachment: attachment || undefined
      };

      await sendEmailToBookOwner(emailData);
      toast.success(`Email đã được gửi thành công đến ${owner.fullName || owner.email}`);
      onClose();
    } catch (error) {
      toast.error(`Lỗi khi gửi email: ${error.message}`);
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  // ✅ Đóng popup khi click ra ngoài khung
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">
            📧 Gửi email tới Book Owner
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Thông tin người nhận */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            {owner.avatarUrl ? (
              <img
                src={owner.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                <i className="ri-user-line text-gray-600 text-xl"></i>
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900">
                {owner.fullName || 'Chưa cập nhật'}
              </div>
              <div className="text-gray-600">{owner.email}</div>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Chọn mẫu email (tùy chọn)</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleTemplateChange('welcome')}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedTemplate === 'welcome' 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">🎉 Chào mừng</div>
              <div className="text-sm text-gray-600">Email chào mừng Book Owner mới</div>
            </button>
            <button
              onClick={() => handleTemplateChange('warning')}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedTemplate === 'warning' 
                  ? 'border-orange-500 bg-orange-50 text-orange-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">⚠️ Cảnh báo</div>
              <div className="text-sm text-gray-600">Thông báo quan trọng về tài khoản</div>
            </button>
            <button
              onClick={() => handleTemplateChange('promotion')}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedTemplate === 'promotion' 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">🎁 Khuyến mãi</div>
              <div className="text-sm text-gray-600">Chương trình ưu đãi đặc biệt</div>
            </button>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nhập tiêu đề email..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>

        {/* CC */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">CC (tùy chọn)</label>
          <input
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Nhập email CC..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>

        {/* Đính kèm tệp */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Đính kèm tệp (tùy chọn)</label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              onChange={(e) =>
                setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)
              }
              className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            {attachment && (
              <button
                onClick={() => setAttachment(null)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                disabled={isSending}
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
          {attachment && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-sm text-green-700">
                <i className="ri-attachment-line mr-2"></i>
                Đã chọn: {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        {/* Nội dung email */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Nội dung email <span className="text-red-500">*</span>
          </label>
          <textarea
            rows="10"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung email..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isSending}
          />
          <div className="text-sm text-gray-500 mt-1">
            {message.length} ký tự
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!subject.trim() || !message.trim()}
            className="px-6 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <i className="ri-eye-line mr-2"></i>
            Xem trước
          </button>
          
          <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={isSending}
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSending ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line mr-2"></i>
                Gửi email
              </>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                📧 Xem trước email
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Tiêu đề:</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{subject}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Nội dung:</h4>
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ 
                    __html: message.includes('<div') ? message : convertTextToHtml(message) 
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
