import React, { useState, useEffect } from "react";
import { RiVoiceprintLine } from "react-icons/ri";
import { API_ENDPOINTS } from "../../config/apiConfig";

export default function AudioChapterList({
  chapters,
  currentChapter,
  jumpToChapter,
  showChapters,
  setShowChapters,
  formatTime,
  allAudioData,
  selectedVoice,
  setSelectedVoice,
}) {
  const [chapterAudios, setChapterAudios] = useState({}); // { chapterId: [audios] }
  const [expandedChapters, setExpandedChapters] = useState(new Set([currentChapter]));
  
  // Fetch audio cho các chapter khi popup mở
  useEffect(() => {
    if (showChapters && chapters.length > 0) {
      // Fetch audio cho tất cả chapter
      const fetchAllChapterAudios = async () => {
        const promises = chapters.map(async (chapter) => {
          try {
            const response = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(chapter.chapterId));
            if (response.ok) {
              const data = await response.json();
              let audios = [];
              if (data.success && Array.isArray(data.data)) {
                audios = data.data;
              } else if (Array.isArray(data)) {
                audios = data;
              }
              return { chapterId: chapter.chapterId, audios };
            }
          } catch (error) {
            console.error(`Error fetching audios for chapter ${chapter.chapterId}:`, error);
          }
          return { chapterId: chapter.chapterId, audios: [] };
        });
        
        const results = await Promise.all(promises);
        const audioMap = {};
        results.forEach(({ chapterId, audios }) => {
          audioMap[chapterId] = audios;
        });
        setChapterAudios(audioMap);
      };
      
      fetchAllChapterAudios();
    }
  }, [showChapters, chapters]);

  const toggleChapterExpand = (index) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };
  
  if (!showChapters) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay tối nền */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setShowChapters(false)}
      ></div>

      {/* Modal - Tăng width */}
      <div className="relative bg-gray-800 p-6 rounded-lg max-w-3xl w-full shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Danh sách chương</h3>
          <button
            onClick={() => setShowChapters(false)}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            ✖
          </button>
        </div>

        {/* List chapters */}
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {chapters.map((chapter, index) => {
            const audios = chapterAudios[chapter.chapterId] || [];
            const isExpanded = expandedChapters.has(index);
            const isCurrentChapter = currentChapter === index;
            
            return (
              <div key={chapter.id} className="space-y-2">
                {/* Chapter header */}
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrentChapter
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-700"
                }`}>
                  {/* Chapter Number Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isCurrentChapter 
                      ? "bg-blue-700" 
                      : "bg-gray-600"
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Chapter Info - clickable */}
                  <button
                    onClick={() => {
                      jumpToChapter(index);
                      setShowChapters(false);
                    }}
                    className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                  >
                    <div className="font-medium truncate">{chapter.title}</div>
                    <div className={`text-xs mt-1 flex items-center gap-2 ${isCurrentChapter ? "text-blue-200" : "text-gray-400"}`}>
                      <span>⏱ {formatTime(chapter.duration)}</span>
                      {audios.length > 0 && (
                        <span className="flex items-center gap-1">
                          <RiVoiceprintLine className="text-xs" />
                          {audios.length} giọng
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Playing Indicator */}
                  {isCurrentChapter && (
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  )}
                  
                  {/* Expand/Collapse button */}
                  {audios.length > 0 && (
                    <button
                      onClick={() => toggleChapterExpand(index)}
                      className={`flex-shrink-0 p-2 rounded hover:bg-opacity-20 hover:bg-white transition-colors ${
                        isCurrentChapter ? "text-white" : "text-gray-400"
                      }`}
                      title={isExpanded ? "Thu gọn" : "Xem giọng đọc"}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                  )}
                </div>
                
                {/* Voice list - expanded */}
                {isExpanded && audios.length > 0 && (
                  <div className="ml-14 space-y-1 border-l-2 border-blue-500 pl-3">
                    {audios.map((audio) => (
                      <button
                        key={audio.audioId}
                        onClick={() => {
                          jumpToChapter(index);
                          setSelectedVoice(audio.voiceName);
                          setShowChapters(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          isCurrentChapter && selectedVoice === audio.voiceName
                            ? "bg-blue-600 text-white font-medium"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <RiVoiceprintLine className="text-base" />
                          <span className="capitalize">{audio.voiceName || "Mặc định"}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.floor((audio.durationSec || 0) / 60)}:{((audio.durationSec || 0) % 60).toString().padStart(2, '0')}
                        </div>
                        {isCurrentChapter && selectedVoice === audio.voiceName && (
                          <span className="text-xs ml-2">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

