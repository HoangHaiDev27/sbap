import { useState } from "react";
import { RiStarFill } from "react-icons/ri";

export default function ReviewItem({ review, onReply }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <img
          src={review.avatarUrl || "https://i.pravatar.cc/40"}
          alt={review.userName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <p className="font-semibold">
            {review.bookTitle}{" "}
            <span className="text-yellow-400 ml-2">
              {Array(review.rating)
                .fill(0)
                .map((_, i) => (
                  <RiStarFill key={i} className="inline" />
                ))}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2">{review.comment}</p>

          {/* Reply */}
          {review.ownerReply ? (
            <div className="mt-2 p-2 bg-slate-700 rounded text-sm">
              <strong className="text-orange-400">Phản hồi: </strong>
              {review.ownerReply}
              {review.ownerReplyAt && (
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(review.ownerReplyAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <>
              {replying ? (
                <div className="mt-3">
                  <textarea
                    rows="3"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Viết phản hồi của bạn..."
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setReplying(false)}
                      className="px-3 py-1 bg-gray-600 rounded"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={async () => {
                        if (replyText.trim() && onReply) {
                          await onReply(review.reviewId, replyText);
                          setReplying(false);
                          setReplyText("");
                        }
                      }}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded"
                    >
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplying(true)}
                  className="mt-3 px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded"
                >
                  Phản hồi
                </button>
              )}
            </>
          )}
        </div>
        <div>
          {review.ownerReply ? (
            <span className="text-green-400 text-sm">Đã phản hồi</span>
          ) : (
            <span className="text-red-400 text-sm">Chưa phản hồi</span>
          )}
        </div>
      </div>
    </div>
  );
}
