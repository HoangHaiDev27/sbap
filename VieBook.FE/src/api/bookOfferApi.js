import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function getOfferById(offerId) {
  const res = await fetch(API_ENDPOINTS.BOOK_OFFERS.GET_BY_ID(offerId));
  if (!res.ok) throw new Error("Failed to fetch offer");
  return res.json();
}

export async function getOfferByPostId(postId) {
  const res = await fetch(API_ENDPOINTS.BOOK_OFFERS.GET_BY_POST(postId));
  if (!res.ok) throw new Error("Failed to fetch offer");
  return res.json();
}

export async function getActiveOffers() {
  const res = await fetch(API_ENDPOINTS.BOOK_OFFERS.GET_ACTIVE);
  if (!res.ok) throw new Error("Failed to fetch active offers");
  return res.json();
}

export async function getOffersByOwner(ownerId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_OFFERS.GET_BY_OWNER(ownerId));
  if (!res.ok) throw new Error("Failed to fetch offers");
  return res.json();
}

export async function updateOffer(offerId, updateData) {
  const res = await authFetch(API_ENDPOINTS.BOOK_OFFERS.UPDATE(offerId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update offer");
  }
  return res.json();
}

export async function deleteOffer(offerId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_OFFERS.DELETE(offerId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete offer");
  return res.json();
}

