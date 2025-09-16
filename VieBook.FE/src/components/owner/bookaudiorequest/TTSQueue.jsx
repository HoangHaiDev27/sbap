export default function TTSQueue({ queue }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <h2 className="font-semibold mb-3">Hàng đợi TTS</h2>
      <div className="space-y-3">
        {queue.map((item) => (
          <div key={item.id} className="bg-slate-700 p-3 rounded">
            <p className="font-medium">{item.chapter}</p>
            {item.status === "Hoàn thành" && (
              <p className="text-green-400 text-sm">
                ✔ {item.status} • Thời lượng: {item.duration}
              </p>
            )}
            {item.status === "Đang xử lý" && (
              <>
                <p className="text-blue-400 text-sm">{item.status}</p>
                <div className="w-full bg-gray-600 h-2 rounded mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </>
            )}
            {item.status === "Chờ xử lý" && (
              <p className="text-yellow-400 text-sm">{item.status}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
