import {
  RiAddLine,
  RiBook2Line,
  RiCheckLine,
  RiGiftLine,
  RiDraftLine,
  RiEyeLine,
} from "react-icons/ri";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getChaptersByBookId, deleteChapter, removeOldBookImage } from "../../api/ownerBookApi";

export default function OwnerChapters() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");
  const [chapterToDelete, setChapterToDelete] = useState(null);

  useEffect(() => {
    async function fetchChapters() {
      try {
        const data = await getChaptersByBookId(bookId);
        setChapters(data);
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
  }, [bookId]);

  const handleDeleteConfirm = async () => {
    if (!chapterToDelete) return;

    // lấy chapter cần xóa
    const chapter = chapters.find((ch) => ch.chapterId === chapterToDelete);

    try {
      // Nếu có file audio/url => xóa Cloudinary trước
      if (chapter?.chapterAudioUrl) {
        await removeOldBookImage(chapter.chapterAudioUrl);
      }

      // Xóa trong DB
      await deleteChapter(chapterToDelete);

      setChapters(chapters.filter((ch) => ch.chapterId !== chapterToDelete));

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Xóa chapter thành công" },
        })
      );
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Xóa chapter thất bại" },
        })
      );
    } finally {
      setChapterToDelete(null); // đóng popup
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) return <p className="p-6 text-white">Loading chapters...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Chương</h1>
          <p className="text-gray-400">
            Truyện: {bookTitle}
          </p>
        </div>

        <Link
          to={`/owner/books/${bookId}/chapters/new`}
          state={{ bookTitle }}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <RiAddLine className="mr-2" /> Thêm chương mới
        </Link>


      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiBook2Line size={28} className="text-blue-400" />
          <div>
            <p className="text-xl font-bold">{chapters.length}</p>
            <p className="text-sm text-gray-400">Tổng chương</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiCheckLine size={28} className="text-green-400" />
          <div>
            <p className="text-xl font-bold">
              {chapters.filter((ch) => ch.priceAudio > 0).length}
            </p>
            <p className="text-sm text-gray-400">Đã xuất bản</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiGiftLine size={28} className="text-yellow-400" />
          <div>
            <p className="text-xl font-bold">
              {chapters.filter((ch) => ch.priceAudio === 0).length}
            </p>
            <p className="text-sm text-gray-400">Chương miễn phí</p>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiDraftLine size={28} className="text-purple-400" />
          <div>
            <p className="text-xl font-bold">
              {chapters.filter((ch) => ch.priceAudio > 0 && !ch.uploadedAt).length}
            </p>
            <p className="text-sm text-gray-400">Nháp</p>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách chương</h2>
        <div className="space-y-3">
          {chapters.map((ch, index) => {
            const isFree = ch.priceAudio === 0;
            const hasAudio = !!ch.chapterAudioUrl;

            return (
              <div
                key={ch.chapterId}
                className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-1 bg-orange-500 rounded-full text-xs font-bold text-white">
                    Chương {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{ch.chapterTitle}</p>
                    <p className="text-xs text-gray-400">
                      {ch.totalPage || 0} từ • {isFree ? "Miễn phí" : "Đã xuất bản"}{" "}
                      {isFree && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black rounded text-xs">
                          Miễn phí
                        </span>
                      )}
                      {hasAudio && (
                        <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded text-xs">
                          Audio
                        </span>
                      )}
                      {hasAudio && (
                        <span className="ml-2 text-xs text-gray-300">
                          {formatDuration(ch.durationSec)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!isFree && (
                    <span className="text-orange-400 font-semibold">
                      {ch.priceAudio.toLocaleString()} xu
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {new Date(ch.uploadedAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Link
                      to={`/owner/books/${bookId}/chapters/edit/${ch.chapterId}`}
                      state={{ bookTitle: chapters[0]?.bookTitle }}
                      className="px-2 py-1 min-w-[50px] text-center bg-green-500 rounded text-xs text-white hover:bg-green-600"
                    >
                      Sửa
                    </Link>
                    <Link
                      to={`/owner/books/${bookId}/chapters/view/${ch.chapterId}`}
                      className="px-2 py-1 min-w-[50px] text-center bg-purple-500 rounded text-xs text-white hover:bg-purple-600"
                    >
                      Xem
                    </Link>
                    <button
                      onClick={() => setChapterToDelete(ch.chapterId)}
                      className="px-2 py-1 min-w-[50px] text-center bg-red-500 rounded text-xs text-white hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Popup confirm */}
      {chapterToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6 text-gray-300">Bạn có chắc chắn muốn xóa chương này?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setChapterToDelete(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
