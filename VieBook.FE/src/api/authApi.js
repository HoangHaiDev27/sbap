import { API_ENDPOINTS } from "../config/apiConfig";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ROLE_KEY = "auth_role";
const ROLES_KEY = "auth_roles";
const CURRENT_ROLE_KEY = "current_role";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token, user, roles, refreshToken = null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Lưu tất cả roles
  if (roles && Array.isArray(roles)) {
    const normalizedRoles = roles.map(r => String(r).toLowerCase());
    localStorage.setItem(ROLES_KEY, JSON.stringify(normalizedRoles));
    
    // Ưu tiên role user trước, sau đó mới đến các role khác
    const rolePriority = [ 'customer', 'owner', 'staff', 'admin'];
    let selectedRole = null;
    
    // Tìm role theo thứ tự ưu tiên
    for (const priorityRole of rolePriority) {
      if (normalizedRoles.includes(priorityRole)) {
        selectedRole = priorityRole;
        break;
      }
    }
    
    // Nếu không tìm thấy role ưu tiên, lấy role đầu tiên
    if (!selectedRole && normalizedRoles.length > 0) {
      selectedRole = normalizedRoles[0];
    }
    
    // Map backend role names to UI header roles
    const roleMap = { customer: "customer" };
    if (selectedRole && roleMap[selectedRole]) selectedRole = roleMap[selectedRole];
    
    if (selectedRole) {
      localStorage.setItem(ROLE_KEY, selectedRole);
      localStorage.setItem(CURRENT_ROLE_KEY, selectedRole);
    }
  }
  
  try {
    window.dispatchEvent(
      new CustomEvent("auth:changed", { detail: { token, user, role: getCurrentRole(), refreshToken } })
    );
  } catch { /* empty */ }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(ROLES_KEY);
  localStorage.removeItem(CURRENT_ROLE_KEY);
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
    console.warn("No refresh token available");
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
      console.warn(`Refresh token failed: ${res.status} - ${err.message}`);
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
      // Refresh failed, continue with original response
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

export function getUserName() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.fullName || user.FullName || user.name || user.Name || user.email || user.Email || "User";
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

// ==== Check Email Exists ====
export async function checkEmailExists(email) {
  try {
    const res = await fetch(`${API_ENDPOINTS.USER_EMAIL}?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // Nếu trả về 200, email đã tồn tại
    if (res.ok) {
      return { exists: true };
    }
    
    // Nếu trả về 404, email chưa tồn tại
    if (res.status === 404) {
      return { exists: false };
    }
    
    // Các lỗi khác
    throw new Error("Lỗi kiểm tra email");
  } catch (err) {
    console.error("Check email error:", err);
    return { exists: false, error: err.message };
  }
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
  let user = data.user || data.User || data?.User;
  const roles = data.roles || data.Roles || [];
  
  // Tự động active account khi login bằng Google
  if (user) {
    const userStatus = user?.status || user?.Status || user?.isActive || user?.IsActive;
    if (userStatus === 'Pending' || userStatus === 'pending' || userStatus === false) {
      try {
        await activeAccount(user.email || user.Email);
        console.log('Account auto-activated for Google login');
        // Cập nhật user status sau khi active
        user = { ...user, status: 'Active', Status: 'Active', isActive: true, IsActive: true };
      } catch (error) {
        console.warn('Failed to auto-activate account:', error);
      }
    }
  }
  
  setAuth(token, user, roles, refreshToken);
  return data;
}

// ==== Active Account ====
export async function activeAccount(email) {
  const res = await fetch(API_ENDPOINTS.AUTH.ACTIVE_ACCOUNT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Kích hoạt tài khoản thất bại");
  }
  
  return res.json();
}

// ==== Multiple Roles Management ====

// Lấy tất cả roles của user
export function getAllRoles() {
  const raw = localStorage.getItem(ROLES_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Lấy role hiện tại đang active
export function getCurrentRole() {
  return localStorage.getItem(CURRENT_ROLE_KEY) || localStorage.getItem(ROLE_KEY) || '';
}

// Kiểm tra user có role cụ thể không
export function hasRole(role) {
  const roles = getAllRoles();
  return roles.includes(role.toLowerCase());
}

// Kiểm tra user có role book owner không
export function isBookOwner() {
  return hasRole('owner');
}

// Kiểm tra user có role staff không
export function isStaff() {
  return hasRole('staff');
}

// Kiểm tra user có role admin không
export function isAdmin() {
  return hasRole('admin');
}

// Kiểm tra user có role customer không
export function isCustomer() {
  return hasRole('customer');
}

// Kiểm tra user có thể chuyển đổi giữa staff và admin
export function canSwitchStaffAdmin() {
  return isStaff() && isAdmin();
}

// Chuyển đổi role
export function switchRole(newRole) {
  const roles = getAllRoles();
  const normalizedNewRole = newRole.toLowerCase();
  
  // Nếu role mới có trong danh sách roles của user
  if (roles.includes(normalizedNewRole)) {
    localStorage.setItem(CURRENT_ROLE_KEY, normalizedNewRole);
    localStorage.setItem(ROLE_KEY, normalizedNewRole);
    
    // Dispatch event để UI cập nhật
    try {
      window.dispatchEvent(
        new CustomEvent("auth:changed", { 
          detail: { 
            token: getToken(), 
            user: getCurrentUser(), 
            role: normalizedNewRole,
            refreshToken: getRefreshToken()
          } 
        })
      );
    } catch { /* empty */ }
    
    return true;
  }
  
  // Nếu không tìm thấy role trong danh sách, vẫn cho phép chuyển đổi
  // (để hỗ trợ chuyển đổi giữa owner/user và staff/admin)
  console.log('Role not found in user roles, but allowing switch for role toggle');
  localStorage.setItem(CURRENT_ROLE_KEY, normalizedNewRole);
  localStorage.setItem(ROLE_KEY, normalizedNewRole);
  
  // Dispatch event để UI cập nhật
  try {
    window.dispatchEvent(
      new CustomEvent("auth:changed", { 
        detail: { 
          token: getToken(), 
          user: getCurrentUser(), 
          role: normalizedNewRole,
          refreshToken: getRefreshToken()
        } 
      })
    );
  } catch { /* empty */ }
  
  return true;
}

// Lấy danh sách roles có thể chuyển đổi (loại trừ role hiện tại)
export function getAvailableRoles() {
  const allRoles = getAllRoles();
  const currentRole = getCurrentRole();
  return allRoles.filter(role => role !== currentRole);
}
