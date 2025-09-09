import { useState, useEffect } from "react";
import ReaderHeader from "./ReaderHeader";
import ReaderSettings from "./ReaderSettings";
import ReaderBookmarks from "./ReaderBookmarks";
import ReaderContents from "./ReaderContents";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

export default function BookReader({ bookId }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("serif");
  const [theme, setTheme] = useState("dark");
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const book = {
    id: parseInt(bookId),
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    totalPages: 320,
    currentChapter: "Chương 1: Những Nguyên Tắc Cơ Bản Trong Giao Tiếp",
  };

  // Theme setup
  const themes = {
    dark: { bg: "bg-gray-900", text: "text-white", contentBg: "bg-gray-800" },
    light: { bg: "bg-white", text: "text-gray-900", contentBg: "bg-gray-50" },
    sepia: {
      bg: "bg-yellow-50",
      text: "text-amber-900",
      contentBg: "bg-yellow-100",
    },
  };
  const currentTheme = themes[theme];

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Add/remove bookmarks
  const addBookmark = () => {
    if (!bookmarks.includes(currentPage)) {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
    }
  };
  const removeBookmark = (page) => {
    setBookmarks(bookmarks.filter((p) => p !== page));
  };

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Header */}
      <ReaderHeader
        book={book}
        currentPage={currentPage}
        bookmarks={bookmarks}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        setShowSettings={setShowSettings}
        setShowBookmarks={setShowBookmarks}
        setShowContents={setShowContents}
        addBookmark={addBookmark}
      />

      {/* Nội dung chính (sample) */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">{book.currentChapter}</h2>
        <p style={{ fontSize: `${fontSize}px` }} className={fontFamily}>
          Chương 1: Những Nguyên Tắc Cơ Bản Trong Giao Tiếp...

Nếu bạn muốn thu thập mật ong, đừng đá đổ tổ ong. Tương tự, nếu bạn muốn khiến con người thích bạn, đừng chỉ trích, đừng kết án, đừng than phiền về họ.

Khi chúng ta phải đối phó với con người, hãy nhớ rằng chúng ta không đối phó với những sinh vật có lý trí, mà chúng ta đang đối phó với những sinh vật cảm xúc, những sinh vật được thúc đẩy bởi niềm kiêu hãnh và tự ái.

---

### Nguyên Tắc Thứ Nhất: Đừng Chỉ Trích, Kết Án Hay Than Phiền
Việc chỉ trích là vô ích vì nó khiến người ta phải phòng thủ và thường khiến họ cố gắng biện minh cho mình.  
Việc chỉ trích cũng nguy hiểm vì nó làm tổn thương lòng tự trọng quý báu của một người, làm tổn hại đến cảm giác quan trọng của họ và gây ra sự phẫn nộ.

*"Tôi sẽ không nói điều xấu về bất kỳ ai... và tôi sẽ nói tất cả điều tốt mà tôi biết về mọi người."*  
— Benjamin Franklin

Thay vì chỉ trích, hãy cố gắng hiểu họ. Hãy tìm hiểu **tại sao** họ làm những gì họ làm.  
Điều này mang lại lợi ích và thú vị hơn nhiều so với việc chỉ trích; và nó sẽ tạo ra **sự cảm thông, kiên nhẫn và lòng tốt**.

---

### Câu Chuyện Thực Tế
Bob Hoover, một phi công thử nghiệm nổi tiếng và người biểu diễn acrobatic thường xuyên, đang bay trở về Los Angeles từ một buổi biểu diễn hàng không ở San Diego.  
Như được báo cáo trong tạp chí *Reader's Digest*, ở độ cao 300 feet, **cả hai động cơ của máy bay đột nhiên dừng hoạt động**.

Bằng kỹ năng và kinh nghiệm tuyệt vời, Bob đã hạ cánh máy bay an toàn, mặc dù máy bay bị hư hại nặng.  
May mắn là **không có ai bị thương**.

Điều đầu tiên Bob làm sau khi hạ cánh khẩn cấp là **kiểm tra bình nhiên liệu của máy bay**.  
Đúng như dự đoán, chiếc máy bay World War II với động cơ piston **đã bị đổ nhầm nhiên liệu máy bay phản lực**.

Khi trở lại sân bay, Bob gặp người thợ máy trẻ tuổi đã mắc lỗi này.  
Người thợ máy **đang khóc nức nở** — anh ta biết mình vừa khiến một chiếc máy bay đắt tiền bị hỏng và có thể đã khiến **ba người thiệt mạng**.

Bạn nghĩ Bob Hoover đã phản ứng như thế nào?  
Anh ta có **la mắng hoặc chỉ trích** người thợ máy không? **Không!**

Thay vào đó, Bob ôm lấy người thợ máy và nói:

"Để chứng minh cho anh biết rằng tôi chắc chắn anh sẽ không bao giờ mắc sai lầm này nữa,  
tôi muốn chính anh tiếp nhiên liệu cho máy bay của tôi vào ngày mai.
          {/* (đoạn text mô tả giữ nguyên như bạn viết) */}
        </p>

        {/* Navigation */}
        <div className="flex justify-between mt-8 items-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="flex items-center gap-2 px-4 py-2 bg-orange-700 hover:bg-gray-600 rounded"
          >
            <RiArrowLeftSLine />
            Trang trước
          </button>

          <span>
            {currentPage} / {book.totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage(Math.min(book.totalPages, currentPage + 1))
            }
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-gray-600 rounded"
          >
            Trang sau
            <RiArrowRightSLine />
          </button>
        </div>
      </main>

      {/* Panels */}
      {showSettings && (
        <ReaderSettings
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          theme={theme}
          setTheme={setTheme}
          close={() => setShowSettings(false)}
        />
      )}

      {showBookmarks && (
        <ReaderBookmarks
          bookmarks={bookmarks}
          removeBookmark={removeBookmark}
          setCurrentPage={setCurrentPage}
          close={() => setShowBookmarks(false)}
        />
      )}

      {showContents && (
        <ReaderContents
          setCurrentPage={setCurrentPage}
          close={() => setShowContents(false)}
        />
      )}
    </div>
  );
}
