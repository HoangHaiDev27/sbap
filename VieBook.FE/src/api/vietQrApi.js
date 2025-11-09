import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

/**
 * Lấy danh sách ngân hàng được hỗ trợ
 * @returns {Promise<Array<SupportedBankDTO>>}
 */
export async function getSupportedBanks() {
  const res = await authFetch(API_ENDPOINTS.VIETQR.BANKS);
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    const message = data?.message || "Không thể tải danh sách ngân hàng";
    throw new Error(message);
  }
  return Array.isArray(data) ? data : [];
}

/**
 * Tạo mã QR từ VietQR
 * @param {Object} request - { AccountNo, AccountName, AcqId, Amount, AddInfo }
 * @returns {Promise<Object>} { QrDataURL, Message, Success }
 */
export async function generateQRCode(request) {
  const res = await authFetch(API_ENDPOINTS.VIETQR.GENERATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Không thể tạo mã QR";
    throw new Error(message);
  }
  return data;
}

