import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function checkWishlist(bookId) {
  const res = await authFetch(API_ENDPOINTS.WISHLIST.CHECK(bookId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to check wishlist");
  const data = await res.json();
  // Expecting { isWishlisted: boolean } or boolean
  if (typeof data === "boolean") return data;
  if (data && typeof data.isWishlisted === "boolean") return data.isWishlisted;
  return false;
}

export async function addToWishlist(bookId) {
  const res = await authFetch(API_ENDPOINTS.WISHLIST.ADD(bookId), { method: "POST" });
  if (!res.ok) throw new Error("Failed to add to wishlist");
  return res.json().catch(() => ({}));
}

export async function removeFromWishlist(bookId) {
  const res = await authFetch(API_ENDPOINTS.WISHLIST.REMOVE(bookId), { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove from wishlist");
  return res.json().catch(() => ({}));
}

export async function toggleWishlist(bookId) {
  const res = await authFetch(API_ENDPOINTS.WISHLIST.TOGGLE(bookId), { method: "POST" });
  if (!res.ok) throw new Error("Failed to toggle wishlist");
  return res.json();
}

export async function getMyWishlist() {
  const res = await authFetch(API_ENDPOINTS.WISHLIST.MY_LIST, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load wishlist");
  return res.json();
}



