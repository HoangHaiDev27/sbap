import { useEffect, useRef, useState } from "react";
import { sendMessage, getChatHistory } from "../../api/chatbaseApi";
import { getUserId } from "../../api/authApi";
import logo from "../../assets/logo.png";

export default function ChatbaseWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const getStorageKey = () => {
    const uid = getUserId() || "guest";
    return `chat_history_${uid}`;
  };
const renderTextWithLinks = (text) => {
  if (!text) return null;

  const lines = text.split(/\n+/);

  return lines.map((line, idx) => {
    const linkRegex = /\[Xem chi tiết\]\((https?:\/\/[^\s)]+)\)/;
    const match = line.match(linkRegex);

    if (match) {
      const url = match[1];

      // Thay toàn bộ đoạn [Xem chi tiết](...) bằng “Link chi tiết: <a>Xem chi tiết</a>”
      line = line.replace(
        linkRegex,
        `<a href="${url}" class="underline text-blue-300 hover:text-blue-100">Xem chi tiết</a>`
      );
    }

    // ✅ Bỏ luôn dấu ** (không hiển thị in đậm)
    line = line.replace(/\*\*/g, "");

    return (
      <div
        key={idx}
        className="mb-1 break-words whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: line }}
      />
    );
  });
};

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load lịch sử khi mở chat (per-user)
  useEffect(() => {
    if (!isOpen) return;

    const key = getStorageKey();
    const localHistory = localStorage.getItem(key);

    if (localHistory) {
      const parsed = JSON.parse(localHistory);
      setMessages(parsed.length > 0 ? parsed : [
        { sender: "bot", text: "Chào mừng bạn đến với trợ lí của VieBook!" }
      ]);
      return;
    }

    (async () => {
      try {
        const data = await getChatHistory();
        if (Array.isArray(data?.history) && data.history.length > 0) {
          setMessages(data.history);
        } else {
          setMessages([
            { sender: "bot", text: "Chào mừng bạn đến với trợ lí của VieBook!" }
          ]);
        }
      } catch {
        setMessages([
          { sender: "bot", text: "Chào mừng bạn đến với trợ lí của VieBook!" }
        ]);
      }
    })();
  }, [isOpen]);

  // Lưu lịch sử chat per-user
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    }
  }, [messages]);

  // Listen auth changes: reset UI on logout / load on login
  useEffect(() => {
    const handleAuthChanged = (e) => {
      const { token } = e.detail || {};
      if (!token) {
        // logout: reset UI
        setMessages([{ sender: "bot", text: "Chào mừng bạn đến với trợ lí của VieBook!" }]);
      } else {
        // login: load per-user history if any
        const key = getStorageKey();
        const localHistory = localStorage.getItem(key);
        if (localHistory) {
          setMessages(JSON.parse(localHistory));
        } else {
          setMessages([{ sender: "bot", text: "Chào mừng bạn đến với trợ lí của VieBook!" }]);
        }
      }
    };

    window.addEventListener("auth:changed", handleAuthChanged);
    return () => window.removeEventListener("auth:changed", handleAuthChanged);
  }, []);


  // Gửi tin nhắn
  const handleSend = async (customText) => {
    const text = customText || input.trim();
    if (!text) return;

    const userMessage = { sender: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Predefined responses
    const predefinedResponses = {
      "Giới thiệu": "📖 Đây là dịch vụ của VieBook – nền tảng hỗ trợ tìm kiếm và gợi ý sách thông minh dành cho bạn!",
      "Vấn đề": "🛠️ Tôi có thể giúp bạn giải quyết các vấn đề liên quan đến việc tìm kiếm, gợi ý và quản lý sách trên VieBook.",
    };

    if (predefinedResponses[text]) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: predefinedResponses[text] },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await sendMessage(text);
      const botText =
        res?.message ||
        res?.response?.text ||
        res?.response ||
        "Không có phản hồi từ VieBook.";

      setMessages((prev) => [...prev, { sender: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Không thể kết nối hỗ trợ của VieBook." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickOptions = ["Giới thiệu", "Vấn đề"];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 text-white p-4 rounded-full shadow-xl hover:bg-orange-700 transition"
          title="Mở Chatbase"
        >
          💬
        </button>
      ) : (
        <div className="w-[400px] h-[500px] bg-[#0f172a] text-gray-100 rounded-xl shadow-2xl flex flex-col border border-gray-700">
          {/* Header */}
          <div className="bg-[#0f172a] text-gray-100 px-4 py-3 flex items-center justify-between rounded-t-xl border-b border-gray-700">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="VieBook Logo"
                className="h-6 w-6 rounded-full border border-gray-600 shadow-sm"
              />
              <span className="font-semibold text-sm tracking-wide">Trợ lý VieBook</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full p-1.5 transition duration-200"
              title="Đóng chat"
            >
              ✖
            </button>
          </div>

          {/* Nội dung chat */}
          <div
            className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed break-words ${
                  msg.sender === "user"
                    ? "bg-orange-500 text-white ml-auto text-start rounded-br-none"
                    : "bg-gray-800 border border-gray-700 text-gray-100 mr-auto text-start rounded-bl-none"
                }`}
                style={{
                    maxWidth: '80%',        // không dài quá khung chat
                    width: 'fit-content',   // co giãn theo nội dung
                    minWidth: '40px',       // tránh quá nhỏ
                    wordBreak: 'break-word',
                    textAlign: 'left'
                }}
              >
                 {renderTextWithLinks(msg.text)}
              </div>
            ))}
            {loading && <div className="italic text-gray-400 text-sm">VieBook đang lọc thông tin...</div>}
            <div ref={chatEndRef}></div>
          </div>

          {/* Nút gợi ý nhanh */}
          <div className="flex flex-wrap gap-2 px-3 pb-2">
            {quickOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(option)}
                className="bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-200 transition"
              >
                {option}
              </button>
            ))}
          </div>

          {/* Ô nhập */}
          <div className="p-2 border-t border-gray-700 flex gap-2 bg-[#1e293b]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
