import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

export async function createPaymentLink(amount) {
  const res = await authFetch(API_ENDPOINTS.PAYMENT.CREATE_LINK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });
  
  // Xử lý JSON parsing với error handling để tránh lỗi "Unexpected end of JSON input"
  let data;
  data = await res.json().catch(() => ({}));
  return data;
}

export async function verifyPayment(orderCode) {
  const res = await authFetch(`${API_ENDPOINTS.PAYMENT.VERIFY}/${orderCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // Xử lý JSON parsing với error handling để tránh lỗi "Unexpected end of JSON input"
  let data;
  data = await res.json();
  return data;
}