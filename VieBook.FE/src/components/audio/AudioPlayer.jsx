import React, { useState, useEffect, useRef } from "react";
import AudioPlayerHeader from "./AudioPlayerHeader";
import AudioPlayerContent from "./AudioPlayerContent";
import AudioChapterList from "./AudioChapterList";
import { saveReadingProgress, getCurrentReadingProgress } from "../../api/readingHistoryApi";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { getUserId, authFetch } from "../../api/authApi";
import { getMyPurchases } from "../../api/chapterPurchaseApi";
import toast from "react-hot-toast";

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
  const [showChaptersMobile, setShowChaptersMobile] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [allAudioData, setAllAudioData] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasedAudioChapters, setPurchasedAudioChapters] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [hasLoadedSavedPosition, setHasLoadedSavedPosition] = useState(false);
  const saveProgressTimeoutRef = useRef(null);
  const sleepTimerRef = useRef(null);
  
  const audioRef = useRef(null);

  // Fetch book data
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sử dụng authFetch để gửi token, giúp backend lấy userId và cho phép truy cập sách đã mua dù bị tạm dừng
        let bookRes = await authFetch(API_ENDPOINTS.AUDIO_BOOK_DETAIL(bookId));
        if (!bookRes.ok) {
          bookRes = await authFetch(API_ENDPOINTS.BOOK_DETAIL(bookId));
        }
        if (!bookRes.ok) throw new Error("Không thể tải thông tin sách");
        const bookData = await bookRes.json();

        const currentUserId = getUserId();
        // Lấy OwnerId từ BookDetailDTO (theo backend: OwnerId là int)
        const bookOwnerId = bookData.OwnerId || bookData.ownerId || null;
        // Đảm bảo so sánh đúng kiểu dữ liệu (chuyển cả hai về số để so sánh)
        const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
        const ownerIdNum = bookOwnerId ? Number(bookOwnerId) : null;
        const userIsOwner = !!(currentUserIdNum && ownerIdNum && currentUserIdNum === ownerIdNum);
        setIsOwner(userIsOwner);
        
        console.log("AudioPlayer - Setting isOwner:", {
          currentUserId: currentUserId,
          currentUserIdNum: currentUserIdNum,
          bookDataOwnerId: bookData.OwnerId,
          bookOwnerId: bookOwnerId,
          ownerIdNum: ownerIdNum,
          userIsOwner: userIsOwner,
          userIsOwnerType: typeof userIsOwner
        });

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

        // Sử dụng authFetch để gửi token, giúp backend lấy userId và cho phép truy cập chapters đã mua dù bị tạm dừng
        const chaptersRes = await authFetch(API_ENDPOINTS.CHAPTERS.GET_BY_BOOK_ID(bookId));
        if (!chaptersRes.ok) throw new Error("Không thể tải danh sách chương");
        const chaptersData = await chaptersRes.json();

        let audioData = [];
        try {
          const audioRes = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_BOOK_CHAPTER_AUDIOS(bookId));
          if (audioRes.ok) {
            const audioResponse = await audioRes.json();
            
            if (Array.isArray(audioResponse)) {
              audioData = audioResponse;
            } else if (audioResponse && typeof audioResponse === 'object') {
              audioData = audioResponse.data || audioResponse.$values || audioResponse.items || [];
              
              if (!Array.isArray(audioData)) {
                const keys = Object.keys(audioResponse);
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
        }

        const chaptersWithAudio = chaptersData
          .map((chapter, index) => {
            let audio = null;
            if (Array.isArray(audioData) && audioData.length > 0) {
              audio = audioData.find(a => a.chapterId === chapter.chapterId);
            }
            
            let audioUrl = null;
            if (audio) {
              audioUrl = audio.audioLink || audio.AudioLink || audio.audioUrl || audio.url || null;
            }
            
            return {
              id: chapter.chapterId,
              title: chapter.chapterTitle, 
              chapterNumber: audio?.chapterNumber, 
              chapterId: chapter.chapterId,
              audioUrl: audioUrl,
              duration: audio?.durationSec || audio?.duration || audio?.audioLength || 0,
              priceAudio: audio?.priceAudio || 0,
              hasAudio: !!audio,
            };
          })
          .filter(c => c.audioUrl); 

        setAllAudioData(audioData);
        
        if (chaptersWithAudio.length > 0) {
          const firstChapterId = chaptersWithAudio[0].chapterId;
          
          const chapterVoices = audioData
            .filter(a => a.chapterId === firstChapterId && a.voiceName)
            .map(a => a.voiceName);
          const uniqueVoices = [...new Set(chapterVoices)];
          
          setAvailableVoices(uniqueVoices);
          
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

  useEffect(() => {
    const fetchChapterAudios = async () => {
      if (chapters.length > 0 && currentChapter >= 0) {
        const currentChapterId = chapters[currentChapter]?.chapterId;
        
        if (!currentChapterId) return;
        
        try {
          const response = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(currentChapterId));
          
          if (!response.ok) {
            return;
          }
          
          const data = await response.json();
          
          let chapterAudios = [];
          if (data.success && Array.isArray(data.data)) {
            chapterAudios = data.data;
          } else if (Array.isArray(data)) {
            chapterAudios = data;
          }
          
          const voices = chapterAudios
            .filter(a => a.voiceName)
            .map(a => a.voiceName);
          const uniqueVoices = [...new Set(voices)];
          
          setAvailableVoices(uniqueVoices);
          
          setAllAudioData(prevData => {
            const filtered = prevData.filter(a => a.chapterId !== currentChapterId);
            return [...filtered, ...chapterAudios];
          });
          
          if (uniqueVoices.length > 0) {
            if (!selectedVoice || !uniqueVoices.includes(selectedVoice)) {
              setSelectedVoice(uniqueVoices[0]);
            }
          }
        } catch (error) {
        }
      }
    };
    
    fetchChapterAudios();
  }, [currentChapter, chapters]);

  useEffect(() => {
    if (allAudioData.length > 0 && chapters.length > 0 && currentChapter >= 0) {
      const currentChapterId = chapters[currentChapter]?.chapterId;
      if (!currentChapterId) return;
      
      let audio = null;
      
      if (selectedVoice) {
        audio = allAudioData.find(
          a => a.chapterId === currentChapterId && a.voiceName === selectedVoice
        );
      }
      
      if (!audio) {
        audio = allAudioData.find(a => a.chapterId === currentChapterId);
      }
      
      if (audio) {
        const audioUrl = audio.audioLink || audio.AudioLink || audio.audioUrl || audio.url;
        
        if (audioUrl && audioUrl !== currentAudioUrl) {
          const wasPlaying = isPlaying;
          
          setCurrentAudioUrl(audioUrl);
          
          setTimeout(() => {
            if (audioRef.current && wasPlaying) {
              audioRef.current.play().catch(err => {
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

  const jumpToChapter = async (index) => {
    if (index < 0 || index >= chapters.length) return;
    
    // Kiểm tra quyền truy cập chương
    const chapter = chapters[index];
    if (!chapter) return;
    
    const currentUserId = getUserId();
    const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
    
    // Fetch chapter audios để lấy UserId (vì GET_BOOK_CHAPTER_AUDIOS không trả về UserId)
    let isChapterAudioOwner = false;
    try {
      const audioRes = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(chapter.chapterId));
      if (audioRes.ok) {
        const audioData = await audioRes.json();
        const audios = audioData.success && Array.isArray(audioData.data) 
          ? audioData.data 
          : Array.isArray(audioData) ? audioData : [];
        
        isChapterAudioOwner = audios.some(audio => {
          const audioUserId = audio.userId || audio.UserId || null;
          return currentUserIdNum && audioUserId && currentUserIdNum === Number(audioUserId);
        });
      }
    } catch (error) {
      console.error("Error checking chapter audio owner:", error);
    }
    
    const isFree = !chapter.priceAudio || chapter.priceAudio === 0;
    const isOwned = purchasedAudioChapters.includes(chapter.chapterId);
    // Owner của audio hoặc owner của sách luôn có quyền truy cập, không cần mua
    const isChapterOwner = isChapterAudioOwner || isOwner;
    const hasAccess = isOwned || isChapterOwner || isFree;
    
    if (!hasAccess) {
      toast.error("Bạn cần mua audio chương này để nghe");
      return;
    }
    
    const wasPlaying = isPlaying;
    setCurrentChapter(index);
    setCurrentTime(0);
    setHasLoadedSavedPosition(false);
    
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
            }
            
            setHasLoadedSavedPosition(true);
            
            // Lưu ngay sau khi load saved position xong
            setTimeout(async () => {
              try {
                const progressData = {
                  bookId: parseInt(bookId),
                  chapterId: currentChapterId,
                  readingType: 'Listening',
                  audioPosition: Math.floor(audio.currentTime)
                };
                await saveReadingProgress(progressData);
              } catch (error) {
                console.error("Error saving progress after loading saved position:", error);
              }
            }, 100);
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
  }, [chapters, currentChapter]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (sleepTimer > 0 && isPlaying) {
      const timerMinutes = sleepTimer;
      const timerMilliseconds = timerMinutes * 60 * 1000;

      sleepTimerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
        setSleepTimer(0);
        
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "info",
              message: `Đã tự động dừng sau ${timerMinutes} phút`,
            },
          })
        );
      }, timerMilliseconds);
    }

    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepTimer, isPlaying]);

  useEffect(() => {
    setHasLoadedSavedPosition(false);
  }, [currentChapter]);

  // Lưu lịch sử nghe ngay khi vào và tự động lưu định kỳ
  useEffect(() => {
    if (!bookId || chapters.length === 0) return;
    
    const currentChapterId = chapters[currentChapter]?.chapterId;
    if (!currentChapterId) return;

    const saveProgress = async () => {
      try {
        const progressData = {
          bookId: parseInt(bookId),
          chapterId: currentChapterId,
          readingType: 'Listening',
          audioPosition: Math.floor(currentTime)
        };
        
        await saveReadingProgress(progressData);
      } catch (error) {
        console.error("Error saving listening progress:", error);
      }
    };

    // Lưu ngay khi đã load saved position xong (khi vào trang)
    if (hasLoadedSavedPosition) {
      saveProgress();
    }

    // Clear timeout cũ nếu có
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    // Tự động lưu sau 500ms khi có thay đổi (nhanh hơn để không mất lịch sử khi thao tác nhanh)
    saveProgressTimeoutRef.current = setTimeout(() => {
      if (hasLoadedSavedPosition) {
        saveProgress();
      }
    }, 500);

    return () => {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current);
      }
    };
  }, [bookId, currentChapter, chapters, hasLoadedSavedPosition, currentTime]);

  // Lưu ngay khi bắt đầu play
  useEffect(() => {
    if (!bookId || chapters.length === 0 || !hasLoadedSavedPosition || !isPlaying) return;
    
    const currentChapterId = chapters[currentChapter]?.chapterId;
    if (!currentChapterId) return;

    const saveProgress = async () => {
      try {
        const progressData = {
          bookId: parseInt(bookId),
          chapterId: currentChapterId,
          readingType: 'Listening',
          audioPosition: Math.floor(currentTime)
        };
        
        await saveReadingProgress(progressData);
      } catch (error) {
        console.error("Error saving listening progress on play:", error);
      }
    };

    // Lưu ngay khi bắt đầu play
    saveProgress();
  }, [isPlaying, bookId, currentChapter, chapters, hasLoadedSavedPosition]);

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
      <audio
        ref={audioRef}
        src={currentAudioUrl}
        onEnded={async () => {
          if (currentChapter < chapters.length - 1) {
            // Kiểm tra quyền truy cập chương tiếp theo trước khi chuyển
            const nextChapter = chapters[currentChapter + 1];
            if (nextChapter) {
              const currentUserId = getUserId();
              const currentUserIdNum = currentUserId ? Number(currentUserId) : null;
              
              // Fetch chapter audios để lấy UserId
              let isNextChapterAudioOwner = false;
              try {
                const audioRes = await fetch(API_ENDPOINTS.AUDIO_CONVERSION.GET_CHAPTER_AUDIOS(nextChapter.chapterId));
                if (audioRes.ok) {
                  const audioData = await audioRes.json();
                  const audios = audioData.success && Array.isArray(audioData.data) 
                    ? audioData.data 
                    : Array.isArray(audioData) ? audioData : [];
                  
                  isNextChapterAudioOwner = audios.some(audio => {
                    const audioUserId = audio.userId || audio.UserId || null;
                    return currentUserIdNum && audioUserId && currentUserIdNum === Number(audioUserId);
                  });
                }
              } catch (error) {
                console.error("Error checking next chapter audio owner:", error);
              }
              
              const isFree = !nextChapter.priceAudio || nextChapter.priceAudio === 0;
              const isOwned = purchasedAudioChapters.includes(nextChapter.chapterId);
              const isNextChapterOwner = isNextChapterAudioOwner || isOwner;
              const hasAccess = isOwned || isNextChapterOwner || isFree;
              
              if (hasAccess) {
                jumpToChapter(currentChapter + 1);
              } else {
                setIsPlaying(false);
                toast.error("Bạn cần mua audio chương tiếp theo để nghe");
              }
            } else {
              setIsPlaying(false);
            }
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
        showChaptersMobile={showChaptersMobile}
        setShowChaptersMobile={setShowChaptersMobile}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Overlay để đóng sidebar trên mobile */}
        {showChaptersMobile && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowChaptersMobile(false)}
          />
        )}
        
        {/* Sidebar - Ẩn/hiện trên mobile, luôn hiển thị trên desktop */}
        <div className={`${showChaptersMobile ? 'flex' : 'hidden'} lg:!flex w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-r border-gray-700 bg-gray-800 overflow-y-auto overflow-x-hidden flex-shrink-0 max-h-[50vh] lg:max-h-none fixed lg:relative top-0 left-0 h-[50vh] lg:h-auto z-50 lg:z-auto`}>
          <AudioChapterList
            chapters={chapters}
            currentChapter={currentChapter}
            jumpToChapter={jumpToChapter}
            showChapters={true}
            setShowChapters={setShowChapters}
            formatTime={formatTime}
            allAudioData={allAudioData}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            purchasedAudioChapters={purchasedAudioChapters}
            isOwner={isOwner}
            bookId={bookId}
            bookTitle={book?.title}
            setShowChaptersMobile={setShowChaptersMobile}
            onPurchaseSuccess={(chapterIds) => {
              // Refresh purchased chapters
              const currentUserId = getUserId();
              if (currentUserId) {
                getMyPurchases().then(purchasesResponse => {
                  const purchases = purchasesResponse?.data || [];
                  const audioPurchases = purchases.filter(p => 
                    p.orderType === "BuyChapterAudio" || p.orderType === "BuyChapterBoth"
                  );
                  const purchasedAudioChapterIds = audioPurchases.map((p) => p.chapterId);
                  setPurchasedAudioChapters(purchasedAudioChapterIds);
                }).catch(err => {
                  console.error("Error refreshing purchases:", err);
                });
              }
            }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center min-w-0 lg:z-auto" style={{ zIndex: showChaptersMobile ? 1 : 'auto' }}>
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
            showChaptersMobile={showChaptersMobile}
            setShowChaptersMobile={setShowChaptersMobile}
            purchasedAudioChapters={purchasedAudioChapters}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}

