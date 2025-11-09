import { useEffect, useState } from "react";
import { getOwnerBookDetail } from "../../../api/bookApi";

export default function BookOverview({ bookId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getOwnerBookDetail(Number(bookId))
      .then((data) => {
        if (!mounted) return;
        setBook(data);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Không thể tải thông tin sách");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [bookId]);

  if (loading) return <div>Đang tải...</div>;
  if (error || !book) return <div className="text-red-400">{error || "Không tìm thấy sách"}</div>;

  const tags = book.categories || [];
  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  const chaptersCount = chapters.length;
  const audioChaptersCount = chapters.filter(c => c.chapterAudioUrl || c.priceAudio != null || c.audioPrice != null).length;

  const desc = book.description || "—";
  const MAX_LEN = 220;
  const isLong = desc.length > MAX_LEN;
  const shownDesc = expanded || !isLong ? desc : (desc.slice(0, MAX_LEN) + "…");

  return (
    <div className="space-y-6">
      {/* Mô tả sách */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-orange-400">Mô tả sách</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{shownDesc}</p>
        {isLong && (
          <button
            className="mt-2 text-sm text-blue-400 hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>

      {/* Tags */}
      <div>
        <h4 className="font-semibold mb-2">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-200"
            >
              #{tag}
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-xs text-gray-500">Không có</span>
          )}
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div>
        <h4 className="font-semibold mb-2">Thông tin chi tiết</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-200">
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Số chương</p>
            <p className="font-semibold">{chaptersCount} chương</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Ngôn ngữ</p>
            <p className="font-semibold">{book.language || "Tiếng Việt"}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Số chương audio</p>
            <p className="font-semibold">{audioChaptersCount} chương</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Tổng lượt xem</p>
            <p className="font-semibold">{Number(book.totalView || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
