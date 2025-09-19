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
