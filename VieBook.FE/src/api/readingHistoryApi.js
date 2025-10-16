import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

// Lưu tiến độ đọc/nghe
export const saveReadingProgress = async (readingData) => {
    try {
        const response = await authFetch(API_ENDPOINTS.READING_HISTORY.SAVE_PROGRESS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readingData),
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || "Failed to save reading progress");
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving reading progress:', error);
        throw error;
    }
};

// Lấy lịch sử đọc/nghe
export const getReadingHistory = async (filter = {}) => {
    try {
        const queryParams = new URLSearchParams(filter).toString();
        const url = queryParams ? `${API_ENDPOINTS.READING_HISTORY.BASE}?${queryParams}` : API_ENDPOINTS.READING_HISTORY.BASE;
        
        const response = await authFetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || "Failed to fetch reading history");
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching reading history:', error);
        throw error;
    }
};

// Lấy lịch sử đọc/nghe có phân trang
export const getPaginatedReadingHistory = async (page = 1, pageSize = 10, filter = {}) => {
    try {
        const params = { ...filter, page, pageSize };
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_ENDPOINTS.READING_HISTORY.PAGINATED}?${queryParams}`;
        
        const response = await authFetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || "Failed to fetch paginated reading history");
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching paginated reading history:', error);
        throw error;
    }
};

// Lấy tiến độ hiện tại của một sách/chương
export const getCurrentReadingProgress = async (bookId, chapterId = null, readingType = 'Reading') => {
    try {
        const params = new URLSearchParams({
            bookId: bookId,
            readingType: readingType
        });
        
        if (chapterId) {
            params.append('chapterId', chapterId);
        }
        
        const response = await authFetch(`${API_ENDPOINTS.READING_HISTORY.CURRENT_PROGRESS}?${params.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || "Failed to fetch current reading progress");
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting current reading progress:', error);
        throw error;
    }
};

// Lấy lịch sử đọc/nghe theo ID
export const getReadingHistoryById = async (id) => {
    try {
        const response = await authFetch(`${API_ENDPOINTS.READING_HISTORY.BASE}/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `Failed to fetch reading history with ID ${id}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching reading history with ID ${id}:`, error);
        throw error;
    }
};

// Cập nhật tiến độ đọc/nghe
export const updateReadingProgress = async (readingHistoryId, data) => {
    try {
        const response = await authFetch(`${API_ENDPOINTS.READING_HISTORY.BASE}/${readingHistoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || "Failed to update reading progress");
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating reading progress:', error);
        throw error;
    }
};

// Xóa lịch sử đọc/nghe
export const deleteReadingHistory = async (readingHistoryId) => {
    try {
        const response = await authFetch(`${API_ENDPOINTS.READING_HISTORY.BASE}/${readingHistoryId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || `Failed to delete reading history with ID ${readingHistoryId}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error deleting reading history with ID ${readingHistoryId}:`, error);
        throw error;
    }
};