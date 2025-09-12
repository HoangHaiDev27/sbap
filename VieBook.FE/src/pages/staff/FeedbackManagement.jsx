import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FeedbackDetailModal from "../../components/staff/feedback/FeedbackDetailModal";
import FeedbackDeleteModal from "../../components/staff/feedback/FeedbackDeleteModal";


export default function FeedbackManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const bookIdParam = queryParams.get("bookId");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [bookFilter, setBookFilter] = useState(bookIdParam || null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);


  const frogImg =
    "https://drawcartoonstyle.com/wp-content/uploads/2022/07/10-Add-cute-blush-spots-to-the-frog-to-make-it-a-cute-chibi-frog.jpg";

  const feedbacks = [
    {
      id: 1,
      user: "Nguyễn Minh A",
      email: "nguyen.minh.a@email.com",
      avatar: frogImg,
      type: "compliment",
      title: "Ứng dụng rất tuyệt vời",
      content:
        "Tôi rất thích ứng dụng này. Giao diện đẹp, dễ sử dụng và có rất nhiều sách hay.",
      bookId: 2,
      bookTitle: "Đắc nhân tâm",
      submitDate: "2024-01-22",
      status: "new",
    },
    {
      id: 2,
      user: "Trần Thị B",
      email: "tran.thi.b@email.com",
      avatar: frogImg,
      type: "suggestion",
      title: "Đề xuất cải thiện tính năng tìm kiếm",
      content:
        "Tôi muốn đề xuất cải thiện tính năng tìm kiếm. Hiện tại khi tìm kiếm theo tác giả thì chưa chính xác.",
      bookId: 2,
      bookTitle: "Đắc nhân tâm",
      submitDate: "2024-01-21",
      status: "reviewed",
    },
    {
      id: 3,
      user: "Lê Văn C",
      email: "levanc@email.com",
      avatar: frogImg,
      type: "bug_report",
      title: "Lỗi không tải được sách",
      content:
        "Khi tôi nhấn tải sách về thì bị lỗi mạng, dù internet của tôi vẫn ổn định.",
      bookId: 1,
      bookTitle: "Sapiens: Lược sử loài người",
      submitDate: "2024-01-20",
      status: "new",
    },
    {
      id: 4,
      user: "Phạm Thị D",
      email: "phamd@email.com",
      avatar: frogImg,
      type: "compliment",
      title: "Dịch vụ hỗ trợ khách hàng rất tốt",
      content:
        "Tôi đã liên hệ hỗ trợ và được phản hồi rất nhanh, nhân viên thân thiện và giải quyết vấn đề hiệu quả.",
      bookId: 3,
      bookTitle: "Atomic Habits",
      submitDate: "2024-01-18",
      status: "reviewed",
    },
    {
      id: 5,
      user: "Ngô Văn E",
      email: "ngovane@email.com",
      avatar: frogImg,
      type: "suggestion",
      title: "Thêm chế độ đọc ban đêm",
      content:
        "Mình mong ứng dụng có chế độ Dark Mode để đọc sách vào buổi tối đỡ mỏi mắt hơn.",
      bookId: 4,
      bookTitle: "Thinking, Fast and Slow",
      submitDate: "2024-01-15",
      status: "new",
    },
  ];

  useEffect(() => {
    setBookFilter(bookIdParam);
  }, [bookIdParam]);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || feedback.type === typeFilter;
    const matchesBook =
      !bookFilter ||
      (feedback.bookId != null &&
        String(feedback.bookId) === String(bookFilter));

    return matchesSearch && matchesType && matchesBook;
  });

  const total = filteredFeedbacks.length;
  const compliments = filteredFeedbacks.filter((f) => f.type === "compliment").length;
  const suggestions = filteredFeedbacks.filter((f) => f.type === "suggestion").length;
  const bugs = filteredFeedbacks.filter((f) => f.type === "bug_report").length;

  const handleClearBookFilter = () => {
    setBookFilter(null);
    navigate("/staff/feedback");
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setDeleteModalOpen(true);
  };

  const confirmDelete = (id) => {
    console.log("Deleting feedback:", id);
    setDeleteModalOpen(false);
    setFeedbackToDelete(null);
  };


  const handleMarkAsReviewed = (id) => {
    console.log("Marking feedback as reviewed:", id);
  };

  const getTypeText = (type) => {
    switch (type) {
      case "compliment":
        return "Khen ngợi";
      case "suggestion":
        return "Góp ý";
      case "bug_report":
        return "Báo lỗi";
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "compliment":
        return "bg-green-100 text-green-800";
      case "suggestion":
        return "bg-blue-100 text-blue-800";
      case "bug_report":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "Mới";
      case "reviewed":
        return "Đã xem";
      default:
        return status;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "compliment":
        return "ri-thumb-up-line";
      case "suggestion":
        return "ri-lightbulb-line";
      case "bug_report":
        return "ri-bug-line";
      default:
        return "ri-message-2-line";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-25">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Feedback</h2>
      <p className="text-gray-600 mb-6">Xem và quản lý phản hồi từ người dùng</p>

      {/* Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-indigo-600">{total}</div>
          <div className="text-gray-600 text-sm">Tổng feedback (đã lọc)</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{compliments}</div>
          <div className="text-gray-600 text-sm">Khen ngợi</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{suggestions}</div>
          <div className="text-gray-600 text-sm">Góp ý</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm text-center border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{bugs}</div>
          <div className="text-gray-600 text-sm">Báo lỗi</div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Tìm kiếm feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 text-gray-900 placeholder-gray-500"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
            >
              <option value="all">Tất cả loại</option>
              <option value="compliment">Khen ngợi</option>
              <option value="suggestion">Góp ý</option>
              <option value="bug_report">Báo lỗi</option>
            </select>

            {bookFilter && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                  Đang lọc theo sách ID: <b>{bookFilter}</b>
                </span>
                <button
                  onClick={handleClearBookFilter}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                >
                  Bỏ lọc sách
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách feedback */}
        <div className="divide-y divide-gray-200">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover object-top"
                    src={feedback.avatar}
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {feedback.user}
                        </h4>
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            feedback.status
                          )}`}
                        >
                          {getStatusText(feedback.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {feedback.submitDate}
                      </div>
                    </div>
                    <h5 className="text-md font-medium text-gray-900 mb-2">
                      {feedback.title}
                    </h5>
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {feedback.content}
                    </p>
                    {feedback.bookTitle && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">
                          Sách liên quan:{" "}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {feedback.bookTitle}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(feedback)}
                        className="text-blue-600 hover:text-blue-700 text-lg cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      {feedback.status === "new" && (
                        <button
                          onClick={() => handleMarkAsReviewed(feedback.id)}
                          className="text-green-600 hover:text-green-700 text-lg cursor-pointer"
                          title="Đánh dấu đã xem"
                        >
                          <i className="ri-check-line"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(feedback)}
                        className="text-red-600 hover:text-red-700 text-lg cursor-pointer"
                        title="Xóa feedback"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>

                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-gray-500 text-center">Không có feedback nào</p>
          )}
        </div>
      </div>

      {/* Popup chi tiết */}
      {showModal && selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setShowModal(false)}
          onMarkAsReviewed={handleMarkAsReviewed}
          onDelete={handleDelete}
          getTypeText={getTypeText}
          getTypeColor={getTypeColor}
          getTypeIcon={getTypeIcon}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />
      )}

      {deleteModalOpen && feedbackToDelete && (
        <FeedbackDeleteModal
          feedback={feedbackToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      )}

    </div>
  );
}
