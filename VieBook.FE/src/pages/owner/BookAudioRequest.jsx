import { Link, useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import ChapterSelector from "../../components/owner/bookaudiorequest/ChapterSelector";
import VoiceConfig from "../../components/owner/bookaudiorequest/VoiceConfig";
import ChapterAudioList from "../../components/owner/bookaudiorequest/ChapterAudioList";
import TTSQueue from "../../components/owner/bookaudiorequest/TTSQueue";
import SubscriptionStatus from "../../components/owner/bookaudiorequest/SubscriptionStatus";
import { getChaptersByBookId, getChapterAudios } from "../../api/ownerBookApi";
import { useTTSQueue } from "../../hooks/useTTSQueue";
import chatWebSocket from "../../services/chatWebSocket";

export default function BookAudioRequest() {
  const { id } = useParams();

  const [bookTitle, setBookTitle] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const { queue, addToQueue, updateQueueItem } = useTTSQueue();
  const [subscriptionKey, setSubscriptionKey] = useState(0);
  const checkingQueueRef = useRef(false); // Prevent multiple simultaneous checks

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getChaptersByBookId(id);
      if (data && data.length > 0) {
        setBookTitle(data[0].bookTitle);
        // Lọc chỉ hiện những chương có Status là Active hoặc Draft
        const filteredData = data.filter((ch) => 
          ch.status === "Active" || ch.status === "Draft"
        );
        setChapters(
          filteredData.map((ch) => ({
            id: ch.chapterId,
            title: ch.chapterTitle,
            duration: ch.durationSec,
            hasAudio: !!ch.chapterAudioUrl,
          }))
        );
      } else {
        setChapters([]);
      }
    } catch (err) {
      console.error("Lỗi tải chapters:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Check queue status ngay khi component mount hoặc khi quay lại trang
  useEffect(() => {
    // Delay một chút để đảm bảo queue đã load từ localStorage
    const timeoutId = setTimeout(() => {
      if (!loading && queue.length > 0) {
        const processingItems = queue.filter((item) => item.status === "Đang xử lý");
        if (processingItems.length > 0) {
          console.log("🔄 Component mounted/returned, found", processingItems.length, "processing items, will check status");
          // Fetch chapters để trigger check status
          fetchChapters();
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Chạy khi bookId thay đổi (navigate đến trang này)

  // Kiểm tra và cập nhật status của queue items dựa trên audio thực tế từ API
  // Chạy khi component mount hoặc khi chapters/queue thay đổi
  useEffect(() => {
    const checkAndUpdateQueueStatus = async () => {
      if (checkingQueueRef.current || chapters.length === 0 || queue.length === 0) {
        return;
      }

      checkingQueueRef.current = true;
      console.log("🔍 Checking queue items status...", { queueLength: queue.length, chaptersLength: chapters.length });

      try {
        // Lấy các queue items đang "Đang xử lý"
        const processingItems = queue.filter((item) => item.status === "Đang xử lý");
        
        if (processingItems.length === 0) {
          checkingQueueRef.current = false;
          return;
        }

        // Check từng item bằng cách gọi API getChapterAudios
        for (const queueItem of processingItems) {
          try {
            const audioResponse = await getChapterAudios(queueItem.id);
            const audios = audioResponse?.success && audioResponse?.data ? audioResponse.data : [];
            
            // Nếu có voiceId trong queue item, check audio với giọng đó
            // Nếu không có voiceId, chỉ cần check có audio nào không
            let hasMatchingAudio = false;
            if (queueItem.voiceId && audios.length > 0) {
              // Check audio với giọng đã chọn
              hasMatchingAudio = audios.some(audio => 
                audio.voiceName === queueItem.voiceId || audio.voiceName === queueItem.voiceName
              );
            } else if (audios.length > 0) {
              // Nếu không có voiceId, chỉ cần có audio là đủ
              hasMatchingAudio = true;
            }
            
            if (hasMatchingAudio) {
              console.log("✅ Found audio for chapter:", queueItem.id, "voice:", queueItem.voiceId, "Updating status to completed");
              updateQueueItem(queueItem.id, {
                status: "Hoàn thành",
                progress: 100,
                completedAt: new Date().toISOString(),
              });
            } else {
              console.log("⏳ No matching audio found yet for chapter:", queueItem.id, "voice:", queueItem.voiceId);
            }
          } catch (error) {
            console.error(`Error checking audio for chapter ${queueItem.id}:`, error);
          }
        }
      } catch (error) {
        console.error("Error checking queue status:", error);
      } finally {
        checkingQueueRef.current = false;
      }
    };

    // Chạy check sau một delay nhỏ để đảm bảo component đã mount xong và chapters đã load
    const timeoutId = setTimeout(() => {
      if (!loading) {
        checkAndUpdateQueueStatus();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, queue.length, loading]); // Chạy khi chapters, queue length, hoặc loading state thay đổi

  // Lắng nghe notification để cập nhật status real-time
  useEffect(() => {
    // Connect to SignalR if not already connected
    chatWebSocket.connect();

    // Subscribe to notification events
    const unsubscribe = chatWebSocket.onNotification((notification) => {
      console.log("🔔 Notification received in BookAudioRequest:", notification);
      
      // Kiểm tra nếu notification liên quan đến audio conversion
      // Có thể check notification type hoặc body để xác định
      if (notification.type === "BOOK_PURCHASE" || notification.body?.includes("audio") || notification.body?.includes("chuyển đổi")) {
        console.log("🔄 Audio-related notification, refreshing chapters and checking queue...");
        // Refresh chapters để lấy dữ liệu mới nhất
        fetchChapters();
        
        // Sau khi fetch chapters, useEffect trên sẽ tự động check và update queue
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchChapters]);

  const handleStartQueue = (chapterId, voiceInfo = {}) => {
    const chapterTitle = chapters.find((c) => c.id === chapterId)?.title;
    addToQueue({
      id: chapterId,
      chapter: chapterTitle,
      status: "Đang xử lý",
      progress: 0,
      voiceName: voiceInfo.voiceName || "Chưa xác định",
      voiceId: voiceInfo.voiceId,
      speed: voiceInfo.speed,
      timestamp: new Date().toISOString(), // Thêm timestamp để track
    });
  };

  const handleCompleteQueue = (chapterId, success = true) => {
    console.log("🔄 Updating queue item:", chapterId, "success:", success);
    
    updateQueueItem(chapterId, {
      status: success ? "Hoàn thành" : "Chuyển đổi thất bại",
      progress: success ? 100 : 0,
      completedAt: success ? new Date().toISOString() : null,
    });

    fetchChapters();
    
    // Refresh subscription status
    if (success) {
      setSubscriptionKey(prev => prev + 1);
    }
  };

  return (
    <div className="p-6 text-white">
      <Link
        to="/owner/books"
        className="inline-block px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white mb-4"
      >
        ← Quay lại sách
      </Link>

      <h1 className="text-2xl font-bold mb-2">Yêu cầu Audio (TTS)</h1>
      <p className="text-gray-400 mb-6">
        Tạo audio cho sách:{" "}
        <span className="text-orange-400 font-semibold">
          {bookTitle || "Đang tải..."}
        </span>
      </p>

      {loading ? (
        <div className="text-gray-400 italic">Đang tải danh sách chương...</div>
      ) : chapters.length === 0 ? (
        <div className="text-gray-400 italic">
          Chưa có chương nào trong sách này.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <ChapterSelector
              chapters={chapters}
              selected={selectedChapter}
              setSelected={setSelectedChapter}
            />
            <VoiceConfig
              chapterId={selectedChapter}
              onStartQueue={handleStartQueue}
              onCompleteQueue={handleCompleteQueue}
              onRefreshChapters={fetchChapters}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <SubscriptionStatus key={subscriptionKey} />
            <ChapterAudioList 
              chapterId={selectedChapter}
              onRefreshChapters={fetchChapters}
            />
            <TTSQueue queue={queue} />
            <div className="bg-slate-800 rounded-lg p-4">
              <h2 className="font-semibold mb-3">Lưu ý về TTS</h2>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Thời gian xử lý: 5–15 phút / chương tùy độ dài.</li>
                <li>Audio được phát trực tuyến, không tải xuống.</li>
                <li>Chất lượng: MP3 128kbps.</li>
                <li>Giọng đọc sử dụng dịch vụ FPT.AI.</li>
                <li>Chương {'>'} 10,000 ký tự sẽ trừ 2 lượt, {'<='} 10,000 ký tự trừ 1 lượt.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
