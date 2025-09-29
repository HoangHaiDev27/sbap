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
export async function deletePromotion(promotionId, ownerId) {
  const url = `${API_ENDPOINTS.PROMOTIONS.CREATE}/${promotionId}?ownerId=${ownerId}`;
  const res = await authFetch(url, { method: "DELETE" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Xóa promotion thất bại");
  }
  return res.json();
}

// Promotion detail
export async function getPromotionDetail(promotionId) {
  const url = `${API_ENDPOINTS.PROMOTIONS.CREATE}/${promotionId}`;
  const res = await authFetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lấy chi tiết promotion thất bại");
  }
  return res.json();
}

export async function getPromotionStats(ownerId) {
  const res = await authFetch(API_ENDPOINTS.PROMOTIONS.STATS_BY_OWNER(ownerId));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Lấy thống kê promotion thất bại");
  }
  return res.json();
}