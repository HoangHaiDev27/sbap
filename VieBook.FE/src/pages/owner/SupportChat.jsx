import { useState, useEffect, useRef } from "react";
import { RiSendPlane2Line } from "react-icons/ri";
import { getUserName, getUserId } from "../../api/authApi";
import { getChatHistory, sendChatMessage, startSupportChat } from "../../api/chatApi";
import { toast } from "react-toastify";
import chatWebSocket from "../../services/chatWebSocket";

// Đối tượng chăm sóc khách hàng (nhân viên hỗ trợ)
const customerSupport = {
  id: "support",
  name: "Chăm sóc khách hàng",
  role: "Nhân viên hỗ trợ",
  avatar: "https://i.pravatar.cc/50?img=10",
  isOnline: true,
};

export default function SupportChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const ownerName = getUserName() || "Book Owner";
  const currentUserId = parseInt(getUserId());

  // Cuộn xuống cuối khi có tin nhắn mới (chỉ khi không đang typing)
  useEffect(() => {
    // Delay scroll để tránh conflict với input focus
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Load conversation khi component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        console.log("Starting support chat initialization...");
        
        // Bắt đầu conversation với support
        const result = await startSupportChat();
        console.log("Start support chat result:", result);
        
        setConversationId(result.conversationId);
        console.log("ConversationId set to:", result.conversationId);
        
        // Load lịch sử chat
        const history = await getChatHistory(result.conversationId);
        console.log("Chat history loaded:", history);
        
        if (history.messages && history.messages.length > 0) {
          const formattedMessages = history.messages.map(msg => ({
            sender: msg.senderId === currentUserId ? "me" : "staff",
            text: msg.messageText,
            time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar
          }));
          setMessages(formattedMessages);
        } else {
          // Tin nhắn chào mừng mặc định
          setMessages([{
            sender: "staff",
            text: "Xin chào! Tôi là nhân viên chăm sóc khách hàng của VieBook. Tôi có thể giúp gì cho bạn?",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error(error.message || "Không thể khởi tạo chat");
        // Show default message even on error
        setMessages([{
          sender: "staff",
          text: "Xin chào! Tôi là nhân viên chăm sóc khách hàng của VieBook. Tôi có thể giúp gì cho bạn?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      initializeChat();
    }
  }, [currentUserId]);
  
  // WebSocket real-time connection
  useEffect(() => {
    // Kết nối WebSocket khi component mount
    chatWebSocket.connect();
    
    return () => {
      // Ngắt kết nối khi component unmount
      if (conversationId) {
        chatWebSocket.leaveConversation(conversationId);
      }
    };
  }, []);

  // Join conversation và lắng nghe tin nhắn mới
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    // Join vào conversation để nhận tin nhắn real-time
    chatWebSocket.joinConversation(conversationId, [currentUserId]);
    
    // Lắng nghe tin nhắn mới từ WebSocket
    const unsubscribe = chatWebSocket.onMessage((message) => {
      console.log("📨 Owner - Received message via WebSocket:", message);
      
      // Chỉ cập nhật nếu tin nhắn thuộc conversation này
      if (message.conversationId === conversationId) {
        const newMessage = {
          sender: message.senderId === currentUserId ? "me" : "staff",
          text: message.messageText,
          time: new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sentAt: message.sentAt,
          senderName: message.senderName,
          senderAvatar: message.senderAvatar,
          senderRole: message.senderRole,
          messageId: message.messageId
        };
        
        // Thêm tin nhắn mới vào danh sách (tránh duplicate)
        setMessages(prev => {
          // Bỏ qua các temp messages
          const nonTemp = prev.filter(m => !m.isTemp);

          // Nếu có messageId, ưu tiên dùng để chống duplicate
          if (newMessage.messageId && nonTemp.some(m => m.messageId === newMessage.messageId)) {
            return nonTemp; // đã có rồi
          }

          // Fallback: so sánh text + sender + gần thời gian theo timestamp sentAt
          const isDuplicate = nonTemp.some(m =>
            m.text === newMessage.text && m.sender === newMessage.sender &&
            (m.sentAt && newMessage.sentAt) && Math.abs(new Date(m.sentAt) - new Date(newMessage.sentAt)) < 5000
          );
          if (isDuplicate) return nonTemp;

          return [...nonTemp, newMessage];
        });
      }
    });
    
    return () => {
      unsubscribe();
      chatWebSocket.leaveConversation(conversationId);
    };
  }, [conversationId, currentUserId]);

  const quickReplies = ["Cảm ơn bạn!", "Tôi hiểu rồi", "Cần thêm thông tin", "Đã xong chưa?", "Ok, không vấn đề"];

  const sendMessage = async (msgText) => {
    const text = msgText || input.trim();
    if (!text || sending) return;
    
    // Nếu chưa có conversationId, báo lỗi
    if (!conversationId) {
      toast.error("Đang khởi tạo chat, vui lòng đợi...");
      return;
    }
    
    const tempId = `temp-${Date.now()}`;
    const tempMsg = { 
      sender: "me", 
      text, 
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isTemp: true,
      tempId
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    setSending(true);
    
    try {
      const result = await sendChatMessage({
        conversationId: conversationId,
        messageText: text
      });
      console.log("Message sent successfully:", result);
      // Replace temp with server message to tránh phụ thuộc hoàn toàn vào WS
      const serverMsg = {
        sender: result.senderId === currentUserId ? "me" : "staff",
        text: result.messageText,
        time: new Date(result.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentAt: result.sentAt,
        senderName: result.senderName,
        senderAvatar: result.senderAvatar,
        senderRole: result.senderRole,
        messageId: result.messageId
      };

      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.tempId !== tempId);
        if (serverMsg.messageId && withoutTemp.some(m => m.messageId === serverMsg.messageId)) {
          return withoutTemp; // đã được WS thêm vào
        }
        return [...withoutTemp, serverMsg];
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Không thể gửi tin nhắn");
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] bg-slate-900 text-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-900 text-white overflow-hidden">
      {/* Chat window - Full width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3 flex-shrink-0 bg-slate-900">
          <img 
            src="/logo.png" 
            alt="VieBook Support" 
            className="w-10 h-10 rounded-full" 
          />
          <div>
            <h2 className="font-semibold">{customerSupport.name}</h2>
            <p className="text-xs text-green-400">
              {customerSupport.role} • {customerSupport.isOnline ? "Đang online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 scrollbar-hide scroll-smooth">
          {messages.map((m, i) => (
            <div key={`msg-${i}`} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className="flex items-end gap-2 max-w-[70%]">
                {m.sender === "staff" && (
                  <img 
                    src="/logo.png" 
                    alt="VieBook Support" 
                    className="w-8 h-8 rounded-full flex-shrink-0" 
                  />
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl break-words border ${
                      m.sender === "me" 
                        ? "bg-orange-500 text-white rounded-br-sm border-orange-400" 
                        : "bg-slate-800 text-gray-200 rounded-bl-sm border-slate-600"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 px-2">
                    {m.time}
                  </div>
                </div>
                {m.sender === "me" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>

        {/* Quick replies */}
        <div className="px-4 py-2 flex gap-2 justify-center border-t border-slate-700 bg-slate-900 flex-shrink-0 overflow-x-auto">
          {quickReplies.map((qr, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                sendMessage(qr);
              }}
              disabled={sending || !conversationId}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-xs whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 flex items-center gap-3 bg-slate-900 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Nhập tin nhắn..."
            disabled={sending || !conversationId}
            className="flex-1 px-4 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-gray-400"
          />
          <button 
            onClick={() => sendMessage()} 
            className="p-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            disabled={!input.trim() || sending || !conversationId}
            title={!conversationId ? "Đang khởi tạo chat..." : "Gửi tin nhắn"}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <RiSendPlane2Line size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
