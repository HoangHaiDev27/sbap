import { RiCheckLine, RiLoader4Line, RiTimeLine, RiErrorWarningLine } from "react-icons/ri";

export default function TTSQueue({ queue, loading = false }) {
  const isEmpty = !queue || queue.length === 0;

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg">
      <h2 className="font-semibold mb-4 text-lg text-white flex items-center gap-2">
        🎧 Hàng đợi chuyển đổi
        {loading && (
          <RiLoader4Line className="animate-spin text-orange-400 text-lg ml-1" />
        )}
      </h2>

      {loading && isEmpty && (
        <div className="flex items-center justify-center gap-2 text-gray-300 py-6">
          <RiLoader4Line className="animate-spin text-orange-400 text-xl" />
          <span>Đang tải hàng đợi...</span>
        </div>
      )}

      {!loading && isEmpty && (
        <div className="text-gray-400 italic text-sm py-4 text-center">
          Chưa có yêu cầu chuyển đổi nào.
        </div>
      )}

      {!isEmpty && (
        <div className="space-y-3">
          {queue.map((item) => {
            const isDone = item.status === "Hoàn thành";
            const isProcessing = item.status === "Đang xử lý";
            const isPending = item.status === "Chờ xử lý";
            const isError = item.status === "Chuyển đổi thất bại";

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]
                  ${
                    isDone
                      ? "bg-green-900/20 border-green-500/40"
                      : isProcessing
                      ? "bg-blue-900/20 border-blue-500/40"
                      : isError
                      ? "bg-red-900/20 border-red-500/40"
                      : "bg-yellow-900/20 border-yellow-500/40"
                  }`}
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <p className="font-medium text-white truncate">{item.chapter}</p>

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
                  {isError && (
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <RiErrorWarningLine /> {item.status}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {isProcessing && (
                  <div className="w-full bg-gray-700 h-2 rounded mt-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded transition-all duration-500 ease-out"
                      style={{ width: `${item.progress || 10}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
