import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken, authFetch } from "./authApi";

// Mua chapters
export async function purchaseChapters(bookId, chapterIds, purchaseType = 'soft') {
  const res = await authFetch(API_ENDPOINTS.CHAPTER_PURCHASE.PURCHASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      bookId: bookId,
      chapterIds: chapterIds,
      purchaseType: purchaseType // 'soft' hoặc 'audio'
    }),
  });
  
  const data = await res.json();
  
  // Nếu response không OK, trả về object có error
  if (!res.ok) {
    return {
      error: -1,
      message: data.message || data.Message || `Lỗi ${res.status}: ${res.statusText}`,
      success: false
    };
  }
  
  return data;
}

// Kiểm tra quyền sở hữu chapter
export async function checkChapterOwnership(chapterId) {
  const res = await authFetch(`${API_ENDPOINTS.CHAPTER_PURCHASE.CHECK_OWNERSHIP}/${chapterId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

// Kiểm tra quyền sở hữu audio chapter
export async function checkChapterAudioOwnership(chapterId) {
  const res = await authFetch(`${API_ENDPOINTS.CHAPTER_PURCHASE.CHECK_AUDIO_OWNERSHIP}/${chapterId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

// Lấy danh sách chapters đã mua
export async function getMyPurchases() {
  const res = await authFetch(API_ENDPOINTS.CHAPTER_PURCHASE.MY_PURCHASES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}
