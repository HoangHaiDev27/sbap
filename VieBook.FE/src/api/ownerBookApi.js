import { API_ENDPOINTS } from "../config/apiConfig";

// Lấy tất cả sách theo ownerId
export async function getBooksByOwner(ownerId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.GET_ALL_BY_OWNER(ownerId));
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

// Lấy chi tiết 1 sách
export async function getBookById(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.GET_BY_ID(bookId));
  if (!res.ok) throw new Error("Failed to fetch book detail");
  return res.json();
}

// Tạo mới sách
export async function createBook(payload) {
  const res = await fetch(API_ENDPOINTS.BOOKS.CREATE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create book");
  return res.json();
}

// Cập nhật sách
export async function updateBook(bookId, payload) {
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE(bookId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update book");
  return res.json();
}

// Xóa sách
export async function deleteBook(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.DELETE(bookId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete book");
  return true;
}

// Lấy tất cả categories
export async function getCategories() {
  const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ALL);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

