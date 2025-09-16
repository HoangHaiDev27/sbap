import { useState } from "react";

const REVIEWS_PER_PAGE = 2;

const allReviews = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    initials: "NVA",
    rating: 5,
    date: "2024-01-15",
    content: "Cuốn sách rất hay và bổ ích. Nội dung sâu sắc, dễ hiểu.",
    reply: "Cảm ơn bạn đã đánh giá! Rất vui khi sách giúp ích được cho bạn.",
  },
  {
    id: 2,
    name: "Trần Thị B",
    initials: "TTB",
    rating: 4,
    date: "2024-01-12",
    content: "Nội dung tốt nhưng có một số phần hơi khó hiểu.",
    reply: null,
  },
  {
    id: 3,
    name: "Lê Văn C",
    initials: "LVC",
    rating: 5,
    date: "2024-01-10",
    content: "Xuất sắc! Đây là một trong những cuốn sách hay nhất tôi từng đọc.",
    reply: "Cảm ơn bạn rất nhiều! Chúc bạn có những trải nghiệm đọc sách tuyệt vời.",
  },
];
// eslint-disable-next-line no-unused-vars
export default function BookReviews({ bookId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);

  const reviewsToShow = allReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Đánh giá từ người đọc</h2>
        <p className="text-sm text-gray-400">
          {allReviews.length} đánh giá
        </p>
      </div>

      {/* Danh sách đánh giá */}
      {reviewsToShow.map((review) => (
        <div key={review.id} className="border-b border-gray-700 pb-5">
          <div className="flex items-start space-x-4">
            {/* Avatar tên viết tắt */}
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-semibold text-sm">
              {review.initials}
            </div>

            {/* Nội dung */}
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-semibold">{review.name}</p>
                <span className="text-sm text-gray-400">{review.date}</span>
              </div>

              <div className="flex text-yellow-400 text-sm mt-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < review.rating ? "★" : "☆"
                )}
              </div>

              <p className="text-sm text-gray-200 mb-3">{review.content}</p>

              {/* Nếu có phản hồi */}
              {review.reply ? (
                <div className="bg-slate-700 px-4 py-2 rounded-lg text-sm text-gray-300">
                  <p className="font-semibold text-orange-400 mb-1">Phản hồi từ tác giả</p>
                  <p>{review.reply}</p>
                </div>
              ) : (
                <>
                  {replyingReviewId === review.id ? (
                    <div className="space-y-2 mt-2">
                      <textarea
                        rows={2}
                        placeholder="Nhập phản hồi..."
                        className="w-full bg-gray-700 p-2 rounded text-sm text-white"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1 text-sm text-gray-300 hover:underline"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            console.log("Đã gửi phản hồi:", replyText);
                            setReplyingReviewId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingReviewId(review.id)}
                      className="text-sm text-blue-400 hover:underline mt-2"
                    >
                      Trả lời đánh giá
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {/* Nút Trước */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded text-sm ${currentPage === 1
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Trước
          </button>

          {/* Các số trang */}
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm ${currentPage === i + 1
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Nút Sau */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm ${currentPage === totalPages
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
