import React from "react";

export default function FeedbackDetailModal({
  feedback,
  onClose,
  onDelete,
  getTypeText,
  getTypeColor,
  getTypeIcon,
  getStatusText,
  getStatusColor,
}) {
  if (!feedback) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose} // click nền để đóng
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()} // chặn click trong modal
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Chi tiết Đánh giá
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer text-gray-700"
          >
            <i className="ri-close-line w-5 h-5 flex items-center justify-center"></i>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img
              className="h-16 w-16 rounded-full object-cover object-top"
              src={feedback.avatar}
              alt={feedback.user}
            />
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {feedback.user}
              </h4>
              <p className="text-gray-600">{feedback.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                    feedback.type
                  )}`}
                >
                  <i
                    className={`${getTypeIcon(
                      feedback.type
                    )} mr-1 w-3 h-3 flex items-center justify-center`}
                  ></i>
                  {getTypeText(feedback.type)}
                </span>
                {feedback.status !== "new" && (
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      feedback.status
                    )}`}
                  >
                    {getStatusText(feedback.status)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {feedback.content}
            </div>
          </div>

          {feedback.bookTitle && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sách liên quan
              </label>
              <div className="text-blue-600 font-medium">
                {feedback.bookTitle}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày gửi
            </label>
            <div className="text-gray-900">{feedback.submitDate}</div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => onDelete(feedback.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-delete-bin-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
              Xóa đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
