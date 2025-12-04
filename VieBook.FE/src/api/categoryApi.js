import { API_ENDPOINTS } from "../config/apiConfig";

// Hàm dùng chung để xử lý fetch và lỗi
async function handleFetch(url, options, defaultError) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMessage = defaultError;
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  return options?.method === "PUT" || options?.method === "DELETE" ? true : res.json();
}

// Lấy tất cả categories
export async function getAllCategories() {
  return handleFetch(API_ENDPOINTS.CATEGORIES.GET_ALL, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  }, "Lấy danh sách thể loại thất bại");
}

// Lấy category theo ID
export async function getCategoryById(categoryId) {
  return handleFetch(API_ENDPOINTS.CATEGORIES.GET_BY_ID(categoryId), {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  }, "Lấy thông tin thể loại thất bại");
}

// Tạo category mới
export async function createCategory(categoryData) {
  return handleFetch(API_ENDPOINTS.CATEGORIES.CREATE, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(categoryData),
  }, "Tạo thể loại mới thất bại");
}

// Cập nhật category
export async function updateCategory(categoryId, categoryData) {
  return handleFetch(API_ENDPOINTS.CATEGORIES.UPDATE(categoryId), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(categoryData),
  }, "Cập nhật thể loại thất bại");
}

// Xóa category
export async function deleteCategory(categoryId) {
  const res = await fetch(API_ENDPOINTS.CATEGORIES.DELETE(categoryId), {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });
  
  if (!res.ok) {
    let errorMessage = "Xóa thể loại thất bại";
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  // Nếu response là 200 với message, category đã được chuyển sang không hoạt động
  if (res.status === 200) {
    const data = await res.json();
    return { deactivated: true, message: data.message };
  }

  // Nếu response là 204, category đã được xóa thành công
  return { deactivated: false, message: null };
}
