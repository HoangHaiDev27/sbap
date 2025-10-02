import { API_ENDPOINTS } from "../config/apiConfig";

// Simple in-memory cache with TTL to avoid refetching on quick navigations
let audioBooksCache = { data: null, ts: 0 };
const AUDIOBOOKS_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getAudioBooks({ force = false } = {}) {
  const now = Date.now();
  if (!force && audioBooksCache.data && now - audioBooksCache.ts < AUDIOBOOKS_TTL_MS) {
    return audioBooksCache.data;
  }
  const res = await fetch(API_ENDPOINTS.AUDIO_BOOKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch audio books");
  const data = await res.json();
  audioBooksCache = { data, ts: now };
  return data;
}

export async function getAudioBookDetail(id) {
  const res = await fetch(API_ENDPOINTS.AUDIO_BOOK_DETAIL(id), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch audio book detail");
  return res.json();
}
