import { useState } from "react";
import { RiPlayFill, RiSendPlaneFill } from "react-icons/ri";
import { generateChapterAudio } from "../../../api/ownerBookApi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import toast from "react-hot-toast";

const voices = [
  { id: "banmai", name: "Nữ miền Bắc - Ban Mai", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617392/banmai_schowu.mp3" },
  { id: "thuminh", name: "Nữ miền Bắc - Thu Minh", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617394/thuminh_rehlbf.mp3" },
  { id: "giahuy", name: "Nam miền Trung - Gia Huy", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617393/giahuy_xef1ty.mp3" },
  { id: "myan", name: "Nữ miền Trung - Mỹ An", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617393/myan_cfos7c.mp3" },
  { id: "leminh", name: "Nam miền Bắc - Lê Minh", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617393/leminh_svbetc.mp3" },
  { id: "ngoclam", name: "Nữ miền Trung - Ngọc Lam", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617393/ngoclam_bhr4r0.mp3" },
  { id: "linhsan", name: "Nữ miền Nam - Linh San", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617393/linhsan_lptlnh.mp3" },
  { id: "minhquang", name: "Nam miền Nam - Minh Quang", sampleUrl: "https://res.cloudinary.com/dwduk4vjl/video/upload/v1760617392/minhquang_pnlvkb.mp3" },
];

export default function VoiceConfig({ chapterId, onStartQueue, onCompleteQueue, onRefreshChapters }) {
  const [selectedVoice, setSelectedVoice] = useState("banmai");
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [audio] = useState(new Audio());
  const { userId } = useCurrentUser();

  // 🔊 Nghe thử giọng đọc demo
  const handlePlaySample = (url) => {
    if (!url) return;
    try {
      audio.pause();
      audio.src = url;
      audio.currentTime = 0;
      audio.play();
    } catch (err) {
      console.error("Không thể phát thử:", err);
    }
  };

  // 🚀 Gửi yêu cầu tạo audio
  const handleGenerateAudio = async () => {
    if (!chapterId) return;
    
    if (!userId) {
      toast.error("Không tìm thấy thông tin người dùng");
      return;
    }
    
    setLoading(true);

    // Thông báo bắt đầu xử lý cho hàng đợi
    if (onStartQueue) onStartQueue(chapterId);

    try {
      const result = await generateChapterAudio(chapterId, selectedVoice, speed, userId);
      console.log("✅ Audio tạo xong:", result);

      // Thông báo hoàn tất
      if (onCompleteQueue) onCompleteQueue(chapterId);

      // Làm mới danh sách chương (để hiện "Đã có audio")
      if (onRefreshChapters) onRefreshChapters();
      
      toast.success(`Đã tạo audio thành công với giọng ${voices.find(v => v.id === selectedVoice)?.name}. Đã trừ ${result.conversionsDeducted || 1} lượt chuyển đổi.`);

    } catch (err) {
      console.error("❌ Lỗi khi tạo audio:", err);
      if (onCompleteQueue) onCompleteQueue(chapterId, false);
      toast.error(err.message || "Không thể tạo audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="font-semibold mb-4">Cấu hình giọng đọc (FPT.AI)</h2>

      {/* Giọng đọc */}
      <div className="space-y-2 mb-6">
        {voices.map((v) => (
          <label
            key={v.id}
            onClick={() => setSelectedVoice(v.id)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
              selectedVoice === v.id
                ? "bg-slate-700 border-orange-500"
                : "bg-slate-900 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="voice"
                checked={selectedVoice === v.id}
                readOnly
                className="accent-orange-500"
              />
              <span className="font-medium">{v.name}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePlaySample(v.sampleUrl);
              }}
              className="p-2 bg-green-600 rounded-full hover:bg-green-500 transition"
              title="Nghe thử"
            >
              <RiPlayFill className="text-white" />
            </button>
          </label>
        ))}
      </div>

      {/* Tốc độ */}
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <label>Tốc độ đọc</label>
          <span className="text-orange-400 font-medium">{speed}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>

      {/* Nút gửi */}
      <button
        onClick={handleGenerateAudio}
        disabled={!chapterId || loading}
        className={`mt-8 w-full text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition
          ${!chapterId || loading
            ? "bg-gray-600 cursor-not-allowed opacity-60"
            : "bg-orange-500 hover:bg-orange-600"
          }`}
      >
        <RiSendPlaneFill className="text-lg" />
        {loading
          ? "Đang tạo audio..."
          : !chapterId
            ? "Chọn chương để tạo Audio"
            : "Gửi yêu cầu tạo Audio"}
      </button>
    </div>
  );
}
