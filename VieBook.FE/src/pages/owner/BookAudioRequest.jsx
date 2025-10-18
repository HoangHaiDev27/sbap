import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import ChapterSelector from "../../components/owner/bookaudiorequest/ChapterSelector";
import VoiceConfig from "../../components/owner/bookaudiorequest/VoiceConfig";
import TTSQueue from "../../components/owner/bookaudiorequest/TTSQueue";
import { getChaptersByBookId } from "../../api/ownerBookApi";

export default function BookAudioRequest() {
  const { id } = useParams();

  const [bookTitle, setBookTitle] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChaptersByBookId(id);
      if (data && data.length > 0) {
        setBookTitle(data[0].bookTitle);
        setChapters(
          data.map((ch) => ({
            id: ch.chapterId,
            title: ch.chapterTitle,
            duration: ch.durationSec,
            hasAudio: !!ch.chapterAudioUrl,
          }))
        );
      } else {
        setChapters([]);
      }
    } catch (err) {
      console.error("Lỗi tải chapters:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleStartQueue = (chapterId) => {
    const chapterTitle = chapters.find((c) => c.id === chapterId)?.title;
    setQueue((prev) => [
      ...prev,
      { id: chapterId, chapter: chapterTitle, status: "Đang xử lý", progress: 0 },
    ]);
  };

  const handleCompleteQueue = (chapterId, success = true) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === chapterId
          ? {
            ...item,
            status: success ? "Hoàn thành" : "Lỗi",
            progress: success ? 100 : 0,
          }
          : item
      )
    );

    fetchChapters();
  };

  return (
    <div className="p-6 text-white">
      <Link
        to="/owner/books"
        className="inline-block px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white mb-4"
      >
        ← Quay lại sách
      </Link>

      <h1 className="text-2xl font-bold mb-2">Yêu cầu Audio (TTS)</h1>
      <p className="text-gray-400 mb-6">
        Tạo audio cho sách:{" "}
        <span className="text-orange-400 font-semibold">
          {bookTitle || "Đang tải..."}
        </span>
      </p>

      {loading ? (
        <div className="text-gray-400 italic">Đang tải danh sách chương...</div>
      ) : chapters.length === 0 ? (
        <div className="text-gray-400 italic">
          Chưa có chương nào trong sách này.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <ChapterSelector
              chapters={chapters}
              selected={selectedChapter}
              setSelected={setSelectedChapter}
            />
            <VoiceConfig
              chapterId={selectedChapter}
              onStartQueue={handleStartQueue}
              onCompleteQueue={handleCompleteQueue}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <TTSQueue queue={queue} />
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="font-semibold mb-3">Lưu ý về TTS</h2>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Thời gian xử lý: 5–15 phút / chương tùy độ dài.</li>
                <li>Audio được phát trực tuyến, không tải xuống.</li>
                <li>Chất lượng: MP3 128kbps.</li>
                <li>Giọng đọc sử dụng dịch vụ FPT.AI.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
