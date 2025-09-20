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
