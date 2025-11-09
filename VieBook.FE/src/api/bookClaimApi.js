import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function createBookClaim(claimData) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(claimData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create claim");
  }
  return res.json();
}

export async function getClaimsByOffer(offerId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.GET_BY_OFFER(offerId));
  if (!res.ok) throw new Error("Failed to fetch claims");
  return res.json();
}

export async function getMyClaims() {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.GET_MY_CLAIMS);
  if (!res.ok) throw new Error("Failed to fetch my claims");
  return res.json();
}

export async function approveClaim(claimId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.APPROVE(claimId), {
    method: "POST",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to approve claim");
  }
  return res.json();
}

export async function updateClaim(claimId, updateData) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.UPDATE(claimId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update claim");
  }
  return res.json();
}

export async function deleteClaim(claimId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.DELETE(claimId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete claim");
  return res.json();
}

export async function hasUserClaimed(offerId) {
  const res = await authFetch(API_ENDPOINTS.BOOK_CLAIMS.HAS_CLAIMED(offerId));
  if (!res.ok) return false;
  const data = await res.json();
  return data.hasClaimed || false;
}

