import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function getComments(postId) {
  const res = await fetch(API_ENDPOINTS.POSTS.COMMENTS.GET(postId));
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function getCommentCount(postId) {
  const res = await fetch(API_ENDPOINTS.POSTS.COMMENTS.GET_COUNT(postId));
  if (!res.ok) throw new Error("Failed to fetch comment count");
  const data = await res.json();
  return data.count || 0;
}

export async function getCommentById(postId, commentId) {
  const res = await fetch(API_ENDPOINTS.POSTS.COMMENTS.GET_BY_ID(postId, commentId));
  if (!res.ok) throw new Error("Failed to fetch comment");
  return res.json();
}

export async function createComment(postId, content, parentCommentId = null) {
  const res = await authFetch(API_ENDPOINTS.POSTS.COMMENTS.CREATE(postId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      postId,
      content,
      parentCommentId,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create comment");
  }
  return res.json();
}

export async function updateComment(postId, commentId, content) {
  const res = await authFetch(API_ENDPOINTS.POSTS.COMMENTS.UPDATE(postId, commentId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update comment");
  }
  return res.json();
}

export async function deleteComment(postId, commentId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.COMMENTS.DELETE(postId, commentId), {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete comment");
  }
  return res.json();
}


