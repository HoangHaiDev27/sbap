import { API_ENDPOINTS } from "../config/apiConfig";

async function handleFetch(url, options = {}, defaultError) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = defaultError;
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) return true;
  return res.json();
}

export async function getAdminById(adminId) {
  return handleFetch(
    API_ENDPOINTS.ADMIN.GETADMINBYID(adminId),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    },
    "Failed to fetch admin detail"
  );
}


export async function updateAdmin(adminId, data) {
  return handleFetch(
    API_ENDPOINTS.ADMIN.UPDATE(adminId),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    },
    "Failed to update admin"
  );
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