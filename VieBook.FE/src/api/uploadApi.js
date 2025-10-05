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
