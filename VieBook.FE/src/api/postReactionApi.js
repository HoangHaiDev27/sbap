import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function getReactions(postId) {
  const res = await fetch(API_ENDPOINTS.POSTS.REACTIONS.GET(postId));
  if (!res.ok) throw new Error("Failed to fetch reactions");
  return res.json();
}

export async function getReactionCount(postId) {
  const res = await fetch(API_ENDPOINTS.POSTS.REACTIONS.GET_COUNT(postId));
  if (!res.ok) throw new Error("Failed to fetch reaction count");
  const data = await res.json();
  return data.count || 0;
}

export async function getUserReaction(postId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.REACTIONS.GET_USER(postId));
  if (!res.ok) {
    if (res.status === 401) return null; // User not authenticated or no reaction
    throw new Error("Failed to fetch user reaction");
  }
  return res.json();
}

export async function toggleReaction(postId, reactionType = "Like") {
  const res = await authFetch(API_ENDPOINTS.POSTS.REACTIONS.TOGGLE(postId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, reactionType }),
  });
  if (!res.ok) throw new Error("Failed to toggle reaction");
  return res.json();
}

export async function deleteReaction(postId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.REACTIONS.DELETE(postId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete reaction");
  return res.json();
}


