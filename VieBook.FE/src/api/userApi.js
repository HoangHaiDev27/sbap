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

export async function updateUser(id, user) {
  const res = await authFetch(`${API_ENDPOINTS.USERS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
}