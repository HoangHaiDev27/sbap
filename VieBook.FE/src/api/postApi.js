import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function createPost(postData) {
  const res = await authFetch(API_ENDPOINTS.POSTS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    let errorText = "Failed to create post";
    try {
      const errorData = await res.json();
      errorText = errorData.message || errorData.error || errorText;
    } catch {
      try {
        errorText = await res.text() || errorText;
      } catch {
        errorText = `HTTP ${res.status}: ${res.statusText}`;
      }
    }
    throw new Error(errorText);
  }
  return res.json();
}

export async function getPosts(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.postType) queryParams.append("postType", params.postType);
  if (params.searchQuery) queryParams.append("searchQuery", params.searchQuery);
  if (params.filter) queryParams.append("filter", params.filter);
  if (params.subFilter) queryParams.append("subFilter", params.subFilter);
  if (params.tag) queryParams.append("tag", params.tag);
  if (params.authorId) queryParams.append("authorId", params.authorId.toString());

  const url = `${API_ENDPOINTS.POSTS.GET_ALL}${queryParams.toString() ? `?${queryParams}` : ""}`;

  // Use authFetch for registered and my-posts filters (requires authentication)
  const fetchFn = (params.filter === "registered" || params.filter === "my-posts") ? authFetch : fetch;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function getPostById(postId) {
  const res = await fetch(API_ENDPOINTS.POSTS.GET_BY_ID(postId));
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function deletePost(postId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.DELETE(postId), {
    method: "DELETE",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete post");
  }
  return res.json();
}

export async function updatePostVisibility(postId, visibility) {
  const res = await authFetch(API_ENDPOINTS.POSTS.UPDATE_VISIBILITY(postId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update post visibility");
  }
  return res.json();
}

// Staff functions for post approval
export async function getPendingPosts() {
  const res = await authFetch(`${API_ENDPOINTS.POSTS.GET_ALL}?visibility=Pending`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch pending posts");
  }
  const data = await res.json();
  // Handle both array and object with data property
  return Array.isArray(data) ? data : (data?.data || []);
}

export async function approvePost(postId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.UPDATE_VISIBILITY(postId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: "Public" }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to approve post");
  }
  return res.json();
}

export async function rejectPost(postId) {
  const res = await authFetch(API_ENDPOINTS.POSTS.UPDATE_VISIBILITY(postId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visibility: "Rejected" }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to reject post");
  }
  return res.json();
}

