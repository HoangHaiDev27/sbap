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
//BookApproval api ///////////////////////////////////////
// Hàm dùng chung để xử lý fetch và lỗi
async function handleFetch(url, options, defaultError) {
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

  return options?.method === "PUT" ? true : res.json();
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