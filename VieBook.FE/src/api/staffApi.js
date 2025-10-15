import { API_ENDPOINTS } from "../config/apiConfig";

async function handleFetch(url, options = {}, defaultError) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      let errorMessage = defaultError;
      try {
        const data = await res.json();
        errorMessage = data.message || errorMessage;
      } catch {
        if (res.status === 500) errorMessage = "Lỗi hệ thống.";
      }
      throw new Error(errorMessage);
    }

    // Nếu là 204 No Content hoặc response không có body
    const contentLength = res.headers.get("content-length");
    if (res.status === 204 || contentLength === "0") return true;

    // Parse JSON, nếu fail trả true để tránh lỗi chunked
    try {
      return await res.json();
    } catch {
      return true;
    }
  } catch (err) {
    // Catch network / chunked encoding errors
    throw new Error(err.message || defaultError);
  }
}

// ================= STAFF API =================
export async function getAllStaff() {
  return handleFetch(API_ENDPOINTS.STAFF.GETALLSTAFF(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to fetch staff list");
}

export async function getStaffById(staffId) {
  return handleFetch(API_ENDPOINTS.STAFF.GETSTAFFBYID(staffId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to fetch staff detail");
}

export async function addStaff(formData) {
  return handleFetch(API_ENDPOINTS.STAFF.ADD, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }, "Failed to add staff");
}

export async function updateStaff(staffId, formData) {
  return handleFetch(API_ENDPOINTS.STAFF.UPDATE(staffId), {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  }, "Failed to update staff");
}

export async function deleteStaff(staffId) {
  return handleFetch(API_ENDPOINTS.STAFF.DELETE(staffId), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to delete staff");
}

export async function lockStaff(staffId) {
  return handleFetch(API_ENDPOINTS.STAFF.LOCK(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to lock staff");
}

export async function unlockStaff(staffId) {
  return handleFetch(API_ENDPOINTS.STAFF.UNLOCK(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to unlock staff");
}

export async function toggleStaffStatus(staffId) {
  return handleFetch(API_ENDPOINTS.STAFF.TOGGLE_STATUS(staffId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  }, "Failed to toggle staff status");
}

    export async function updateStaffAvatar(staffId, formData) {
      const res = await fetch(API_ENDPOINTS.STAFF.UPDATE_AVATAR(staffId), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Upload avatar thất bại");
      }

      const data = await res.json();
      return data.avatarUrl;
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

// Lấy tất cả BookApproval
export async function getAllBookApprovals() {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.GET_ALL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Lấy danh sách BookApproval thất bại");
}

// Lấy BookApproval theo Id
export async function getBookApprovalById(approvalId) {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.GET_BY_ID(approvalId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Lấy BookApproval thất bại");
}

// Thêm mới BookApproval
export async function addBookApproval(payload) {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.ADD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }, "Thêm BookApproval thất bại");
}

// Duyệt (Approve) BookApproval
export async function approveBookApproval(bookId, staffId) {
  const url = `${API_ENDPOINTS.BOOKAPPROVAL.APPROVE(bookId)}?staffId=${staffId}`;
  return handleFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  }, "Duyệt BookApproval thất bại");
}

// Từ chối (Refuse) BookApproval
export async function refuseBookApproval(bookId, staffId, reason = "") {
  const url = `${API_ENDPOINTS.BOOKAPPROVAL.REFUSE(bookId)}?staffId=${staffId}&reason=${encodeURIComponent(reason)}`;
  return handleFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  }, "Từ chối BookApproval thất bại");
}


// Lấy BookApproval mới nhất theo BookId
export async function getLatestBookApprovalByBookId(bookId) {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.GET_LATEST_BY_BOOKID(bookId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Lấy BookApproval mới nhất thất bại");
}

// Lấy tất cả sách đang Active
export async function getAllActiveBooks() {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.GET_ALL_ACTIVE_BOOKS, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Lấy danh sách sách đang Active thất bại");
}
// Lấy toàn bộ User kèm Profile (UserNameDTO)
export async function getAllUsersWithProfile() {
  return handleFetch(API_ENDPOINTS.BOOKAPPROVAL.GET_ALL_USERS_WITH_PROFILE, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }, "Lấy danh sách User kèm Profile thất bại");
}
/////////////////////////////////////////////////////////////////