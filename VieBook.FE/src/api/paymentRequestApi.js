import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

/**
 * Tạo yêu cầu rút tiền
 * @param {number} requestedCoin - Số xu muốn rút
 * @returns {Promise<Object>} PaymentRequestResponseDTO
 */
export async function createPaymentRequest(requestedCoin) {
  const res = await authFetch(API_ENDPOINTS.PAYMENT_REQUESTS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestedCoin }),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể tạo yêu cầu rút tiền";
    throw new Error(message);
  }
  return data;
}

/**
 * Lấy danh sách yêu cầu rút tiền của user hiện tại
 * @returns {Promise<Array<PaymentRequestResponseDTO>>}
 */
export async function getUserPaymentRequests() {
  const res = await authFetch(API_ENDPOINTS.PAYMENT_REQUESTS.USER);
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    const message = data?.message || "Không thể tải lịch sử rút tiền";
    throw new Error(message);
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Lấy thông tin chi tiết một yêu cầu rút tiền
 * @param {number} paymentRequestId
 * @returns {Promise<PaymentRequestResponseDTO>}
 */
export async function getPaymentRequestById(paymentRequestId) {
  const res = await authFetch(`${API_ENDPOINTS.PAYMENT_REQUESTS.BASE}/${paymentRequestId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể tải thông tin yêu cầu rút tiền";
    throw new Error(message);
  }
  return data;
}

/**
 * Lấy danh sách tất cả yêu cầu rút tiền (chỉ dành cho staff)
 * @returns {Promise<Array<StaffPaymentRequestResponseDTO>>}
 */
export async function getAllPaymentRequests() {
  const res = await authFetch(`${API_ENDPOINTS.PAYMENT_REQUESTS.BASE}/all`);
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    const message = data?.message || "Không thể tải danh sách yêu cầu rút tiền";
    throw new Error(message);
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Duyệt yêu cầu rút tiền (chỉ dành cho staff)
 * @param {number} paymentRequestId
 * @returns {Promise<Object>}
 */
export async function approvePaymentRequest(paymentRequestId) {
  const res = await authFetch(`${API_ENDPOINTS.PAYMENT_REQUESTS.BASE}/${paymentRequestId}/approve`, {
    method: "PUT",
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể duyệt yêu cầu rút tiền";
    throw new Error(message);
  }
  return data;
}

/**
 * Từ chối yêu cầu rút tiền (chỉ dành cho staff)
 * @param {number} paymentRequestId
 * @param {string} reason - Lý do từ chối (optional)
 * @returns {Promise<Object>}
 */
export async function rejectPaymentRequest(paymentRequestId, reason = null) {
  const res = await authFetch(`${API_ENDPOINTS.PAYMENT_REQUESTS.BASE}/${paymentRequestId}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể từ chối yêu cầu rút tiền";
    throw new Error(message);
  }
  return data;
}

