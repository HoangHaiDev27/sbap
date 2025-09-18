import { API_ENDPOINTS } from "../config/apiConfig";

export async function getUsers() {
  const res = await fetch(API_ENDPOINTS.USERS);
  return res.json();
}

export async function getUser(id) {
  const res = await fetch(`${API_ENDPOINTS.USERS}/${id}`);
  return res.json();
}

export async function updateUser(id, user) {
  const res = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
  return res.json();
}