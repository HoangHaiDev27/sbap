import React, { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { submitBookReport } from "../../api/feedbackApi";

export default function ReportBookModal({ 
  isOpen, 
  onClose, 
  bookId, 
  bookTitle 
}) {
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      toast.error("Vui lòng nhập nội dung báo cáo");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitBookReport(bookId, reportText);
      toast.success("📨 Đã gửi báo cáo thành công");
      setReportText("");
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Có lỗi khi gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/30"
        onClick={handleClose}
      ></div>
      <div className="relative bg-gray-800 backdrop-blur-sm p-6 rounded-lg max-w-md w-full shadow-xl z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Báo cáo sách</h2>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-600"
          >
            <RiCloseLine size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Báo cáo về: <span className="text-white font-medium">{bookTitle}</span>
          </p>
        </div>

        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Nhập lý do báo cáo..."
          className="w-full h-32 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 resize-none"
          disabled={isSubmitting}
        />
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={isSubmitting || !reportText.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </>
            ) : (
              "Gửi báo cáo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
