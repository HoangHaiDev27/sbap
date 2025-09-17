import React, { useState } from "react";

export default function EmailModal({ owner, onClose }) {
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);

  const handleSend = () => {
    console.log("=== Sending email ===");
    console.log("To:", owner.email);
    console.log("CC:", cc);
    console.log("Subject:", subject);
    console.log("Message:", message);
    console.log("Attachment:", attachment ? attachment.name : "None");
    onClose();
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[66vh] overflow-y-auto p-8"
      >
        <h3 className="text-2xl font-semibold mb-6 text-gray-800">
          Gửi email tới {owner.name} ({owner.email})
        </h3>

        {/* Tiêu đề */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Tiêu đề</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nhập tiêu đề email..."
            className="w-full border rounded-lg p-3 text-gray-800"
          />
        </div>

        {/* Đính kèm tệp */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Đính kèm tệp</label>
          <input
            type="file"
            onChange={(e) =>
              setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)
            }
            className="w-full border rounded-lg p-2 text-gray-800"
          />
          {attachment && (
            <div className="text-sm text-gray-600 mt-1">
              Đã chọn: {attachment.name}
            </div>
          )}
        </div>

        {/* Nội dung email */}
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Nội dung email</label>
          <textarea
            rows="8"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập nội dung email..."
            className="w-full border rounded-lg p-3 text-gray-800"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
