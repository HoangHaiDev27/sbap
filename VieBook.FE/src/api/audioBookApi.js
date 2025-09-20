import { API_ENDPOINTS } from "../config/apiConfig";

export async function getAudioBooks() {
  const res = await fetch(API_ENDPOINTS.AUDIO_BOOKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch audio books");
  return res.json();
}

export async function getAudioBookDetail(id) {
  const res = await fetch(API_ENDPOINTS.AUDIO_BOOK_DETAIL(id), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch audio book detail");
  return res.json();
}
