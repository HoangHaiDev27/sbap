import { API_ENDPOINTS } from "../config/apiConfig";

export async function createPaymentLink(amount) {
  const res = await fetch(API_ENDPOINTS.PAYMENT.CREATE_LINK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

export async function verifyPayment(orderCode) {
  const res = await fetch(`${API_ENDPOINTS.PAYMENT.VERIFY}/${orderCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}