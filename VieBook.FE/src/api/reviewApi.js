import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "./authApi";

export async function getReviewsByBook(bookId, { rating = null, page = 1, pageSize = 10 } = {}) {
  const qs = new URLSearchParams();
  if (rating != null) qs.set("rating", rating);
  if (page) qs.set("page", page);
  if (pageSize) qs.set("pageSize", pageSize);
  const url = `${API_ENDPOINTS.REVIEWS.BY_BOOK(bookId)}${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function createReview(bookId, rating, comment) {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.REVIEWS.CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ bookId, rating, comment }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create review");
  }
  return res.json();
}

export async function ownerReply(reviewId, reply) {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.REVIEWS.OWNER_REPLY(reviewId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ reply }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to reply");
  }
  return res.json();
}

export async function canReview(bookId) {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.REVIEWS.CAN_REVIEW(bookId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return { canReview: false };
  return res.json();
}


