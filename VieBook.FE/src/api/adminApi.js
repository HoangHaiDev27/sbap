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


export async function updateAdmin(adminId, formData) {
  return handleFetch(
    API_ENDPOINTS.ADMIN.UPDATE(adminId),
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData, // dùng FormData để upload file
    },
    "Cập nhật thông tin admin thất bại."
  );
}

/** 🧩 Xóa avatar trên Cloudinary (và DB) */
export async function deleteAdminAvatar(adminId) {
  return handleFetch(
    API_ENDPOINTS.ADMIN.DELETE_AVATAR(adminId),
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
    },
    "Không thể xóa avatar."
  );
}