import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import ChapterSelector from "../../components/owner/bookaudiorequest/ChapterSelector";
import VoiceConfig from "../../components/owner/bookaudiorequest/VoiceConfig";
import TTSQueue from "../../components/owner/bookaudiorequest/TTSQueue";

export default function BookAudioRequest() {
  const { id } = useParams();

  // Demo tên sách (tạm hardcode, sau này có thể fetch theo id)
  const bookTitle = "Triết học cuộc sống";

  // Demo chương sách
  const chapters = [
  { id: 1, title: "Chương 1: Khởi đầu cuộc hành trình", words: 2500, duration: 14 },
  { id: 2, title: "Chương 2: Gặp gỡ những người bạn mới", words: 3200, duration: 18 },
  { id: 3, title: "Chương 3: Thách thức đầu tiên", words: 7800, duration: 36 },
  { id: 4, title: "Chương 4: Phát hiện điều bí ẩn", words: 3500, duration: 20 },
  { id: 5, title: "Chương 5: Bước vào khu rừng tối", words: 4200, duration: 22 },
  { id: 6, title: "Chương 6: Đêm của những tiếng thì thầm", words: 5000, duration: 27 },
  { id: 7, title: "Chương 7: Ký ức bị lãng quên", words: 3100, duration: 17 },
  { id: 8, title: "Chương 8: Đồng minh trong bóng tối", words: 4600, duration: 24 },
  { id: 9, title: "Chương 9: Trận chiến nơi vách núi", words: 7200, duration: 34 },
  { id: 10, title: "Chương 10: Bí mật trong ngôi đền cổ", words: 5400, duration: 28 },
  { id: 11, title: "Chương 11: Kẻ phản bội lộ diện", words: 6100, duration: 31 },
  { id: 12, title: "Chương 12: Hành trình vượt sa mạc lửa", words: 6800, duration: 33 },
  { id: 13, title: "Chương 13: Ánh sáng nơi tận cùng", words: 3900, duration: 21 },
  { id: 14, title: "Chương 14: Đối mặt định mệnh", words: 8000, duration: 38 },
];

  // Demo queue
  const queue = [
    { id: 1, chapter: "Chương 1: Khởi đầu cuộc hành trình", status: "Hoàn thành", duration: "15:30" },
    { id: 2, chapter: "Chương 2: Gặp gỡ những người bạn mới", status: "Đang xử lý", progress: 65 },
    { id: 3, chapter: "Chương 3: Thách thức đầu tiên", status: "Chờ xử lý" },
  ];

  const [selectedChapters, setSelectedChapters] = useState([]);

  return (
    <div className="p-6 text-white">
      <Link to="/owner/books" className="text-blue-400 hover:underline block mb-4">
        ← Quay lại sách
      </Link>

      {/* Header */}
      <h1 className="text-2xl font-bold">Yêu cầu Audio (TTS)</h1>
      <p className="text-gray-400 mb-6">Tạo audio cho sách: <span className="text-orange-400">{bookTitle}</span></p>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Trái (5/10) */}
        <div className="lg:col-span-5 space-y-6">
          <ChapterSelector
            chapters={chapters}
            selected={selectedChapters}
            setSelected={setSelectedChapters}
          />
          <VoiceConfig />
        </div>

        {/* Phải (5/10) */}
        <div className="lg:col-span-5 space-y-6">
          <TTSQueue queue={queue} />
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="font-semibold mb-3">Lưu ý về TTS</h2>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              <li>Thời gian xử lý: 5–15 phút / chương tùy độ dài</li>
              <li>Chỉ hỗ trợ stream online, không tải về</li>
              <li>Chất lượng audio: 128kbps MP3</li>
              <li>Có thể điều chỉnh cấu hình sau khi hoàn thành</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
