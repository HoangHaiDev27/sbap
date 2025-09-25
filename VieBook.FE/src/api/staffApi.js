import { API_ENDPOINTS } from "../config/apiConfig";

export async function getAllStaff() {
  const res = await fetch(API_ENDPOINTS.STAFF.GETALLSTAFF(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}` // nếu cần token
    },
  });
  if (!res.ok) throw new Error("Failed to fetch staff list");
  return res.json();
}

export async function getStaffById(staffId) {
  const res = await fetch(API_ENDPOINTS.STAFF.GETSTAFFBYID(staffId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch staff detail");
  return res.json();
}

export async function addStaff(data) {
  const res = await fetch(API_ENDPOINTS.STAFF.ADD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to add staff");
  return res.json();
}

export async function updateStaff(staffId, data) {
  const res = await fetch(API_ENDPOINTS.STAFF.UPDATE(staffId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update staff");
  return res.json();
}

export async function deleteStaff(staffId) {
  const res = await fetch(API_ENDPOINTS.STAFF.DELETE(staffId), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });

  if (!res.ok) {
    const errorText = await res.text(); // lấy message nếu có
    throw new Error(errorText || "Failed to delete staff");
  }

  // 204 No Content không parse JSON
  return true;
}

export async function lockStaff(staffId) {
  const res = await fetch(API_ENDPOINTS.STAFF.LOCK(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });

  if (!res.ok) {
    const errorText = await res.text(); // lấy message nếu có
    throw new Error(errorText || "Failed to lock staff");
  }

  // 204 No Content không parse JSON
  return true;
}

export async function uploadAvatarStaffImage(formData) {
  const res = await fetch(API_ENDPOINTS.UPLOADAVATARIMAGE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload ảnh thất bại");
  const data = await res.json();
  return data.imageUrl;
}
// xóa ảnh trên Cloudinary
export async function removeOldAvatarStaffImage(imageUrl) {
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
export async function unlockStaff(staffId) {
  const res = await fetch(API_ENDPOINTS.STAFF.UNLOCK(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to unlock staff");
  }

  return true;
}

export async function toggleStaffStatus(staffId) {
  const res = await fetch(API_ENDPOINTS.STAFF.TOGGLE_STATUS(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to toggle staff status");
  }

  return true;
}