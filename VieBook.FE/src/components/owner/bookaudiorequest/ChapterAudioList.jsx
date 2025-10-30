import { useState, useEffect } from "react";
import { RiPlayFill, RiStopFill, RiDeleteBin6Line, RiEditLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { getChapterAudios, deleteChapterAudio, updateChapterAudiosPrice } from "../../../api/ownerBookApi";
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

export default function ChapterAudioList({ chapterId, onRefreshChapters }) {
  const [existingAudios, setExistingAudios] = useState([]);
  const [loadingAudios, setLoadingAudios] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState("");
  const [audio] = useState(new Audio());
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Lấy danh sách audio đã có của chapter
  useEffect(() => {
    if (chapterId) {
      fetchExistingAudios();
    }
    
    // Cleanup: dừng audio khi chuyển chapter hoặc unmount
    return () => {
      audio.pause();
      setPlayingAudioId(null);
    };
  }, [chapterId]);

  const fetchExistingAudios = async () => {
    try {
      setLoadingAudios(true);
      const response = await getChapterAudios(chapterId);
      if (response.success) {
        setExistingAudios(response.data || []);
        // Set giá từ audio đầu tiên (vì tất cả audio sẽ có cùng giá)
        if (response.data && response.data.length > 0) {
          const firstPrice = response.data[0].priceAudio;
          setPriceValue(firstPrice ? firstPrice.toString() : "");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách audio:", error);
    } finally {
      setLoadingAudios(false);
    }
  };

  // Xóa audio
  const handleDeleteAudio = async (audioId) => {
    if (!confirm("Bạn có chắc muốn xóa audio này?")) return;

    try {
      await deleteChapterAudio(audioId);
      await fetchExistingAudios(); // Làm mới danh sách
      if (onRefreshChapters) onRefreshChapters();
      toast.success("Đã xóa audio thành công");
    } catch (error) {
      console.error("Lỗi khi xóa audio:", error);
      toast.error("Không thể xóa audio");
    }
  };

  // Bắt đầu chỉnh sửa giá
  const handleStartEditPrice = () => {
    setEditingPrice(true);
    // priceValue đã được set trong fetchExistingAudios
  };

  // Lưu giá mới cho tất cả audio của chapter
  const handleSavePrice = async () => {
    const price = parseFloat(priceValue) || 0;

    if (price < 0) {
      toast.error("Giá không được nhỏ hơn 0");
      return;
    }

    try {
      await updateChapterAudiosPrice(chapterId, price);
      await fetchExistingAudios();
      setEditingPrice(false);
      toast.success(`Đã cập nhật giá cho tất cả audio thành ${price.toLocaleString()} xu`);
    } catch (error) {
      console.error("Lỗi khi cập nhật giá:", error);
      toast.error("Không thể cập nhật giá");
    }
  };

  // Hủy chỉnh sửa giá
  const handleCancelEditPrice = () => {
    setEditingPrice(false);
    // Khôi phục lại giá ban đầu
    if (existingAudios.length > 0) {
      const firstPrice = existingAudios[0].priceAudio;
      setPriceValue(firstPrice ? firstPrice.toString() : "");
    }
  };

  // 🔊 Nghe thử giọng đọc demo
  const handlePlaySample = (audioId, url) => {
    if (!url) return;
    try {
      audio.pause();
      audio.src = url;
      audio.currentTime = 0;
      audio.play();
      setPlayingAudioId(audioId);
      
      // Lắng nghe sự kiện kết thúc để reset trạng thái
      audio.onended = () => {
        setPlayingAudioId(null);
      };
    } catch (err) {
      console.error("Không thể phát thử:", err);
      setPlayingAudioId(null);
    }
  };

  // 🛑 Dừng audio
  const handleStopAudio = () => {
    try {
      audio.pause();
      audio.currentTime = 0;
      setPlayingAudioId(null);
    } catch (err) {
      console.error("Không thể dừng:", err);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="font-semibold mb-4">Audio đã có</h2>

      {loadingAudios ? (
        <div className="text-gray-400 text-sm">Đang tải...</div>
      ) : existingAudios.length > 0 ? (
        <div className="space-y-4">
          {/* Hiển thị giá chung cho tất cả audio */}
          <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Giá audio:</span>
              {editingPrice ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || parseFloat(val) >= 0) {
                        setPriceValue(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    className="w-24 px-2 py-1 text-sm bg-slate-600 text-white rounded border border-slate-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-xs text-gray-400">xu</span>
                  <button
                    onClick={handleSavePrice}
                    className="p-1 bg-green-600 rounded hover:bg-green-500 transition"
                    title="Lưu"
                  >
                    <RiCheckLine className="text-white text-sm" />
                  </button>
                  <button
                    onClick={handleCancelEditPrice}
                    className="p-1 bg-gray-600 rounded hover:bg-gray-500 transition"
                    title="Hủy"
                  >
                    <RiCloseLine className="text-white text-sm" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-400">
                    {priceValue && parseFloat(priceValue) > 0 
                      ? `${parseFloat(priceValue).toLocaleString()} xu` 
                      : "Chưa đặt giá"}
                  </span>
                  <button
                    onClick={handleStartEditPrice}
                    className="p-1 bg-blue-600 rounded hover:bg-blue-500 transition"
                    title="Chỉnh sửa giá"
                  >
                    <RiEditLine className="text-white text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách audio */}
          <div className="space-y-2">
            {existingAudios.map((audio) => (
              <div key={audio.audioId} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">
                      {voices.find(v => v.id === audio.voiceName)?.name || audio.voiceName}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({Math.floor((audio.durationSec || 0) / 60)}:{(audio.durationSec || 0) % 60 < 10 ? '0' : ''}{(audio.durationSec || 0) % 60})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {playingAudioId === audio.audioId ? (
                      <button
                        onClick={handleStopAudio}
                        className="p-1 bg-orange-600 rounded hover:bg-orange-500 transition"
                        title="Dừng"
                      >
                        <RiStopFill className="text-white text-sm" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlaySample(audio.audioId, audio.audioLink)}
                        className="p-1 bg-green-600 rounded hover:bg-green-500 transition"
                        title="Nghe"
                      >
                        <RiPlayFill className="text-white text-sm" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAudio(audio.audioId)}
                      className="p-1 bg-red-600 rounded hover:bg-red-500 transition"
                      title="Xóa"
                    >
                      <RiDeleteBin6Line className="text-white text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">Chưa có audio nào</div>
      )}
    </div>
  );
}
