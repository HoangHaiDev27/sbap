const API_URL = "http://localhost:5757/api/users";

export async function getUsers() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function getUser(id) {
  const res = await fetch(`${API_URL}/${id}`);
  return res.json();
}

export async function updateUser(id, user) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
  return res.json();
}