import { API_ENDPOINTS } from "../config/apiConfig";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user, roles) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  let role = Array.isArray(roles) && roles.length ? String(roles[0]).toLowerCase() : undefined;
  // Map backend role names to UI header roles
  const roleMap = { customer: "user" };
  if (role && roleMap[role]) role = roleMap[role];
  if (role) localStorage.setItem(ROLE_KEY, role);
  try {
    window.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { token, user, role } })
    );
  } catch { /* empty */ }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(email, password) {
  const res = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Đăng nhập thất bại");
  }
  const data = await res.json();
  const token = data.token || data.Token || data?.Token;
  const user = data.user || data.User || data?.User;
  const roles = data.roles || data.Roles || [];
  setAuth(token, user, roles);
  return data;
}

export async function logout() {
  // Client-side logout only to avoid 401 noise when token expired/missing
  clearAuth();
  try {
    // Notify UI to switch to guest immediately
    window.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { token: null, user: null, role: "" } })
    );
    window.dispatchEvent(
      new CustomEvent("app:toast", { detail: { type: "success", message: "Đã đăng xuất" } })
    );
  } catch { /* empty */ }
}

export async function authFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function getUserId() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.userId || user.UserId || user.id || user.Id || null;
}

export async function forgotPassword(email) {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.FORGOT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Gửi OTP thất bại");

    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ==== Verify OTP ====
export async function verifyOtp(email, otp) {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Xác thực OTP thất bại");

    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ==== Reset Password ====
export async function resetPassword(email, newPassword) {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.RESET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Đặt lại mật khẩu thất bại");

    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
}



