import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await authFetch(API_ENDPOINTS.UPLOADAVATARIMAGE, {
    method: "POST",
    body: formData,
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Upload avatar thất bại";
    throw new Error(message);
  }
  return data;
}

export async function uploadBookImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await authFetch(`${API_ENDPOINTS.UPLOAD}/bookImage`, {
    method: "POST",
    body: formData,
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Upload ảnh sách thất bại";
    throw new Error(message);
  }
  return data;
}

export async function deleteImage(imageUrl) {
  const res = await authFetch(`${API_ENDPOINTS.UPLOAD}/bookImage?imageUrl=${encodeURIComponent(imageUrl)}`, {
    method: "DELETE",
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Xóa ảnh thất bại";
    throw new Error(message);
  }
  return data;
}

export async function uploadPostImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await authFetch(API_ENDPOINTS.UPLOADPOSTIMAGE, {
    method: "POST",
    body: formData,
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Upload ảnh bài viết thất bại";
    throw new Error(message);
  }
  return data;
}

export async function uploadPostVideo(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Create AbortController with longer timeout for video upload (5 minutes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes
  
  try {
    const res = await authFetch(API_ENDPOINTS.UPLOADPOSTVIDEO, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message || "Upload video bài viết thất bại";
      throw new Error(message);
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Upload video quá lâu (timeout sau 5 phút). Vui lòng thử file nhỏ hơn.");
    }
    throw error;
  }
}