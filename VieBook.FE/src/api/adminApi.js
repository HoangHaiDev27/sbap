import { API_ENDPOINTS } from "../config/apiConfig";

export async function getAdminById(adminId) {
  const res = await fetch(API_ENDPOINTS.ADMIN.GETADMINBYID(adminId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch admin detail");
  return res.json();
}

export async function updateAdmin(adminId, data) {
  const res = await fetch(API_ENDPOINTS.ADMIN.UPDATE(adminId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update admin");
  return res.json();
}

export async function uploadAvatarImage(formData) {
  const res = await fetch(API_ENDPOINTS.UPLOADAVATARIMAGE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload ảnh thất bại");
  const data = await res.json();
  return data.imageUrl;
}
// xóa ảnh trên Cloudinary
export async function removeOldAvatarImage(imageUrl) {
  const res = await fetch(
    `${API_ENDPOINTS.REMOVEOLDBOOKIMAGE}?imageUrl=${encodeURIComponent(imageUrl)}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) {
    throw new Error("Xóa ảnh thất bại");
  }
  const data = await res.json();
  return data.message;
}