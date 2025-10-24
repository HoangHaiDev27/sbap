import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "../api/authApi"; // <-- dùng hàm getToken() sẵn có

async function handleFetch(url, options = {}, defaultError) {
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

export async function sendMessage(question) {
  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const userId = user?.userId || 0; // 0 = guest (chưa đăng nhập)
  const token = getToken() || ""; // <-- dùng getToken()

  const payload = {
    question,
    userId,
  };

  return handleFetch(
    API_ENDPOINTS.CHATBASE.SEND_MESSAGE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    "Không thể gửi tin nhắn đến Chatbase"
  );
}

export async function getChatHistory() {
  const token = getToken() || "";

  return handleFetch(
    API_ENDPOINTS.CHATBASE.GET_CHAT_HISTORY,
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
