import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

const API_URL = `${API_ENDPOINTS.API_BASE_URL}/api/ReminderSettings`;

// Lấy cài đặt nhắc nhở của user hiện tại
export async function getMyReminderSettings() {
  try {
    const response = await authFetch(`${API_URL}/my-settings`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch reminder settings");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error fetching reminder settings:", error);
    throw error;
  }
}

// Tạo hoặc cập nhật cài đặt nhắc nhở
export async function createOrUpdateReminderSettings(settingsData) {
  try {
    const response = await authFetch(`${API_URL}/my-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to save reminder settings");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error saving reminder settings:", error);
    throw error;
  }
}

// Cập nhật cài đặt nhắc nhở
export async function updateReminderSettings(settingsData) {
  try {
    const response = await authFetch(`${API_URL}/my-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to update reminder settings");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    throw error;
  }
}

// Xóa cài đặt nhắc nhở
export async function deleteReminderSettings() {
  try {
    const response = await authFetch(`${API_URL}/my-settings`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete reminder settings");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting reminder settings:", error);
    throw error;
  }
}
