const API_URL = "http://localhost:5757/";

export async function createPaymentLink(amount) {
  const res = await fetch(`${API_URL}create-payment-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

export async function verifyPayment(orderCode) {
  const res = await fetch(`${API_URL}api/webhook/verify-payment/${orderCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}