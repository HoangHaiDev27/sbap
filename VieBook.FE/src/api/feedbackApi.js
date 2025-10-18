import { API_ENDPOINTS } from "../config/apiConfig";
import { getToken } from "./authApi";

/**
 * Gửi báo cáo sách
 * @param {string} bookId - ID của sách
 * @param {string} content - Nội dung báo cáo
 * @returns {Promise} - Promise trả về kết quả
 */
export const submitBookReport = async (bookId, content) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Bạn cần đăng nhập để gửi báo cáo");
    }

    const response = await fetch(API_ENDPOINTS.FEEDBACK.BOOK_REPORT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        targetId: parseInt(bookId),
        content: content.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Có lỗi xảy ra khi gửi báo cáo");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting book report:", error);
    throw error;
  }
};

