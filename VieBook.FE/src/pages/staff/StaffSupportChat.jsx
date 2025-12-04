import { useState, useEffect, useRef } from "react";
import { RiSendPlane2Line, RiSearchLine } from "react-icons/ri";
import { getUserName, getUserId } from "../../api/authApi";
import { getOwnerListForStaff, getChatWithOwner, sendStaffMessage, searchOwnersForStaff, startConversationWithOwnerForStaff } from "../../api/chatApi";
import { toast } from "react-toastify";
import chatWebSocket from "../../services/chatWebSocket";

// Helper function to convert time string to seconds for comparison
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const [time] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 3600) + (minutes * 60);
};

export default function StaffSupportChat() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingChatHistory, setLoadingChatHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const joinedConversationsRef = useRef(new Set());
  const loadingChatHistoryRef = useRef(false);
  const staffName = getUserName() || "Staff";
  const currentUserId = parseInt(getUserId());

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // Load danh sách owners
  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoading(true);
        const data = await getOwnerListForStaff();
        setOwners(data);
      } catch (error) {
        console.error("Error loading owners:", error);
        toast.error(error.message || "Không thể tải danh sách owners");
      } finally {
        setLoading(false);
      }
    };

    loadOwners();
  }, []);

  // Join tất cả conversations để nhận message cho sidebar ngay cả khi không mở
  useEffect(() => {
    if (!currentUserId || !owners || owners.length === 0) return;

    owners.forEach((o) => {
      if (o.conversationId && !joinedConversationsRef.current.has(o.conversationId)) {
        chatWebSocket.joinConversation(o.conversationId, [currentUserId]);
        joinedConversationsRef.current.add(o.conversationId);
      }
    });

    return () => {
      // cleanup only on unmount: leave all joined groups
      // (không rời khi owners thay đổi để tránh churn kết nối)
    };
  }, [owners, currentUserId]);

  // WebSocket real-time connection và lắng nghe new conversations
  useEffect(() => {
    // Kết nối WebSocket khi component mount
    chatWebSocket.connect();
    
    // Lắng nghe new conversation events
    const unsubscribeNewConversation = chatWebSocket.onNewConversation(async (data) => {
      console.log("🆕 Staff - New conversation notification:", data);
      
      // Join conversation ngay để nhận tin nhắn real-time (kể cả tin nhắn đầu tiên)
      if (data.conversationId && !joinedConversationsRef.current.has(data.conversationId)) {
        try {
          await chatWebSocket.joinConversation(data.conversationId, [currentUserId]);
          joinedConversationsRef.current.add(data.conversationId);
          console.log(`📥 Joined new conversation ${data.conversationId}`);
        } catch (error) {
          console.error("Error joining new conversation:", error);
        }
      }
      
      // Optimistic update: thêm conversation mới vào sidebar ngay lập tức
      setOwners(prev => {
        // Kiểm tra xem conversation đã có trong danh sách chưa
        const exists = prev.some(o => o.conversationId === data.conversationId);
        if (exists) {
          console.log("🔄 Conversation already exists in sidebar, will reload");
          return prev;
        }
        
        // Thêm conversation mới vào đầu danh sách
        const newOwner = {
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          ownerAvatar: data.ownerAvatar,
          conversationId: data.conversationId,
          lastMessageText: null,
          lastMessageTime: new Date().toISOString(),
          lastRepliedByStaffName: null,
          lastRepliedByStaffId: null
        };
        
        console.log("➕ Adding new conversation optimistically to sidebar:", newOwner);
        return [newOwner, ...prev];
      });
      
      // Reload danh sách owners từ server để đảm bảo dữ liệu chính xác
      try {
        const updatedOwners = await getOwnerListForStaff();
        console.log("🔄 Reloaded owners list after new conversation:", updatedOwners.length);
        
        // Cập nhật state với danh sách mới từ server
        setOwners(updatedOwners);
        
        // Đảm bảo conversation đã được join
        const newOwner = updatedOwners.find(o => o.conversationId === data.conversationId);
        if (newOwner && data.conversationId && !joinedConversationsRef.current.has(data.conversationId)) {
          try {
            await chatWebSocket.joinConversation(data.conversationId, [currentUserId]);
            joinedConversationsRef.current.add(data.conversationId);
            console.log(`📥 Re-joined conversation ${data.conversationId} after reload`);
          } catch (error) {
            console.error("Error re-joining conversation:", error);
          }
        }
        
        toast.info(`Conversation mới từ ${data.ownerName || data.ownerEmail}`);
      } catch (error) {
        console.error("Error reloading owners after new conversation:", error);
        // Không hiển thị error toast vì đã có optimistic update
        console.warn("⚠️ Failed to reload owners list, but optimistic update was applied");
      }
    });
    
    return () => {
      // Ngắt kết nối khi component unmount
      unsubscribeNewConversation();
      if (conversationId) {
        chatWebSocket.leaveConversation(conversationId);
      }
    };
  }, [conversationId, currentUserId]);

  // Cập nhật sidebar theo tin nhắn real-time (ReceiveMessage)
  useEffect(() => {
    const unsubscribeSidebarUpdate = chatWebSocket.onMessage(async (message) => {
      console.log("📨 Staff - Received message for sidebar update:", message);
      
      // Kiểm tra xem conversationId này có trong danh sách owners không
      setOwners((prev) => {
        if (!Array.isArray(prev) || prev.length === 0) {
          // Nếu danh sách rỗng, reload lại và join conversation
          console.log("🔄 Owners list is empty, reloading...");
          getOwnerListForStaff().then((updatedOwners) => {
            setOwners(updatedOwners);
            // Join conversation để nhận tin nhắn
            if (message.conversationId && !joinedConversationsRef.current.has(message.conversationId)) {
              chatWebSocket.joinConversation(message.conversationId, [currentUserId]);
              joinedConversationsRef.current.add(message.conversationId);
              console.log(`📥 Joined conversation ${message.conversationId} after reload`);
            }
          });
          return prev;
        }

        const ownerExists = prev.some(owner => owner.conversationId === message.conversationId);
        
        // Nếu conversation chưa có trong danh sách, join conversation ngay và reload danh sách owners
        if (!ownerExists && message.conversationId) {
          console.log(`🆕 New conversation ${message.conversationId} detected in message, joining and reloading owners list`);
          
          // Optimistic update: thêm conversation mới vào sidebar ngay lập tức
          // Note: senderId có thể là owner hoặc staff, nên sẽ reload từ server để lấy đúng ownerId
          const tempOwnerId = message.senderRole === "owner" ? message.senderId : null;
          const newOwnerFromMessage = {
            ownerId: tempOwnerId || 0, // Sẽ được update sau khi reload
            ownerName: message.senderRole === "owner" ? message.senderName : "Unknown Owner",
            ownerEmail: null,
            ownerAvatar: message.senderAvatar,
            conversationId: message.conversationId,
            lastMessageText: message.messageText,
            lastMessageTime: message.sentAt,
            lastRepliedByStaffName: message.senderRole === "staff" ? message.senderName : null,
            lastRepliedByStaffId: message.senderRole === "staff" ? message.senderId : null
          };
          
          // Thêm vào đầu danh sách tạm thời
          const tempUpdated = [newOwnerFromMessage, ...prev];
          
          // Join conversation ngay để đảm bảo nhận được tin nhắn tiếp theo
          if (!joinedConversationsRef.current.has(message.conversationId)) {
            chatWebSocket.joinConversation(message.conversationId, [currentUserId]);
            joinedConversationsRef.current.add(message.conversationId);
            console.log(`📥 Joined new conversation ${message.conversationId} immediately`);
          }
          
          // Reload danh sách owners từ server để đảm bảo dữ liệu chính xác
          getOwnerListForStaff().then((updatedOwners) => {
            console.log(`🔄 Reloaded owners list after detecting new conversation in message: ${updatedOwners.length} owners`);
            setOwners(updatedOwners);
            // Đảm bảo conversation đã được join
            if (updatedOwners.some(o => o.conversationId === message.conversationId)) {
              if (!joinedConversationsRef.current.has(message.conversationId)) {
                chatWebSocket.joinConversation(message.conversationId, [currentUserId]);
                joinedConversationsRef.current.add(message.conversationId);
              }
            }
          }).catch(error => {
            console.error("Error reloading owners after new conversation detected:", error);
          });
          
          // Trả về danh sách tạm thời với conversation mới
          return tempUpdated;
        }

        // Cập nhật last message và reorder list cho owner tương ứng
        const updated = prev.map((owner) => {
          if (owner.conversationId === message.conversationId) {
            return {
              ...owner,
              lastMessageText: message.messageText,
              lastMessageTime: message.sentAt,
              lastRepliedByStaffName: message.senderId !== owner.ownerId ? message.senderName : owner.lastRepliedByStaffName,
              lastRepliedByStaffId: message.senderId !== owner.ownerId ? message.senderId : owner.lastRepliedByStaffId,
            };
          }
          return owner;
        });

        // Reorder: most recent conversation first
        return [...updated].sort(
          (a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
        );
      });
    });

    return () => unsubscribeSidebarUpdate();
  }, [currentUserId]);

  // Load chat history khi chọn owner và thiết lập WebSocket
  useEffect(() => {
    if (!selectedOwner) {
      setMessages([]);
      setConversationId(null);
      return;
    }

    const loadChatHistory = async () => {
      // Tránh load nhiều lần cùng lúc
      if (loadingChatHistoryRef.current) {
        console.log("⏳ Chat history is already loading, skipping...");
        return;
      }

      try {
        loadingChatHistoryRef.current = true;
        setLoadingChatHistory(true);
        
        console.log(`🔄 Staff loading chat with owner ${selectedOwner.ownerId}`);
        
        // Nếu owner chưa có conversation, tạo mới
        if (!selectedOwner.conversationId) {
          console.log("📝 Owner chưa có conversation, sẽ tạo khi owner gửi tin nhắn đầu tiên");
          setMessages([]);
          setConversationId(null);
          return;
        }
        
        // Lưu ownerId và conversationId hiện tại để kiểm tra race condition
        const currentOwnerId = selectedOwner.ownerId;
        const currentConversationId = selectedOwner.conversationId;
        
        const history = await getChatWithOwner(currentOwnerId);
        console.log("📨 Staff - Chat History Response:", history);
        console.log("👤 Staff - Current User ID:", currentUserId);
        console.log("💬 Expected ConversationId:", currentConversationId);
        console.log("💬 Received ConversationId:", history.conversationId);
        
        // Kiểm tra xem selectedOwner có thay đổi trong lúc load không (race condition)
        if (!selectedOwner || selectedOwner.ownerId !== currentOwnerId) {
          console.log("⚠️ Selected owner changed during load, ignoring results");
          return;
        }
        
        // Sử dụng conversationId từ API hoặc từ selectedOwner
        const finalConversationId = history.conversationId || currentConversationId;
        
        if (history.messages && history.messages.length > 0) {
          const formattedMessages = history.messages.map(msg => {
            console.log(`Message from ${msg.senderName} (ID: ${msg.senderId}), Current: ${currentUserId}, Match: ${msg.senderId === currentUserId}`);
            return {
              sender: msg.senderId === currentUserId ? "me" : "other",
              senderType: msg.senderId === selectedOwner.ownerId ? "owner" : "staff",
              text: msg.messageText,
              time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              senderName: msg.senderName,
              senderAvatar: msg.senderAvatar,
              messageId: msg.messageId
            };
          });
          console.log(`📝 Setting ${formattedMessages.length} messages with conversationId: ${finalConversationId}`);
          setMessages(formattedMessages);
          setConversationId(finalConversationId);
        } else {
          console.log("📝 No messages in history");
          // Vẫn set conversationId để có thể gửi tin nhắn
          if (finalConversationId) {
            console.log("📝 Setting conversationId even with no messages:", finalConversationId);
            setConversationId(finalConversationId);
          }
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        toast.error(error.message || "Không thể tải lịch sử chat");
        setMessages([]);
        setConversationId(null);
      } finally {
        setLoadingChatHistory(false);
        loadingChatHistoryRef.current = false;
      }
    };

    loadChatHistory();
  }, [selectedOwner, currentUserId]);

  // Join conversation và lắng nghe tin nhắn mới qua WebSocket
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    
    // Join vào conversation để nhận tin nhắn real-time
    chatWebSocket.joinConversation(conversationId, [currentUserId]);
    
    // Lắng nghe tin nhắn mới từ WebSocket
    const unsubscribe = chatWebSocket.onMessage((message) => {
      console.log("📨 Staff - Received message via WebSocket:", message);
      
      // Chỉ cập nhật nếu tin nhắn thuộc conversation này
      if (message.conversationId === conversationId) {
        const newMessage = {
          sender: message.senderId === currentUserId ? "me" : "other",
          senderType: message.senderId === selectedOwner.ownerId ? "owner" : "staff",
          text: message.messageText,
          time: new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          senderName: message.senderName,
          senderAvatar: message.senderAvatar,
          messageId: message.messageId
        };
        
        // Thêm tin nhắn mới vào danh sách (tránh duplicate)
        setMessages(prev => {
          // Bỏ qua temp messages
          const nonTempMessages = prev.filter(m => !m.isTemp);
          
          // Kiểm tra xem tin nhắn đã tồn tại chưa
          const isDuplicate = nonTempMessages.some(m => 
            // Ưu tiên check bằng messageId nếu có
            (m.messageId && m.messageId === newMessage.messageId) ||
            // Fallback: check bằng text + sender + time gần nhau
            (m.text === newMessage.text && 
             m.sender === newMessage.sender &&
             Math.abs(parseTimeToSeconds(m.time) - parseTimeToSeconds(newMessage.time)) < 5)
          );
          
          if (isDuplicate) {
            console.log("🔄 Duplicate message detected, skipping...");
            return prev;
          }
          
          return [...nonTempMessages, newMessage];
        });
      }
    });
    
    return () => {
      unsubscribe();
      chatWebSocket.leaveConversation(conversationId);
    };
  }, [conversationId, currentUserId]);

  const quickReplies = [
    "Cảm ơn bạn!",
    "Tôi sẽ kiểm tra sớm.",
    "Đã giải quyết xong.",
    "Cần thêm thông tin?",
    "Chúc bạn ngày tốt!"
  ];

  const sendMessage = async (msgText) => {
    const text = msgText || input.trim();
    if (!text || !selectedOwner || sending) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMsg = { 
      sender: "me", 
      senderType: "staff",
      text, 
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderName: staffName,
      tempId: tempId,
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    setSending(true);
    
    try {
      await sendStaffMessage({
        conversationId: conversationId || selectedOwner.conversationId,
        recipientId: selectedOwner.ownerId,
        messageText: text
      });
      
      // Remove temp message after successful send
      // WebSocket will broadcast the real message
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Không thể gửi tin nhắn");
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.tempId !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Merge results: ưu tiên owners hiện có; append thêm kết quả tìm kiếm không trùng
  const baseFiltered = owners.filter(owner => 
    owner.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const extraFromSearch = searchResults.filter(r => !owners.some(o => o.ownerId === r.ownerId));
  const filteredOwners = [...baseFiltered, ...extraFromSearch];

  // Tìm owner theo query (debounce)
  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchOwnersForStaff(searchQuery);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (e) {
        console.warn("Search owners failed:", e.message);
      }
    }, 300);
    return () => searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  async function startConversationIfNeeded(owner) {
    if (owner.conversationId) {
      setSelectedOwner(owner);
      return;
    }
    try {
      const resp = await startConversationWithOwnerForStaff(owner.ownerId);
      const newConversationId = resp.conversationId;
      // Optimistic: thêm vào sidebar
      setOwners(prev => {
        const exists = prev.some(o => o.ownerId === owner.ownerId);
        const item = {
          ...owner,
          conversationId: newConversationId,
          lastMessageText: null,
          lastMessageTime: new Date().toISOString(),
        };
        return exists ? prev.map(o => o.ownerId === owner.ownerId ? item : o) : [item, ...prev];
      });
      // Join và chọn
      chatWebSocket.joinConversation(newConversationId, [currentUserId]);
      setSelectedOwner({ ...owner, conversationId: newConversationId });
    } catch (e) {
      toast.error(e.message || "Không thể khởi tạo cuộc trò chuyện");
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] bg-slate-900 text-white items-center justify-center mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-900 text-white overflow-hidden mt-20">
      {/* Sidebar - Danh sách Owners */}
      <div className="w-80 lg:w-96 border-r border-slate-700 flex flex-col bg-slate-900 flex-shrink-0 h-full">
        <div className="p-4 font-bold text-lg border-b border-slate-700 flex-shrink-0">Danh sách Book Owners</div>
        
        {/* Search box */}
        <div className="p-3 border-b border-slate-800 flex-shrink-0">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
        </div>

        {/* Danh sách owners */}
        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
          {filteredOwners.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {searchQuery ? "Không tìm thấy owner" : "Chưa có owner nào"}
            </div>
          ) : (
            filteredOwners.map((owner) => (
              <div
                key={owner.ownerId}
                onClick={() => startConversationIfNeeded(owner)}
                className={`flex items-start p-4 cursor-pointer hover:bg-slate-800 border-b border-slate-800 transition-colors flex-shrink-0 ${
                  selectedOwner?.ownerId === owner.ownerId ? "bg-slate-800" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  {owner.ownerAvatar ? (
                    <img 
                      src={owner.ownerAvatar} 
                      alt={owner.ownerName} 
                      className="w-12 h-12 rounded-full border-2 border-slate-700" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                      {owner.ownerName?.charAt(0).toUpperCase() || "O"}
                    </div>
                  )}
                  {owner.conversationId && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold truncate">{owner.ownerName || owner.ownerEmail}</div>
                    {owner.lastMessageTime && (
                      <div className="text-xs text-gray-400 ml-2">
                        {new Date(owner.lastMessageTime).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 truncate">{owner.ownerEmail}</div>
                  {owner.lastMessageText ? (
                    <>
                      <div className="text-sm text-gray-400 truncate mt-1">
                        {owner.lastMessageText}
                      </div>
                      {owner.lastRepliedByStaffName && (
                        <div className="text-xs text-blue-400 mt-1">
                          Trả lời bởi: {owner.lastRepliedByStaffName}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm mt-1">
                      {owner.conversationId ? (
                        <span className="text-gray-500 italic">Chưa có tin nhắn nào</span>
                      ) : (
                        <span className="text-orange-400">Nhấp để bắt đầu trò chuyện</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Staff info */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold">
              {staffName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm">{staffName}</div>
              <div className="text-xs text-green-400">Staff - Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      {selectedOwner ? (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0 bg-slate-900">
            <div className="flex items-center gap-3 min-w-0">
              {selectedOwner.ownerAvatar ? (
                <img 
                  src={selectedOwner.ownerAvatar} 
                  alt={selectedOwner.ownerName} 
                  className="w-10 h-10 rounded-full" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {selectedOwner.ownerName?.charAt(0).toUpperCase() || "O"}
                </div>
              )}
              <div>
                <h2 className="font-semibold">{selectedOwner.ownerName || selectedOwner.ownerEmail}</h2>
                <p className="text-xs text-gray-400">Book Owner</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Thông tin"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 scrollbar-hide scroll-smooth min-h-0">
            {loadingChatHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p>Đang tải lịch sử chat...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>{selectedOwner.conversationId ? "Chưa có tin nhắn nào" : "Chờ owner gửi tin nhắn đầu tiên"}</p>
                  <p className="text-sm mt-2">
                    {selectedOwner.conversationId 
                      ? "Gửi tin nhắn để bắt đầu cuộc trò chuyện" 
                      : "Conversation sẽ được tạo khi owner gửi tin nhắn đầu tiên"
                    }
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={`msg-${i}`} className={`flex ${m.senderType === "staff" ? "justify-end" : "justify-start"}`}>
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {m.senderType === "owner" && (
                      selectedOwner.ownerAvatar ? (
                        <img 
                          src={selectedOwner.ownerAvatar} 
                          alt={selectedOwner.ownerName} 
                          className="w-8 h-8 rounded-full flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {selectedOwner.ownerName?.charAt(0).toUpperCase() || "O"}
                        </div>
                      )
                    )}
                    <div>
                      <div
                        className={`px-4 py-2 rounded-2xl break-words border ${
                          m.senderType === "staff"
                            ? "bg-orange-500 text-white rounded-br-sm border-orange-400"
                            : "bg-slate-800 text-gray-200 rounded-bl-sm border-slate-600"
                        }`}
                      >
                        {m.text}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 px-2 flex justify-between">
                        <span>{m.time}</span>
                        {m.senderType === "staff" && m.senderName && (
                          <span className="opacity-60">{m.senderName}</span>
                        )}
                      </div>
                    </div>
                    {m.senderType === "staff" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {m.senderName?.charAt(0).toUpperCase() || "S"}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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
              disabled={sending}
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
              disabled={sending}
              className="flex-1 px-4 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-gray-400"
            />
            <button 
              onClick={() => sendMessage()} 
              className="p-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              disabled={!input.trim() || sending}
              title="Gửi tin nhắn"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <RiSendPlane2Line size={20} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-900">
          <div className="text-center text-gray-400">
            <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Chọn một Owner để bắt đầu chat</h3>
            <p className="text-sm">Danh sách owner hiển thị bên trái</p>
          </div>
        </div>
      )}
    </div>
  );
}

