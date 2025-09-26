import { API_ENDPOINTS } from "../config/apiConfig";

// Hàm dùng chung để xử lý fetch và lỗi
async function handleFetch(url, options, defaultError) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
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

  return res.status === 204 ? true : res.json();
}

// Lấy danh sách tài khoản chủ sách
export async function getBookOwnerAccounts() {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.GET_BOOK_OWNERS, {
    method: "GET",
  }, "Lấy danh sách tài khoản chủ sách thất bại");
}

// Lấy danh sách tài khoản khách hàng
export async function getCustomerAccounts() {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.GET_CUSTOMERS, {
    method: "GET",
  }, "Lấy danh sách tài khoản khách hàng thất bại");
}

// Lấy thông tin chi tiết tài khoản theo ID
export async function getAccountDetail(userId) {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.GET_USER_DETAIL(userId), {
    method: "GET",
  }, "Lấy thông tin chi tiết tài khoản thất bại");
}

// Lấy danh sách tài khoản theo vai trò
export async function getAccountsByRole(roleName) {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.GET_USERS_BY_ROLE(roleName), {
    method: "GET",
  }, "Lấy danh sách tài khoản theo vai trò thất bại");
}

// Khóa tài khoản chủ sách
export async function lockBookOwnerAccount(userId, reason = "") {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.LOCK_USER(userId), {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  }, "Khóa tài khoản chủ sách thất bại");
}

// Mở khóa tài khoản chủ sách
export async function unlockBookOwnerAccount(userId, reason = "") {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.UNLOCK_USER(userId), {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  }, "Mở khóa tài khoản chủ sách thất bại");
}

// Khóa tài khoản khách hàng
export async function lockCustomerAccount(userId, reason = "") {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.LOCK_USER(userId), {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  }, "Khóa tài khoản khách hàng thất bại");
}

// Mở khóa tài khoản khách hàng
export async function unlockCustomerAccount(userId, reason = "") {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.UNLOCK_USER(userId), {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  }, "Mở khóa tài khoản khách hàng thất bại");
}

// Đổi trạng thái tài khoản (khóa/mở khóa)
export async function toggleAccountStatus(userId) {
  return handleFetch(API_ENDPOINTS.USER_MANAGEMENT.TOGGLE_STATUS(userId), {
    method: "PATCH",
  }, "Đổi trạng thái tài khoản thất bại");
}
