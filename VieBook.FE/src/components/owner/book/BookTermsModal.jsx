import React from "react";
import { RiCloseLine, RiCheckLine } from "react-icons/ri";

export default function BookTermsModal({ show, onAccept, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Điều khoản đăng tải sách</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <RiCloseLine size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                1. Quyền sở hữu nội dung
              </h3>
              <p className="text-sm">
                Bạn cam kết rằng bạn sở hữu hoặc có quyền hợp pháp để đăng tải nội dung sách này.
                Mọi vi phạm bản quyền sẽ do bạn chịu trách nhiệm.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                2. Nội dung phù hợp
              </h3>
              <p className="text-sm">
                Nội dung sách không được chứa các yếu tố bạo lực, khiêu dâm, phân biệt chủng tộc,
                hoặc vi phạm pháp luật Việt Nam.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                3. Thông tin chính xác
              </h3>
              <p className="text-sm">
                Bạn cam kết cung cấp thông tin chính xác về sách, bao gồm tiêu đề, tác giả, mô tả và thể loại.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                4. Giấy chứng nhận (đối với Người bán)
              </h3>
              <p className="text-sm">
                Nếu bạn là người bán (không phải tác giả), bạn cần cung cấp giấy chứng nhận bản quyền
                hoặc giấy phép phân phối hợp pháp.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                5. Quy trình kiểm duyệt
              </h3>
              <p className="text-sm">
                Sách của bạn sẽ được kiểm duyệt trước khi xuất bản. Chúng tôi có quyền từ chối hoặc
                xóa bỏ nội dung không phù hợp mà không cần thông báo trước.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                6. Trách nhiệm pháp lý
              </h3>
              <p className="text-sm">
                Bạn chịu hoàn toàn trách nhiệm pháp lý về nội dung đăng tải. VieBook không chịu
                trách nhiệm về các tranh chấp bản quyền phát sinh.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition"
          >
            Hủy
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition flex items-center justify-center gap-2"
          >
            <RiCheckLine size={20} />
            Tôi đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}

