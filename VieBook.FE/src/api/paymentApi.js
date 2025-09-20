import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "./authApi";

export async function createPaymentLink(amount) {
  const token = getToken();
  const res = await fetch(API_ENDPOINTS.PAYMENT.CREATE_LINK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

export async function verifyPayment(orderCode) {
  const token = getToken();
  const res = await fetch(`${API_ENDPOINTS.PAYMENT.VERIFY}/${orderCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
  });
  return res.json();
}