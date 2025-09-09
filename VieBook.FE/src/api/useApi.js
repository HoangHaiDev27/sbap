const API_URL = "http://localhost:5143/api/users";

export async function getUsers() {
  const res = await fetch(API_URL);
  return res.json();
}
