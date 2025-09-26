import { API_ENDPOINTS } from "../config/apiConfig";

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

//  danh sách sách đọc
export async function getReadBooks() {
  const res = await fetch(API_ENDPOINTS.READ_BOOKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch read books");
  }
  return res.json();
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
    : API_ENDPOINTS.RECOMMENDATIONS; // nếu null thì chỉ gọi thẳng /recommendations

  console.log("🔍 [getRecommendations] Fetching URL:", url);
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}



