import React, { useState, useEffect, useRef } from "react";
import AudioPlayerHeader from "./AudioPlayerHeader";
import AudioPlayerContent from "./AudioPlayerContent";
import AudioChapterList from "./AudioChapterList";
import { saveReadingProgress, getCurrentReadingProgress } from "../../api/readingHistoryApi";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { getUserId } from "../../api/authApi";
import { getMyPurchases } from "../../api/chapterPurchaseApi";

export default function AudioPlayer({ bookId, chapterId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // State for data
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [allAudioData, setAllAudioData] = useState([]); // Store all audio data
  const [selectedVoice, setSelectedVoice] = useState(null); // Selected voice name
  const [availableVoices, setAvailableVoices] = useState([]); // Available voices for current chapter
  const [currentAudioUrl, setCurrentAudioUrl] = useState(""); // Current audio URL to play
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedAudioChapters, setPurchasedAudioChapters] = useState([]); // Lưu danh sách chương đã mua audio
  const [isOwner, setIsOwner] = useState(false); // Kiểm tra xem có phải owner không
  const [hasLoadedSavedPosition, setHasLoadedSavedPosition] = useState(false); // Đánh dấu đã load vị trí đã lưu
  const saveProgressTimeoutRef = useRef(null); // Ref cho debounce save progress
  
  // Audio ref
  const audioRef = useRef(null);

  // Fetch book data
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch book details - try audio book endpoint first
        let bookRes = await fetch(API_ENDPOINTS.AUDIO_BOOK_DETAIL(bookId));
        if (!bookRes.ok) {
          bookRes = await fetch(API_ENDPOINTS.BOOK_DETAIL(bookId));
        }
        if (!bookRes.ok) throw new Error("Không thể tải thông tin sách");
        const bookData = await bookRes.json();

        // Check if user is owner
        const currentUserId = getUserId();
        const userIsOwner = currentUserId && bookData.ownerId && currentUserId === bookData.ownerId;
        setIsOwner(userIsOwner);

        // Load purchased audio chapters if logged in
        if (currentUserId) {
          try {
            const purchasesResponse = await getMyPurchases();
            const purchases = purchasesResponse?.data || [];
            const audioPurchases = purchases.filter(p => 
              p.orderType === "BuyChapterAudio" || p.orderType === "BuyChapterBoth"
            );
            const purchasedAudioChapterIds = audioPurchases.map((p) => p.chapterId);
            setPurchasedAudioChapters(purchasedAudioChapterIds);
          } catch (error) {
            console.error("Error loading purchased audio chapters:", error);
          }
        }

        // Fetch chapters
        const chaptersRes = await fetch(API_ENDPOINTS.CHAPTERS.GET_BY_BOOK_ID(bookId));
        if (!chaptersRes.ok) throw new Error("Không thể tải danh sách chương");
        const chaptersData = await chaptersRes.json();

        // Fetch chapter audios
        let audioData = [];
        try {
          const audioRes = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_BOOK_CHAPTER_AUDIOS(bookId));
          if (audioRes.ok) {
            const audioResponse = await audioRes.json();
            
            // Handle different response structures
            if (Array.isArray(audioResponse)) {
              audioData = audioResponse;
            } else if (audioResponse && typeof audioResponse === 'object') {
              // Try different common property names
              audioData = audioResponse.data || audioResponse.$values || audioResponse.items || [];
              
              // If still not array, check if the response itself contains the array somewhere
              if (!Array.isArray(audioData)) {
                const keys = Object.keys(audioResponse);
                // Try to find first array property
                for (const key of keys) {
                  if (Array.isArray(audioResponse[key])) {
                    audioData = audioResponse[key];
                    break;
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue with empty audioData
        }

        // Map chapters with audio info
        const chaptersWithAudio = chaptersData
          .map((chapter, index) => {
            let audio = null;
            if (Array.isArray(audioData) && audioData.length > 0) {
              audio = audioData.find(a => a.chapterId === chapter.chapterId);
            }
            
            // Try different field names for audio URL
            let audioUrl = null;
            if (audio) {
              // Backend returns audioLink (camelCase)
              audioUrl = audio.audioLink || audio.AudioLink || audio.audioUrl || audio.url || null;
            }
            
            return {
              id: chapter.chapterId,
              title: chapter.chapterTitle, // Bỏ "Chương X:" vì đã có badge số
              chapterNumber: audio?.chapterNumber, // Lấy chapterNumber từ audio data (backend tính từ toàn bộ chapters)
              chapterId: chapter.chapterId,
              audioUrl: audioUrl,
              duration: audio?.durationSec || audio?.duration || audio?.audioLength || 0,
              priceAudio: audio?.priceAudio || 0, // Giá audio
              hasAudio: !!audio,
            };
          })
          .filter(c => c.audioUrl); // Only chapters with valid audio URL

        // Store all audio data
        setAllAudioData(audioData);
        
        // Get voices for first chapter
        if (chaptersWithAudio.length > 0) {
          const firstChapterId = chaptersWithAudio[0].chapterId;
          
          const chapterVoices = audioData
            .filter(a => a.chapterId === firstChapterId && a.voiceName)
            .map(a => a.voiceName);
          const uniqueVoices = [...new Set(chapterVoices)];
          
          setAvailableVoices(uniqueVoices);
          
          // Set default voice to first available
          const defaultVoice = uniqueVoices.length > 0 ? uniqueVoices[0] : null;
          setSelectedVoice(defaultVoice);
        }
        
        const coverImage = bookData.imageUrl || bookData.image || bookData.coverImage || bookData.ImageUrl || bookData.Image || bookData.CoverImage;
        
        setBook({
          id: bookData.bookId,
          title: bookData.title,
          author: bookData.author,
          narrator: bookData.author,
          cover: coverImage,
          imageUrl: coverImage,
        });

        setChapters(chaptersWithAudio);
        
        if (chaptersWithAudio.length > 0) {
          // Find chapter index based on chapterId from URL
          let initialChapterIndex = 0;
          if (chapterId) {
            const foundIndex = chaptersWithAudio.findIndex(
              ch => ch.chapterId === parseInt(chapterId)
            );
            if (foundIndex >= 0) {
              initialChapterIndex = foundIndex;
            }
          }
          
          setCurrentChapter(initialChapterIndex);
          setDuration(chaptersWithAudio[initialChapterIndex].duration);
          // Set initial audio URL
          setCurrentAudioUrl(chaptersWithAudio[initialChapterIndex].audioUrl || "");
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookData();
    }
  }, [bookId, chapterId]);

  // Fetch all audios for current chapter when chapter changes
  useEffect(() => {
    const fetchChapterAudios = async () => {
      if (chapters.length > 0 && currentChapter >= 0) {
        const currentChapterId = chapters[currentChapter]?.chapterId;
        
        if (!currentChapterId) return;
        
        try {
          // Call API to get ALL audios for this specific chapter
          const response = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(currentChapterId));
          
          if (!response.ok) {
            return;
          }
          
          const data = await response.json();
          
          // Extract audio array from response
          let chapterAudios = [];
          if (data.success && Array.isArray(data.data)) {
            chapterAudios = data.data;
          } else if (Array.isArray(data)) {
            chapterAudios = data;
          }
          
          // Extract unique voices
          const voices = chapterAudios
            .filter(a => a.voiceName)
            .map(a => a.voiceName);
          const uniqueVoices = [...new Set(voices)];
          
          setAvailableVoices(uniqueVoices);
          
          // Update allAudioData for this chapter (replace old data)
          setAllAudioData(prevData => {
            // Remove old audios for this chapter
            const filtered = prevData.filter(a => a.chapterId !== currentChapterId);
            // Add new audios
            return [...filtered, ...chapterAudios];
          });
          
          // If no voice selected or current voice not available, select first one
          if (uniqueVoices.length > 0) {
            if (!selectedVoice || !uniqueVoices.includes(selectedVoice)) {
              setSelectedVoice(uniqueVoices[0]);
            }
          }
        } catch (error) {
          // Error fetching chapter audios
        }
      }
    };
    
    fetchChapterAudios();
  }, [currentChapter, chapters]);

  // Load audio when voice or chapter changes
  useEffect(() => {
    if (allAudioData.length > 0 && chapters.length > 0 && currentChapter >= 0) {
      const currentChapterId = chapters[currentChapter]?.chapterId;
      if (!currentChapterId) return;
      
      // Find audio for current chapter with selected voice
      let audio = null;
      
      if (selectedVoice) {
        audio = allAudioData.find(
          a => a.chapterId === currentChapterId && a.voiceName === selectedVoice
        );
      }
      
      // If no audio with selected voice, try to get any audio for this chapter
      if (!audio) {
        audio = allAudioData.find(a => a.chapterId === currentChapterId);
      }
      
      if (audio) {
        const audioUrl = audio.audioLink || audio.AudioLink || audio.audioUrl || audio.url;
        
        if (audioUrl && audioUrl !== currentAudioUrl) {
          const wasPlaying = isPlaying;
          
          // Update the audio URL state
          setCurrentAudioUrl(audioUrl);
          
          // Wait for next tick to ensure state is updated
          setTimeout(() => {
            if (audioRef.current && wasPlaying) {
              audioRef.current.play().catch(err => {
                // Error playing audio
              });
            }
          }, 100);
        }
      }
    }
  }, [selectedVoice, allAudioData, chapters, currentChapter, currentAudioUrl, isPlaying]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  };

  const jumpToChapter = (index) => {
    if (index < 0 || index >= chapters.length) return;
    
    const wasPlaying = isPlaying;
    setCurrentChapter(index);
    setCurrentTime(0);
    setHasLoadedSavedPosition(false); // Reset để load lại vị trí đã lưu cho chapter mới
    
    // The voice will be loaded by the useEffect that fetches chapter audios
    // Just update the chapter index, the rest will be handled automatically
    
    // If was playing, resume after a short delay to allow audio to load
    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.error("Error playing audio:", err);
          });
        }
      }, 200);
    }
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

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      
      // Load lại vị trí đã lưu sau khi audio metadata đã load
      if (!hasLoadedSavedPosition && bookId && chapters.length > 0) {
        const loadSavedPosition = async () => {
          try {
            const currentChapterId = chapters[currentChapter]?.chapterId;
            if (!currentChapterId) return;

            const savedProgress = await getCurrentReadingProgress(
              parseInt(bookId),
              currentChapterId,
              'Listening'
            );
            
            if (savedProgress && savedProgress.audioPosition && savedProgress.audioPosition > 0) {
              audio.currentTime = savedProgress.audioPosition;
              setCurrentTime(savedProgress.audioPosition);
              console.log("AudioPlayer - Loaded saved position from metadata:", savedProgress.audioPosition);
            }
            
            setHasLoadedSavedPosition(true);
          } catch (error) {
            console.error("Error loading saved position from metadata:", error);
            setHasLoadedSavedPosition(true);
          }
        };
        
        loadSavedPosition();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [chapters, currentChapter]); // Re-attach when chapter changes

  // Set playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Reset hasLoadedSavedPosition khi chuyển chapter
  useEffect(() => {
    setHasLoadedSavedPosition(false);
  }, [currentChapter]);

  // Lưu lịch sử nghe khi vào trang (sau khi đã load xong vị trí đã lưu)
  useEffect(() => {
    if (!bookId || chapters.length === 0 || !hasLoadedSavedPosition) return;
    
    // Clear timeout cũ nếu có
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    const saveListeningHistory = async () => {
      try {
        const currentChapterId = chapters[currentChapter]?.chapterId;
        if (!currentChapterId) return;

        const listeningData = {
          bookId: parseInt(bookId),
          chapterId: currentChapterId,
          readingType: 'Listening',
          audioPosition: Math.floor(currentTime) // Lưu số nguyên (giây)
        };
        
        await saveReadingProgress(listeningData);
        console.log("AudioPlayer - Listening history saved:", listeningData);
      } catch (error) {
        console.error("Error saving listening history:", error);
      }
    };

    // Debounce 1 giây để đảm bảo vị trí đã được load xong
    saveProgressTimeoutRef.current = setTimeout(saveListeningHistory, 1000);

    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, [bookId, currentChapter, chapters, hasLoadedSavedPosition, currentTime]);

  // Lưu lịch sử nghe khi thay đổi thời gian (với debounce tốt hơn)
  useEffect(() => {
    if (!bookId || chapters.length === 0 || !hasLoadedSavedPosition) return;
    
    // Clear timeout cũ nếu có
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    // Chỉ lưu nếu currentTime > 5 giây (tránh lưu khi vừa load)
    if (currentTime < 5) return;

    const saveProgress = async () => {
      try {
        const currentChapterId = chapters[currentChapter]?.chapterId;
        if (!currentChapterId) return;

        const progressData = {
          bookId: parseInt(bookId),
          chapterId: currentChapterId,
          readingType: 'Listening',
          audioPosition: Math.floor(currentTime) // Lưu số nguyên (giây)
        };
        
        await saveReadingProgress(progressData);
        console.log("AudioPlayer - Progress saved:", progressData);
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    // Debounce 3 giây để tránh gọi API quá nhiều khi user đang nghe
    saveProgressTimeoutRef.current = setTimeout(saveProgress, 3000);
    
    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, [currentTime, bookId, currentChapter, chapters, hasLoadedSavedPosition]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Không thể tải dữ liệu</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No chapters with audio
  if (!book || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-5xl mb-4">🎧</div>
          <h2 className="text-xl font-semibold mb-2">Không có audio</h2>
          <p className="text-gray-400 mb-4">Sách này chưa có phần audio nào.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        onEnded={() => {
          if (currentChapter < chapters.length - 1) {
            jumpToChapter(currentChapter + 1);
          } else {
            setIsPlaying(false);
          }
        }}
      />

      <AudioPlayerHeader
        book={book}
        bookId={bookId}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        toggleTranscript={() => setShowTranscript(!showTranscript)}
      />

      <AudioPlayerContent
        book={book}
        chapters={chapters}
        currentChapter={currentChapter}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        sleepTimer={sleepTimer}
        volume={volume}
        selectedVoice={selectedVoice}
        availableVoices={availableVoices}
        setSelectedVoice={setSelectedVoice}
        formatTime={formatTime}
        togglePlay={togglePlay}
        skipForward={skipForward}
        skipBackward={skipBackward}
        jumpToChapter={jumpToChapter}
        setCurrentTime={(time) => {
          if (audioRef.current) {
            audioRef.current.currentTime = time;
          }
        }}
        setPlaybackSpeed={setPlaybackSpeed}
        setSleepTimer={setSleepTimer}
        setVolume={setVolume}
        showSpeed={showSpeed}
        setShowSpeed={setShowSpeed}
        showSleepTimer={showSleepTimer}
        setShowSleepTimer={setShowSleepTimer}
        setShowChapters={setShowChapters}
      />

      {showChapters && (
        <AudioChapterList
          chapters={chapters}
          currentChapter={currentChapter}
          jumpToChapter={jumpToChapter}
          showChapters={showChapters}
          setShowChapters={setShowChapters}
          formatTime={formatTime}
          allAudioData={allAudioData}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          purchasedAudioChapters={purchasedAudioChapters}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}

