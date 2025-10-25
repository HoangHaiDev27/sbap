import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getChapterById, getChapterAudios } from "../../api/ownerBookApi";
import { RiPlayFill, RiPauseFill } from "react-icons/ri";

export default function ChapterView() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [content, setContent] = useState("");
  const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");
  const [status, setStatus] = useState("draft");
  
  // Audio states
  const [chapterAudios, setChapterAudios] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const voices = [
    { id: "banmai", name: "Nữ miền Bắc - Ban Mai" },
    { id: "thuminh", name: "Nữ miền Bắc - Thu Minh" },
    { id: "giahuy", name: "Nam miền Trung - Gia Huy" },
    { id: "myan", name: "Nữ miền Trung - Mỹ An" },
    { id: "leminh", name: "Nam miền Bắc - Lê Minh" },
    { id: "ngoclam", name: "Nữ miền Trung - Ngọc Lam" },
    { id: "linhsan", name: "Nữ miền Nam - Linh San" },
    { id: "minhquang", name: "Nam miền Nam - Minh Quang" },
  ];

  // Load chương
  useEffect(() => {
    async function fetchChapter() {
      try {
        const data = await getChapterById(chapterId);
        setTitle(data.chapterTitle || "");
        setPrice(data.priceAudio || 0);
        setIsFree(data.priceAudio === 0);
        setBookTitle(data.bookTitle || "Không xác định");
        setStatus(data.status || "Draft");

        if (data.chapterSoftUrl) {
          const res = await fetch(data.chapterSoftUrl);
          const text = await res.text();
          setContent(text);
        }
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

  // Load danh sách audio của chapter
  useEffect(() => {
    async function fetchAudios() {
      try {
        const response = await getChapterAudios(chapterId);
        if (response.success && response.data) {
          setChapterAudios(response.data);
          // Tự động chọn audio đầu tiên nếu có
          if (response.data.length > 0) {
            setSelectedAudio(response.data[0]);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải audio:", err);
      }
    }
    fetchAudios();
  }, [chapterId]);

  // Xử lý play/pause
  const handlePlayPause = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Xử lý khi chọn giọng đọc khác
  const handleSelectAudio = (audio) => {
    // Pause audio hiện tại nếu đang phát
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    setSelectedAudio(audio);
  };

  return (
    <div className="p-6 text-white">
      {/* Thanh trên cùng: tên sách + giá + trạng thái */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-300">
          Sách: <span className="text-orange-400">{bookTitle}</span>
        </h1>
        <div className="flex items-center space-x-4 text-sm">
          {/* Giá */}
          <span className={`px-3 py-1 rounded-lg ${
            isFree ? "bg-yellow-500 text-black font-semibold" : "bg-gray-700 text-white"
          }`}>
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

      {/* Audio player nếu có */}
      {chapterAudios.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Audio chương</h3>
          
          {/* Danh sách giọng đọc */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-3">Chọn giọng đọc:</p>
            <div className="flex flex-wrap gap-2">
              {chapterAudios.map((audio) => (
                <button
                  key={audio.audioId}
                  onClick={() => handleSelectAudio(audio)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedAudio?.audioId === audio.audioId
                      ? "bg-orange-500 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  {voices.find(v => v.id === audio.voiceName)?.name || audio.voiceName}
                </button>
              ))}
            </div>
          </div>

          {/* Audio player */}
          {selectedAudio && (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">
                    {voices.find(v => v.id === selectedAudio.voiceName)?.name || selectedAudio.voiceName}
                  </p>
                  {selectedAudio.durationSec && (
                    <p className="text-xs text-gray-400">
                      Thời lượng: {Math.floor(selectedAudio.durationSec / 60)} phút {selectedAudio.durationSec % 60} giây
                    </p>
                  )}
                </div>
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-full transition"
                >
                  {isPlaying ? (
                    <RiPauseFill className="text-2xl text-white" />
                  ) : (
                    <RiPlayFill className="text-2xl text-white" />
                  )}
                </button>
              </div>
              
              <audio
                ref={(el) => setAudioElement(el)}
                src={selectedAudio.audioLink}
                className="w-full"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          )}

          {chapterAudios.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              Chương này chưa có audio
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
