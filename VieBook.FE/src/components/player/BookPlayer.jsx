import React, { useState, useEffect } from "react";
import PlayerHeader from "./PlayerHeader";
import PlayerContents from "./PlayerContents";
import BookChapter from "./BookChapter"; // 👈 nhớ import
import { saveReadingProgress } from "../../api/readingHistoryApi";

export default function BookPlayer({ bookId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(27000); // 7.5h
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const book = {
    id: parseInt(bookId),
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    narrator: "Nguyễn Minh Hoàng",
    cover: "https://via.placeholder.com/400x400.png?text=Book+Cover",
  };

  const chapters = [
    { id: 0, title: "Lời giới thiệu", start: 0, duration: 1200 },
    { id: 1, title: "Chương 1: Những Nguyên Tắc Cơ Bản", start: 1200, duration: 3600 },
    { id: 2, title: "Chương 2: Cách Khiến Người Khác Yêu Thích", start: 4800, duration: 3900 },
  ];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => setIsPlaying(!isPlaying);
  const skipForward = () => setCurrentTime(Math.min(duration, currentTime + 30));
  const skipBackward = () => setCurrentTime(Math.max(0, currentTime - 15));
  const jumpToChapter = (index) => {
    setCurrentChapter(index);
    setCurrentTime(chapters[index].start);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Lưu lịch sử nghe khi vào trang
  useEffect(() => {
    const saveListeningHistory = async () => {
      if (!bookId) return;
      
      try {
        const listeningData = {
          bookId: parseInt(bookId),
          chapterId: chapters[currentChapter]?.id,
          readingType: 'Listening',
          audioPosition: currentTime
        };
        
        await saveReadingProgress(listeningData);
        console.log("BookPlayer - Listening history saved:", listeningData);
      } catch (error) {
        console.error("Error saving listening history:", error);
      }
    };

    saveListeningHistory();
  }, [bookId, currentChapter]);

  // Lưu lịch sử nghe khi thay đổi thời gian
  useEffect(() => {
    const saveProgress = async () => {
      if (!bookId || currentTime === 0) return;
      
      try {
        const progressData = {
          bookId: parseInt(bookId),
          chapterId: chapters[currentChapter]?.id,
          readingType: 'Listening',
          audioPosition: currentTime
        };
        
        await saveReadingProgress(progressData);
        console.log("BookPlayer - Progress saved:", progressData);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(saveProgress, 2000);
    return () => clearTimeout(timeoutId);
  }, [currentTime, bookId, currentChapter]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <PlayerHeader
        book={book}
        bookId={bookId}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        toggleTranscript={() => setShowTranscript(!showTranscript)}
      />

      <PlayerContents
        book={book}
        chapters={chapters}
        currentChapter={currentChapter}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        sleepTimer={sleepTimer}
        volume={volume}
        formatTime={formatTime}
        togglePlay={togglePlay}
        skipForward={skipForward}
        skipBackward={skipBackward}
        jumpToChapter={jumpToChapter}
        setCurrentTime={setCurrentTime}
        setPlaybackSpeed={setPlaybackSpeed}
        setSleepTimer={setSleepTimer}
        setVolume={setVolume}
        showSpeed={showSpeed}
        setShowSpeed={setShowSpeed}
        showSleepTimer={showSleepTimer}
        setShowSleepTimer={setShowSleepTimer}
        setShowChapters={setShowChapters} // ✅ truyền vào đúng camelCase
      />

      {/* 👇 render modal Chapters khi showChapters = true */}
      {showChapters && (
        <BookChapter
        chapters={chapters}
        currentChapter={currentChapter}
        jumpToChapter={jumpToChapter}
        showChapters={showChapters}
        setShowChapters={setShowChapters}
        formatTime={formatTime}
      />
      )}
    </div>
  );
}
