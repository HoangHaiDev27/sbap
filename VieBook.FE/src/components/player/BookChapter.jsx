import React from "react";

export default function BookChapter({
  chapters,
  currentChapter,
  jumpToChapter,
  showChapters,
  setShowChapters,
  formatTime,
}) {
  if (!showChapters) return null; // Nếu chưa mở thì không render gì

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay tối nền */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={() => setShowChapters(false)} // 👉 click ra ngoài để tắt
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-700/95 p-6 rounded-lg max-w-md w-full shadow-xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Danh sách chương</h3>
          <button
            onClick={() => setShowChapters(false)}
            className="p-1 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ✖
          </button>
        </div>

        {/* List chapters */}
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => {
                jumpToChapter(index);
                setShowChapters(false);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                currentChapter === index
                  ? "bg-orange-600 text-white"
                  : "hover:bg-gray-700"
              }`}
            >
              <div>
                <div className="font-medium">{chapter.title}</div>
                <div className="text-sm opacity-70">
                  {formatTime(chapter.duration)}
                </div>
              </div>
              <div className="text-sm opacity-70">
                {formatTime(chapter.start)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
