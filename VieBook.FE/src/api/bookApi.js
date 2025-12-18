import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

// Simple in-memory cache with TTL for read books list
let readBooksCache = { data: null, ts: 0 };
const READBOOKS_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getBookDetail(id) {
  const res = await fetch(API_ENDPOINTS.BOOK_DETAIL(id), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch book detail");
  }
  return res.json();
}

// Owner book detail with full status via /api/books/detail/{id}
export async function getOwnerBookDetail(id) {
  const url = API_ENDPOINTS.BOOKS?.GET_BY_ID ? API_ENDPOINTS.BOOKS.GET_BY_ID(id) : API_ENDPOINTS.BOOK_DETAIL(id);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const msg = res.status === 404
      ? "Không tìm thấy sách"
      : res.status === 401 || res.status === 403
        ? "Bạn không có quyền truy cập sách này"
        : `Lỗi tải dữ liệu (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

// Book stats via /api/books/{id}/stats
export async function getBookStats(id) {
  const url = `${API_ENDPOINTS.API_BASE_URL}/api/books/${id}/stats`;
  const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    throw new Error(`Không lấy được thống kê (HTTP ${res.status})`);
  }
  return res.json();
}

// Chapters of a book
export async function getChaptersByBookId(bookId) {
  const url = API_ENDPOINTS.CHAPTERS?.GET_BY_BOOK_ID ? API_ENDPOINTS.CHAPTERS.GET_BY_BOOK_ID(bookId) : `${API_ENDPOINTS.API_BASE_URL}/api/chapter/book/${bookId}`;
  const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Không lấy được danh sách chương");
  return res.json();
}

// Reviews by book with server-side pagination (hasReply filtered client-side)
export async function getReviewsByBook(bookId, { page = 1, pageSize = 5, rating = null } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("pageSize", pageSize);
  if (rating) params.set("rating", rating);
  const url = `${API_ENDPOINTS.REVIEWS.BY_BOOK(bookId)}?${params.toString()}`;
  const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error("Không lấy được đánh giá");
  return res.json();
}

// Owner reply a review
export async function ownerReplyReview(reviewId, reply) {
  const res = await authFetch(API_ENDPOINTS.REVIEWS.OWNER_REPLY(reviewId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reply })
  });
  if (!res.ok) throw new Error("Gửi phản hồi thất bại");
  return res.json();
}

//  danh sách sách đọc
export async function getReadBooks() {
  const now = Date.now();
  if (readBooksCache.data && now - readBooksCache.ts < READBOOKS_TTL_MS) {
    return readBooksCache.data;
  }
  const res = await fetch(API_ENDPOINTS.READ_BOOKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch read books");
  }
  const data = await res.json();
  readBooksCache = { data, ts: now };
  return data;
}
// Lấy sách cùng thể loại
export async function getRelatedBooks(bookId) {
  const res = await fetch(API_ENDPOINTS.RELATED_BOOKS(bookId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch related books");
  return res.json();
}

export async function getAllCategories() {
  const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ALL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

// ✅ lấy recommendation
export async function getRecommendations(userId = null) {
  const url = userId
    ? `${API_ENDPOINTS.RECOMMENDATIONS}?userId=${userId}`
    : API_ENDPOINTS.RECOMMENDATIONS;

  console.log("🔍 [getRecommendations] Fetching URL:", url);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

// ✅ lấy collaborative filtering recommendations
export async function getCollaborativeRecommendations(userId, topCount = 10) {
  const url = `${API_ENDPOINTS.API_BASE_URL}/api/books/collaborative-recommendations?userId=${userId}&topCount=${topCount}`;

  console.log("🤝 [getCollaborativeRecommendations] Fetching URL:", url);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch collaborative recommendations");
  return res.json();
}

// Lấy danh sách sách đã mua của user (cho reading schedule)
export async function getUserPurchasedBooks() {
  const res = await authFetch(`${API_ENDPOINTS.API_BASE_URL}/api/ChapterPurchase/my-books`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch user purchased books");
  const data = await res.json();
  return data.data; // Trả về data từ Response object
}



