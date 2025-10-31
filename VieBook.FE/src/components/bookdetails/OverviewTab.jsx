import React, { useState } from "react";
import { RiPlayCircleLine, RiArrowRightLine } from "react-icons/ri";

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

  // Logic hiển thị chương
  const maxChaptersToShow = 5;
  const shouldTruncateChapters = chapters && chapters.length > maxChaptersToShow;
  
  // Khi chưa mở rộng: hiển thị 5 chương đầu
  // Khi mở rộng: hiển thị TẤT CẢ chương trong container có scroll (max-height ~7 hàng)
  const chaptersToShow = shouldTruncateChapters && !showAllChapters 
    ? chapters.slice(0, maxChaptersToShow) 
    : chapters;
  
  // Tạo Set của chapterId có audio để tra cứu nhanh
  const audioChapterIds = new Set(chaptersWithAudio.map(ch => ch.chapterId));

  return (
    <div className="space-y-6">
      {/* Description Section */}
      <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700/50">
        <h3 className="text-white font-semibold mb-3 text-lg">Mô tả</h3>
        <div
          className={
            isDescriptionExpanded && shouldTruncate
              ? "max-h-[300px] overflow-y-auto pr-2 description-scrollable"
              : ""
          }
          style={
            isDescriptionExpanded && shouldTruncate
              ? {
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#f97316 #1f2937'
                }
              : {}
          }
        >
          <p className="text-gray-300 leading-relaxed text-base">
            {displayDescription}
          </p>
        </div>
        {shouldTruncate && (
          <button
            onClick={() =>
              setIsDescriptionExpanded(!isDescriptionExpanded)
            }
            className="text-orange-400 hover:text-orange-300 text-sm mt-3 font-medium transition-colors inline-flex items-center gap-1 hover:gap-2"
          >
            {isDescriptionExpanded ? (
              <>
                <span>Thu gọn</span>
              </>
            ) : (
              <>
                <span>Xem thêm</span>
                <RiArrowRightLine className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Chapters Section */}
      <div className="bg-gray-800/30 rounded-lg p-5 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-lg">Danh sách chương</h3>
          {chapters && chapters.length > 0 && (
            <span className="text-gray-400 text-sm bg-gray-700/50 px-3 py-1 rounded-full">
              {chapters.length} chương
            </span>
          )}
        </div>
        
        {chapters && chapters.length > 0 ? (
          <>
            {/* Container với scroll khi mở rộng - chỉ cao ~7 hàng để scroll */}
            <div
              className={
                showAllChapters
                  ? "max-h-[350px] overflow-y-auto pr-2 space-y-2 chapters-scrollable"
                  : "space-y-2"
              }
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #1f2937'
              }}
            >
              {chaptersToShow?.map((ch, index) => {
                const hasAudio = audioChapterIds.has(ch.chapterId);
                
                return (
                  <div 
                    key={ch.chapterId} 
                    className="group text-gray-300 text-sm bg-gray-700/40 hover:bg-gray-700/60 rounded-lg px-4 py-3 transition-all duration-200 border border-transparent hover:border-orange-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-medium">
                        <span className="text-orange-400">Chương {index + 1}:</span> {ch.chapterTitle}
                      </span>
                      {hasAudio && (
                        <div className="flex items-center gap-1 text-green-400 text-xs font-medium bg-green-500/20 px-2.5 py-1 rounded-full border border-green-500/30 flex-shrink-0">
                          <RiPlayCircleLine className="w-3.5 h-3.5" />
                          <span>Audio</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {shouldTruncateChapters && (
              <div className="text-center pt-4 border-t border-gray-700/50 mt-4">
                <button
                  onClick={() => setShowAllChapters(!showAllChapters)}
                  className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-all inline-flex items-center gap-1 hover:gap-2 px-4 py-2 rounded-lg hover:bg-orange-500/10"
                >
                  {showAllChapters ? (
                    <>
                      <span>Thu gọn</span>
                    </>
                  ) : (
                    <>
                      <span>Xem thêm</span>
                      <RiArrowRightLine className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-sm italic text-center py-4">
            Sách chưa có chương nào
          </div>
        )}
      </div>
    </div>
  );
}
