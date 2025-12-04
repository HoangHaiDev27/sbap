import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function getUserBookmarks() {
  const res = await authFetch(API_ENDPOINTS.BOOKMARKS.USER_BOOKMARKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Get bookmarks failed: ${res.status}`);
  }

  return res.json();
}

export async function getBookmarkByChapter(chapterId) {
  const res = await authFetch(`${API_ENDPOINTS.BOOKMARKS.CHAPTER}/${chapterId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Get bookmark failed: ${res.status}`);
  }

  // Some backends may return 204 No Content or empty body when no bookmark exists
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    // If body isn't valid JSON, treat as no bookmark
    return null;
  }
}

export async function createOrUpdateBookmark(bookmarkData) {
  const res = await authFetch(API_ENDPOINTS.BOOKMARKS.CREATE_UPDATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookmarkData),
  });

  if (!res.ok) {
    throw new Error(`Create/Update bookmark failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteBookmark(bookmarkId) {
  const res = await authFetch(`${API_ENDPOINTS.BOOKMARKS.DELETE}/${bookmarkId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Delete bookmark failed: ${res.status}`);
  }

  return res.json();
}

export async function deleteBookmarkByChapter(chapterId) {
  const res = await authFetch(`${API_ENDPOINTS.BOOKMARKS.DELETE_CHAPTER}/${chapterId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Delete bookmark by chapter failed: ${res.status}`);
  }

  return res.json();
}
