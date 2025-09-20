import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "./authApi";

// Mua chapters
export async function purchaseChapters(bookId, chapterIds) {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.CHAPTER_PURCHASE.PURCHASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: JSON.stringify({ 
      bookId: bookId,
      chapterIds: chapterIds 
    }),
  });
  return res.json();
}

// Kiểm tra quyền sở hữu chapter
export async function checkChapterOwnership(chapterId) {
  const token = getToken();
  const res = await fetch(`${API_ENDPOINTS.CHAPTER_PURCHASE.CHECK_OWNERSHIP}/${chapterId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  });
  return res.json();
}

// Lấy danh sách chapters đã mua
export async function getMyPurchases() {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.CHAPTER_PURCHASE.MY_PURCHASES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  });
  return res.json();
}
