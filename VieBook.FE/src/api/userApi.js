import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function getUsers() {
  const res = await authFetch(API_ENDPOINTS.USERS);
  return res.json();
}

export async function getUser(id) {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/${id}`);
  return res.json();
}

export async function getMe() {
  const res = await authFetch(API_ENDPOINTS.USER_ME);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể tải hồ sơ";
    throw new Error(message);
  }
  return data;
}
export async function getCurrentUser() {
  // Add cache-busting parameter to ensure fresh data
  const timestamp = new Date().getTime();
  const res = await authFetch(`${API_ENDPOINTS.USERS}/me?t=${timestamp}`);
  return res.json();
}

export async function getCurrentUserSubscription() {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/me/subscription`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể tải thông tin subscription";
    throw new Error(message);
  }
  return data;
}

export async function updateUser(id, user) {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}

export async function becomeOwner() {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/become-owner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể trở thành Book Owner";
    throw new Error(message);
  }
  // Persist roles if returned
  try {
    const roles = data?.roles || data?.Roles || [];
    if (Array.isArray(roles) && roles.length) {
      // update localStorage roles while keeping existing token/user
      const token = localStorage.getItem("auth_token");
      const user = localStorage.getItem("auth_user");
      localStorage.setItem("auth_roles", JSON.stringify(roles.map(r => String(r).toLowerCase())));
      // set current role to owner if available
      if (roles.map(r => String(r).toLowerCase()).includes("owner")) {
        localStorage.setItem("current_role", "owner");
        localStorage.setItem("auth_role", "owner");
      }
      // notify app
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: { token, user: user ? JSON.parse(user) : null, role: "owner" } }));
    }
  } catch { /* noop */ }
  return data;
}

export async function upsertMyProfile(profile) {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Cập nhật hồ sơ thất bại";
    throw new Error(message);
  }
  return data;
}

export async function getOwnerPlans() {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/owner-plans`, { method: "GET" });
  // Nếu chưa đăng nhập hoặc không có quyền, trả về danh sách rỗng để trang vẫn hiển thị
  if (res.status === 401 || res.status === 403) {
    return [];
  }
  if (!res.ok) {
    // Cố gắng lấy message JSON, fallback tránh parse HTML
    const data = await res.json().catch(() => ({}));
    const message = data?.message || "Không tải được danh sách gói Owner";
    throw new Error(message);
  }
  // Tránh parse HTML khi server trả về không phải JSON
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return [];
  }
  return res.json();
}

export async function purchaseOwnerPlan(planId) {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/purchase-plan/${planId}`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Mua gói thất bại");
  }
  return data;
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await authFetch(API_ENDPOINTS.UPLOADAVATARIMAGE, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || "Upload ảnh thất bại");
  }
  return data?.imageUrl || data?.url || "";
}

export async function deleteImageByUrl(imageUrl) {
  const url = `${API_ENDPOINTS.REMOVEOLDBOOKIMAGE}?imageUrl=${encodeURIComponent(imageUrl)}`;
  const res = await authFetch(url, { method: "DELETE" });
  if (!res.ok) {
    // Best-effort delete; don't block caller
    return false;
  }
  return true;
}