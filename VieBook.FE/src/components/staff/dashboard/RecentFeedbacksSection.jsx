import { useNavigate } from 'react-router-dom';

export default function RecentFeedbacksSection({ feedbacks }) {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/staff/feedback');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Phản hồi gần đây</h3>
          <button
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{feedback.user}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {feedback.type}
                      </span>
                      <span className="text-xs text-gray-400">{feedback.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{feedback.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Không có phản hồi</p>
          )}
        </div>
      </div>
    </div>
  );
}

