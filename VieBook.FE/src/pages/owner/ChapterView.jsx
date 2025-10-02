import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChapterById } from "../../api/ownerBookApi";

export default function ChapterView() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [content, setContent] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(null);
  const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");
  const [status, setStatus] = useState("draft");

  // Load chương
  useEffect(() => {
    async function fetchChapter() {
      try {
        const data = await getChapterById(chapterId);
        setTitle(data.chapterTitle || "");
        setPrice(data.priceAudio || 0);
        setIsFree(data.priceAudio === 0);
        setBookTitle(data.bookTitle || "Không xác định");

        // 👇 lấy trực tiếp từ API
        setStatus(data.status || "Draft");

        if (data.chapterSoftUrl) {
          const res = await fetch(data.chapterSoftUrl);
          const text = await res.text();
          setContent(text);
        }

        setAudioUrl(data.chapterAudioUrl || null);
        setDuration(data.durationSec || null);
      } catch (err) {
        console.error("Lỗi khi tải chương:", err);
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { type: "error", message: "Không tải được chương" },
          })
        );
        navigate(`/owner/books/${bookId}/chapters`, { state: { bookTitle } });
      }
    }
    fetchChapter();
  }, [chapterId, bookId, navigate]);

  return (
    <div className="p-6 text-white">
      {/* Thanh trên cùng: tên sách + giá + trạng thái */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-300">
          Sách: <span className="text-orange-400">{bookTitle}</span>
        </h1>
        <div className="flex items-center space-x-4 text-sm">
          {/* Giá */}
          <span className="px-3 py-1 rounded-lg bg-gray-700">
            {isFree ? "Miễn phí" : `${price} xu`}
          </span>
          {/* Trạng thái */}
          <span
            className={`px-3 py-1 rounded-lg ${status === "Active"
                ? "bg-green-600 text-white"
                : status === "InActive"
                  ? "bg-red-600 text-white"
                  : "bg-purple-600 text-white"
              }`}
          >
            {status === "Active"
              ? "Phát hành"
              : status === "InActive"
                ? "Tạm dừng"
                : "Bản nháp"}
          </span>
        </div>
      </div>

      {/* Tiêu đề chương */}
      <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>

      {/* Audio nếu có */}
      {audioUrl && (
        <div className="flex flex-col items-center mb-6">
          <audio controls src={audioUrl} className="w-full max-w-2xl" />
          {duration && (
            <p className="text-xs text-gray-400 mt-1">
              Thời lượng: {Math.floor(duration / 60)} phút {duration % 60} giây
            </p>
          )}
        </div>
      )}

      {/* Nội dung chương */}
      <div className="bg-slate-800 p-6 rounded-lg max-h-[600px] overflow-y-auto leading-relaxed text-lg">
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>

      {/* Nút quay lại */}
      <div className="flex justify-end mt-6">
        <button
          onClick={() =>
            navigate(`/owner/books/${bookId}/chapters`, {
              state: { bookTitle },
            })
          }
          className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
