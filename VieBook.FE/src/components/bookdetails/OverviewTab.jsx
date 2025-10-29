import React, { useState } from "react";
import { RiPlayCircleLine } from "react-icons/ri";

export default function OverviewTab({ bookDetail, chaptersWithAudio = [] }) {
  const { description, chapters } = bookDetail;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);

  // Logic cắt ngắn description
  const maxDescriptionLength = 200;
  const shouldTruncate =
    description && description.length > maxDescriptionLength;
  const displayDescription =
    shouldTruncate && !isDescriptionExpanded
      ? description.substring(0, maxDescriptionLength) + "..."
      : description;

  // Logic hiển thị chương (chỉ hiển thị chapter có status "Active" từ backend)
  const maxChaptersToShow = 5;
  const shouldTruncateChapters = chapters && chapters.length > maxChaptersToShow;
  const chaptersToShow = shouldTruncateChapters && !showAllChapters 
    ? chapters.slice(0, maxChaptersToShow) 
    : chapters;
  
  // Tạo Set của chapterId có audio để tra cứu nhanh
  const audioChapterIds = new Set(chaptersWithAudio.map(ch => ch.chapterId));

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-300">{displayDescription}</p>
        {shouldTruncate && (
          <button
            onClick={() =>
              setIsDescriptionExpanded(!isDescriptionExpanded)
            }
            className="text-orange-400 hover:text-orange-300 text-sm mt-2 font-medium transition-colors"
          >
            {isDescriptionExpanded ? "Xem ít hơn" : "Xem thêm"}
          </button>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Danh sách chương</h3>
          {chapters && chapters.length > 0 && (
            <span className="text-gray-400 text-sm">
              {chapters.length} chương
            </span>
          )}
        </div>
        
        {chapters && chapters.length > 0 ? (
          <div className="space-y-2">
            {chaptersToShow?.map((ch, index) => {
              const hasAudio = audioChapterIds.has(ch.chapterId);
              
              return (
                <div 
                  key={ch.chapterId} 
                  className="text-gray-300 text-sm bg-gray-800/30 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">
                      Chương {index + 1}: {ch.chapterTitle}
                    </span>
                    {hasAudio && (
                      <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded">
                        <RiPlayCircleLine className="w-3.5 h-3.5" />
                        <span>Audio</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {shouldTruncateChapters && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setShowAllChapters(!showAllChapters)}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                >
                  {showAllChapters 
                    ? `Thu gọn (chỉ hiện ${maxChaptersToShow} chương đầu)` 
                    : `Xem tất cả ${chapters.length} chương`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">
            Sách chưa có chương nào
          </div>
        )}
      </div>
    </div>
  );
}
