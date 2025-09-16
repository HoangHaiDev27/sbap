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
      <h2 className="font-semibold mb-3">Cấu hình giọng đọc</h2>

      {/* Chọn giọng đọc */}
      <div className="space-y-2 mb-4">
        {voices.map((v) => (
          <label
            key={v.id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              selectedVoice === v.id ? "bg-slate-700" : "bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="voice"
                checked={selectedVoice === v.id}
                onChange={() => setSelectedVoice(v.id)}
              />
              <span>{v.name}</span>
            </div>
            <button className="p-1 bg-green-600 rounded hover:bg-green-500">
              <RiPlayFill />
            </button>
          </label>
        ))}
      </div>

      {/* Tốc độ, cao độ, âm lượng */}
      <div className="space-y-4">
        <div>
          <label className="text-sm">Tốc độ đọc: {speed}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm">Cao độ: {pitch}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="text-sm">Âm lượng: {volume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Nút gửi */}
      <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded flex items-center justify-center gap-2">
        <RiSendPlaneFill />
        Gửi yêu cầu audio
      </button>
    </div>
  );
}
