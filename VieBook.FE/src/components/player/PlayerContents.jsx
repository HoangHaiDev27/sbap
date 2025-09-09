import React from "react";
import {
  RiReplay15Line,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiForward30Line,
  RiPlayLine,
  RiPauseLine,
  RiSpeedLine,
  RiListUnordered,
  RiMoonLine,
  RiVolumeDownLine,
  RiVolumeUpLine,
} from "react-icons/ri";

export default function PlayerContents({
  book,
  chapters,
  currentChapter,
  currentTime,
  duration,
  isPlaying,
  playbackSpeed,
  sleepTimer,
  volume,
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
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Book Cover */}
        <div className="relative mx-auto w-80 h-80 mb-8">
          <img
            src="https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT5IqSs9SV7eTNQiNZSXsScSZXlw04fmXrMroTGQ6Q-bObZ_ZK_EBsPSrQzXXTklzyOi1JblhROK86yhNtJNJk6NG_rd41i7v-r4KhnSY2kuFSb0D3XZtcM&usqp=CAc"
            alt={book.title}
            className="w-full h-full rounded-lg shadow-2xl object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Current Chapter */}
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Đang phát</p>
          <p className="font-medium">{chapters[currentChapter].title}</p>
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
              className="h-2 bg-orange-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center space-x-6">
          <button onClick={skipBackward} className="p-3 rounded-full hover:bg-gray-700">
            <RiReplay15Line className="text-2xl" />
          </button>
          <button
            onClick={() => jumpToChapter(Math.max(0, currentChapter - 1))}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            <RiSkipBackLine className="text-xl" />
          </button>
          <button
            onClick={togglePlay}
            className="p-4 bg-orange-600 rounded-full hover:bg-orange-700"
          >
            {isPlaying ? (
              <RiPauseLine className="text-3xl" />
            ) : (
              <RiPlayLine className="text-3xl" />
            )}
          </button>
          <button
            onClick={() => jumpToChapter(Math.min(chapters.length - 1, currentChapter + 1))}
            className="p-2 rounded-full hover:bg-gray-700"
          >
            <RiSkipForwardLine className="text-xl" />
          </button>
          <button onClick={skipForward} className="p-3 rounded-full hover:bg-gray-700">
            <RiForward30Line className="text-2xl" />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-center space-x-8">
          {/* Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSpeed(!showSpeed)}
              className="flex items-center space-x-1 text-sm hover:text-orange-400"
            >
              <RiSpeedLine /> <span>{playbackSpeed}x</span>
            </button>
            {showSpeed && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 shadow-lg">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeed(false);
                    }}
                    className={`block w-full text-sm px-3 py-1 rounded ${
                      playbackSpeed === speed
                        ? "bg-orange-600 text-white"
                        : "hover:bg-gray-700"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapters */}
          <button
            onClick={() => setShowChapters(true)}
            className="flex items-center space-x-1 text-sm hover:text-orange-400"
            >
            <RiListUnordered /> <span>Chương</span>
        </button>


          {/* Sleep Timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleepTimer(!showSleepTimer)}
              className={`flex items-center space-x-1 text-sm hover:text-orange-400 ${
                sleepTimer > 0 ? "text-orange-400" : ""
              }`}
            >
              <RiMoonLine /> <span>{sleepTimer > 0 ? `${sleepTimer}m` : "Hẹn giờ"}</span>
            </button>
            {showSleepTimer && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-2 shadow-lg">
                {[5, 10, 15, 30].map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => {
                      setSleepTimer(minutes);
                      setShowSleepTimer(false);
                    }}
                    className="block w-full text-sm px-3 py-1 hover:bg-gray-700 rounded"
                  >
                    {minutes} phút
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center space-x-2">
            <RiVolumeDownLine />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-orange-500"
            />
            <RiVolumeUpLine />
          </div>
        </div>
      </div>
    </div>
  );
}
