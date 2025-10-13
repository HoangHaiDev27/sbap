import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function checkSpelling(content) {
  const res = await authFetch(API_ENDPOINTS.OPENAI.CHECK_SPELLING, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  // The backend returns JSON text string. Try parse, else return raw
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Not a valid JSON, return as string fallback
    return text || {};
  }
}

export async function moderation(content) {
  const res = await authFetch(API_ENDPOINTS.OPENAI.MODERATION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error(`Moderation API failed: ${res.status}`);
  }

  return res.json();
}

export async function checkPlagiarism(bookId, content, chapterId = null) {
  const res = await authFetch(API_ENDPOINTS.OPENAI.CHECK_PLAGIARISM, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId, content, chapterId }),
  });

  if (!res.ok) {
    throw new Error(`Plagiarism API failed: ${res.status}`);
  }

  return res.json();
}

export async function generateEmbeddings(chapterId, content) {
  const res = await authFetch(API_ENDPOINTS.OPENAI.GENERATE_EMBEDDINGS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterId, content }),
  });

  if (!res.ok) {
    throw new Error(`Generate embeddings API failed: ${res.status}`);
  }

  return res.json();
}

export async function summarizeContent(content, chapterTitle) {
  const res = await authFetch(API_ENDPOINTS.OPENAI.SUMMARIZE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, chapterTitle }),
  });

  if (!res.ok) {
    throw new Error(`Summarize API failed: ${res.status}`);
  }

  return res.json();
}


