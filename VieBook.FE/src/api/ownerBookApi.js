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

  if (!res.ok) {
    if (res.status === 409) {
      // BE trả về Conflict ISBN
      const message = await res.text();
      throw new Error(message || "ISBN đã tồn tại");
    }
    throw new Error("Tạo mới sách thất bại");
  }

  return res.json();
}


// Cập nhật sách
export async function updateBook(bookId, payload) {
  const res = await fetch(API_ENDPOINTS.BOOKS.UPDATE(bookId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Cập nhật sách thất bại";
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "ISBN đã tồn tại hoặc dữ liệu không hợp lệ.";
      }
    }
    throw new Error(errorMessage);
  }

  return true;
}



// Xóa sách
export async function deleteBook(bookId) {
  const res = await fetch(API_ENDPOINTS.BOOKS.DELETE(bookId), {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Không thể xóa sách");
  return true;
}

// Lấy tất cả categories
export async function getCategories() {
  const res = await fetch(API_ENDPOINTS.CATEGORIES.GET_ALL);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function uploadBookImage(formData) {
  const res = await fetch(API_ENDPOINTS.UPLOADBOOKIMAGE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload ảnh thất bại");
  const data = await res.json();
  return data.imageUrl;
}
