import { RiCheckLine, RiLoader4Line, RiTimeLine } from "react-icons/ri";

export default function TTSQueue({ queue }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="font-semibold mb-4">Hàng đợi TTS</h2>

      <div className="space-y-3">
        {queue.map((item) => {
          const isDone = item.status === "Hoàn thành";
          const isProcessing = item.status === "Đang xử lý";
          const isPending = item.status === "Chờ xử lý";

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition ${
                isDone
                  ? "bg-slate-700 border-green-500/40"
                  : isProcessing
                  ? "bg-slate-700 border-blue-500/40"
                  : "bg-slate-700 border-yellow-500/40"
              }`}
            >
              {/* Tiêu đề + trạng thái */}
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium">{item.chapter}</p>
                {isDone && (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <RiCheckLine /> {item.status}
                  </span>
                )}
                {isProcessing && (
                  <span className="flex items-center gap-1 text-blue-400 text-sm">
                    <RiLoader4Line className="animate-spin" /> {item.status}
                  </span>
                )}
                {isPending && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    <RiTimeLine /> {item.status}
                  </span>
                )}
              </div>

              {/* Extra info */}
              {isDone && (
                <p className="text-sm text-gray-300">
                  Thời lượng:{" "}
                  <span className="text-green-400 font-medium">
                    {item.duration}
                  </span>
                </p>
              )}

              {isProcessing && (
                <div className="w-full bg-gray-600 h-2 rounded mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
