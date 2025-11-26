import React from "react";
import {
  RiReplay10Line,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiForward10Line,
  RiPlayLine,
  RiPauseLine,
  RiSpeedLine,
  RiMoonLine,
  RiVolumeDownLine,
  RiVolumeUpLine,
  RiVoiceprintLine,
} from "react-icons/ri";
import { getVoiceDisplayName } from "../../utils/voiceMapping";

export default function AudioPlayerContent({
  book,
  chapters,
  currentChapter,
  currentTime,
  duration,
  isPlaying,
  playbackSpeed,
  sleepTimer,
  volume,
  selectedVoice,
  availableVoices,
  setSelectedVoice,
  formatTime,
  togglePlay,
  skipForward,
  skipBackward,
  jumpToChapter,
  setCurrentTime,
  setPlaybackSpeed,
  setSleepTimer,
  setVolume,
  showSpeed,
  setShowSpeed,
  showSleepTimer,
  setShowSleepTimer,
  setShowChapters,
  purchasedAudioChapters,
  isOwner,
}) {
  const [showVoice, setShowVoice] = React.useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="max-w-2xl w-full text-center space-y-6 md:space-y-8">
        {/* Book Cover - Always visible */}
        <div className="relative mx-auto w-64 md:w-80 mb-6 md:mb-8">
          {!book ? (
            <div className="w-full h-64 md:h-80 rounded-lg shadow-2xl bg-gray-800 flex items-center justify-center">
              <div className="text-gray-500">
                <div className="text-5xl mb-2">📖</div>
                <div className="text-sm">Đang tải...</div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={book?.cover || book?.imageUrl || "https://via.placeholder.com/400x400.png?text=Book+Cover"}
                alt={book?.title || "Book Cover"}
                className="w-full h-auto rounded-lg shadow-2xl object-contain"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x400.png?text=Book+Cover";
                }}
              />
              {/* Playing indicator overlay - doesn't hide the image */}
              {isPlaying && (
                <div className="absolute top-4 right-4 bg-blue-500 p-2 rounded-full shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Current Chapter Info */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Đang phát</p>
            {selectedVoice && (
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">🎤 {getVoiceDisplayName(selectedVoice)}</span>
            )}
          </div>
          {chapters[currentChapter] && (
            <p className="text-sm text-blue-400 mb-1">
              Chương {chapters[currentChapter]?.chapterNumber || currentChapter + 1} / {chapters[chapters.length - 1]?.chapterNumber || chapters.length}
            </p>
          )}
          <p className="font-medium text-lg">{chapters[currentChapter]?.title || "Không có chương"}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              setCurrentTime(percentage * duration);
            }}
          >
            <div
              className="h-2 bg-blue-500 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-4 md:space-x-6">
          <button 
            onClick={skipBackward} 
            className="p-2 md:p-3 rounded-full hover:bg-gray-700 transition-colors"
            title="Tua lùi 10 giây"
          >
            <RiReplay10Line className="text-xl md:text-2xl" />
          </button>
          <button
            onClick={() => {
              const prevIndex = Math.max(0, currentChapter - 1);
              if (prevIndex !== currentChapter) {
                jumpToChapter(prevIndex);
              }
            }}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Chương trước"
          >
            <RiSkipBackLine className="text-lg md:text-xl" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 md:p-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <RiPauseLine className="text-2xl md:text-3xl" />
            ) : (
              <RiPlayLine className="text-2xl md:text-3xl" />
            )}
          </button>
          <button
            onClick={() => {
              const nextIndex = Math.min(chapters.length - 1, currentChapter + 1);
              if (nextIndex !== currentChapter) {
                jumpToChapter(nextIndex);
              }
            }}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Chương tiếp theo"
          >
            <RiSkipForwardLine className="text-lg md:text-xl" />
          </button>
          <button 
            onClick={skipForward} 
            className="p-2 md:p-3 rounded-full hover:bg-gray-700 transition-colors"
            title="Tua tới 10 giây"
          >
            <RiForward10Line className="text-xl md:text-2xl" />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center flex-wrap gap-3 md:gap-6 px-4">
          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeed(!showSpeed)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors shadow-sm"
              title="Tốc độ phát"
            >
              <RiSpeedLine className="text-base" /> 
              <span className="font-medium">{playbackSpeed}x</span>
            </button>
            {showSpeed && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 shadow-lg z-10">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeed(false);
                    }}
                    className={`block w-full text-sm px-3 py-1 rounded transition-colors ${
                      playbackSpeed === speed
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Selection */}
          <div className="relative">
            <button
              onClick={() => setShowVoice(!showVoice)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors shadow-sm"
              title="Chọn giọng đọc cho chương này"
            >
              <RiVoiceprintLine className="text-base" /> 
              <span className="font-medium">{selectedVoice ? getVoiceDisplayName(selectedVoice) : "Giọng đọc"}</span>
            </button>
            {showVoice && availableVoices && availableVoices.length > 0 && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-2 shadow-xl z-10 w-48">
                <div className="text-xs text-gray-400 px-3 py-1 border-b border-gray-700 mb-1">
                  Giọng đọc chương {currentChapter + 1}
                </div>
                {availableVoices.map((voice) => (
                  <button
                    key={voice}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoice(false);
                    }}
                    className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors ${
                      selectedVoice === voice
                        ? "bg-blue-600 text-white font-medium"
                        : "hover:bg-gray-700"
                    }`}
                    title={`Đổi sang giọng ${voice}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{getVoiceDisplayName(voice)}</span>
                      {selectedVoice === voice && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleepTimer(!showSleepTimer)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors shadow-sm ${
                sleepTimer > 0 
                  ? "bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              title={sleepTimer > 0 ? `Tự động dừng sau ${sleepTimer} phút` : "Hẹn giờ tự động dừng"}
            >
              <RiMoonLine className="text-base" /> 
              <span className="font-medium">{sleepTimer > 0 ? `${sleepTimer}m` : "Hẹn giờ"}</span>
            </button>
            {showSleepTimer && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 shadow-lg w-32 z-10">
                {[5, 10, 15, 30].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      setSleepTimer(minutes);
                      setShowSleepTimer(false);
                    }}
                    className="block w-full text-sm px-3 py-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    {minutes} phút
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg shadow-sm" title="Điều chỉnh âm lượng">
            <RiVolumeDownLine className="text-gray-400 text-base flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 md:w-24 accent-blue-500"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
            <RiVolumeUpLine className="text-gray-400 text-base flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

