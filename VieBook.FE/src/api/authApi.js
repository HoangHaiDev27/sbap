import { API_ENDPOINTS } from "../config/apiConfig";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user, roles, refreshToken = null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  let role = Array.isArray(roles) && roles.length ? String(roles[0]).toLowerCase() : undefined;
  // Map backend role names to UI header roles
  const roleMap = { customer: "user" };
  if (role && roleMap[role]) role = roleMap[role];
  if (role) localStorage.setItem(ROLE_KEY, role);
  try {
    window.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { token, user, role, refreshToken } })
    );
  } catch { /* empty */ }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("refreshToken");
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
  const refreshToken = data.refreshToken || data.RefreshToken || data?.RefreshToken;
  const user = data.user || data.User || data?.User;
  const roles = data.roles || data.Roles || [];
  setAuth(token, user, roles, refreshToken);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  
  // Try to revoke refresh token on server
  if (refreshToken) {
    try {
      await fetch(API_ENDPOINTS.AUTH.REVOKE_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Failed to revoke token:", error);
    }
  }
  
  // Clear auth data
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

export async function refreshToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Không tìm thấy refresh token");
  }

  try {
    const res = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Refresh token thất bại");
    }

    const data = await res.json();
    const newToken = data.token || data.Token;
    const newRefreshToken = data.refreshToken || data.RefreshToken;

    // Update tokens in localStorage
    if (newToken) localStorage.setItem(TOKEN_KEY, newToken);
    if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (error) {
    // If refresh fails, clear auth and redirect to login
    clearAuth();
    window.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { token: null, user: null, role: "" } })
    );
    throw error;
  }
}

export async function authFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  let response = await fetch(input, { ...init, headers });
  
  // If token expired, try to refresh
  if (response.status === 401 && getRefreshToken()) {
    try {
      await refreshToken();
      // Retry the original request with new token
      const newToken = getToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(input, { ...init, headers });
      }
    } catch (error) {
      // Refresh failed, let the 401 response through
      console.error("Token refresh failed:", error);
    }
  }
  
  return response;
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || "";
}

export function getUserId() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.userId || user.UserId || user.id || user.Id || null;
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export async function changePassword(currentPassword, newPassword) {
  const token = getToken();
  
  // Debug: Check if token exists
  if (!token) {
    throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
  }
  
  console.log("Change password - Token exists:", !!token);
  console.log("Change password - Token length:", token.length);
  
  const res = await authFetch(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      currentPassword, 
      newPassword 
    }),
  });
  
  console.log("Change password - Response status:", res.status);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    console.error("Change password error:", err);
    throw new Error(err.message || "Đổi mật khẩu thất bại");
  }
  
  const data = await res.json();
  return data;
}

export async function register(fullName, email, password) {
  const res = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Đăng ký thất bại");
  }
  return res.json();
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

// ==== Google Login ====
export async function googleLogin(idToken) {
  const res = await fetch(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Đăng nhập Google thất bại");
  }
  
  const data = await res.json();
  const token = data.token || data.Token || data?.Token;
  const refreshToken = data.refreshToken || data.RefreshToken || data?.RefreshToken;
  const user = data.user || data.User || data?.User;
  const roles = data.roles || data.Roles || [];
  setAuth(token, user, roles, refreshToken);
  return data;
}




