import React, { useState } from "react";

export default function EmailModal({ owner, onClose }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log("Sending email to:", owner.email, "with message:", message);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Gửi email tới {owner.name}
        </h3>
        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập nội dung email..."
          className="w-full border rounded-lg p-3 text-sm text-gray-800"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
