import { useState } from "react";
import { RiPlayFill, RiSendPlaneFill } from "react-icons/ri";

const voices = [
  { id: 1, name: "Giọng nữ 1 - Minh Anh" },
  { id: 2, name: "Giọng nữ 2 - Thu Hà" },
  { id: 3, name: "Giọng nam 1 - Việt Anh" },
  { id: 4, name: "Giọng nam 2 - Hoàng Nam" },
];

export default function VoiceConfig() {
  const [selectedVoice, setSelectedVoice] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(100);

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="font-semibold mb-4">Cấu hình giọng đọc</h2>

      {/* Chọn giọng đọc */}
      <div className="space-y-2 mb-6">
        {voices.map((v) => (
          <label
            key={v.id}
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
                onChange={() => setSelectedVoice(v.id)}
                className="accent-orange-500"
              />
              <span className="font-medium">{v.name}</span>
            </div>
            <button
              type="button"
              className="p-2 bg-green-600 rounded-full hover:bg-green-500 transition"
              title="Nghe thử"
            >
              <RiPlayFill className="text-white" />
            </button>
          </label>
        ))}
      </div>

      {/* Tốc độ, cao độ, âm lượng */}
      <div className="space-y-5">
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
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <label>Cao độ</label>
            <span className="text-orange-400 font-medium">{pitch}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full accent-orange-500"
          />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <label>Âm lượng</label>
            <span className="text-orange-400 font-medium">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      {/* Nút gửi */}
      <button className="mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition">
        <RiSendPlaneFill className="text-lg" />
        Gửi yêu cầu audio
      </button>
    </div>
  );
}
