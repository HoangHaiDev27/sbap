import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "./authApi";

async function handleFetch(url, options = {}, defaultError = "Lỗi khi xử lý yêu cầu") {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = defaultError;
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) return true;
  return res.json();
}

// Lấy danh sách conversations
export async function getConversations() {
  const token = getToken();
  
  return handleFetch(
    API_ENDPOINTS.CHAT.GET_CONVERSATIONS,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể tải danh sách cuộc hội thoại"
  );
}

// Lấy lịch sử chat
export async function getChatHistory(conversationId, page = 1, pageSize = 50) {
  const token = getToken();
  
  return handleFetch(
    `${API_ENDPOINTS.CHAT.GET_CHAT_HISTORY}/${conversationId}/messages?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể tải lịch sử chat"
  );
}

// Gửi tin nhắn
export async function sendChatMessage(messageData) {
  const token = getToken();
  
  return handleFetch(
    API_ENDPOINTS.CHAT.SEND_MESSAGE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    },
    "Không thể gửi tin nhắn"
  );
}

// Bắt đầu chat với support (cho owner)
export async function startSupportChat() {
  const token = getToken();
  
  return handleFetch(
    API_ENDPOINTS.CHAT.START_SUPPORT_CHAT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể bắt đầu chat với hỗ trợ"
  );
}

// ===== STAFF CHAT APIs =====

// Lấy danh sách owners (cho staff)
export async function getOwnerListForStaff() {
  const token = getToken();
  
  return handleFetch(
    API_ENDPOINTS.CHAT.STAFF.GET_OWNERS,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể tải danh sách owners"
  );
}

// Lấy lịch sử chat với owner (cho staff)
export async function getChatWithOwner(ownerId, page = 1, pageSize = 50) {
  const token = getToken();
  
  return handleFetch(
    `${API_ENDPOINTS.CHAT.STAFF.GET_OWNER_MESSAGES}/${ownerId}/messages?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể tải lịch sử chat với owner"
  );
}

// Gửi tin nhắn (cho staff)
export async function sendStaffMessage(messageData) {
  const token = getToken();
  
  return handleFetch(
    API_ENDPOINTS.CHAT.STAFF.SEND_MESSAGE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    },
    "Không thể gửi tin nhắn"
  );
}

// Tìm kiếm owners (cho staff)
export async function searchOwnersForStaff(query) {
  const token = getToken();
  const q = encodeURIComponent(query || "");
  return handleFetch(
    `${API_ENDPOINTS.CHAT.STAFF.SEARCH_OWNERS}?q=${q}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể tìm kiếm owner"
  );
}

// Staff khởi tạo conversation với owner
export async function startConversationWithOwnerForStaff(ownerId) {
  const token = getToken();
  return handleFetch(
    API_ENDPOINTS.CHAT.STAFF.START_WITH_OWNER(ownerId),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    },
    "Không thể khởi tạo cuộc trò chuyện với owner"
  );
}

