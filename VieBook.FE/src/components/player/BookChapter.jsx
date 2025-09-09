import React from "react";

export default function BookChapter({ 
  chapters, 
  currentChapter, 
  jumpToChapter, 
  showChapters, 
  setShowChapters, 
  formatTime 
}) {
  if (!showChapters) return null; // Nếu chưa mở thì không render gì

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Danh sách chương</h3>
          <button
            onClick={() => setShowChapters(false)}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✖
          </button>
        </div>

        {/* List chapters */}
        <div className="space-y-1">
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
