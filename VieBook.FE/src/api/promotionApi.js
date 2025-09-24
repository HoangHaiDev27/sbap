import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

// Lấy promotions theo owner
export async function getPromotionsByOwner(ownerId) {
  const res = await authFetch(API_ENDPOINTS.PROMOTIONS.GET_BY_OWNER(ownerId));
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Lấy promotions thất bại");
  }
  return res.json();
}

// Tạo promotion mới
export async function createPromotion(payload) {
  const res = await authFetch(API_ENDPOINTS.PROMOTIONS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Tạo promotion thất bại");
  }
  return res.json();
}

// lay book theo owner
export async function getBooksByOwner(ownerId) {
  const res = await authFetch(API_ENDPOINTS.BOOKS.GET_ALL_BY_OWNER(ownerId));
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Lấy sách theo owner thất bại");
  }
  return res.json();
}
// Update promotion
export async function updatePromotion(promotionId, payload) {
  const res = await authFetch(`${API_ENDPOINTS.PROMOTIONS.GET_BY_OWNER(0).replace("/owner/0","")}/${promotionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Cập nhật promotion thất bại");
  }
  return res.json();
}