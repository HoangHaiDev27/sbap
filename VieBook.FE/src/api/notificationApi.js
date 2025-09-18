import { API_ENDPOINTS } from "../config/apiConfig";

// Lấy tất cả thông báo của user
export async function getNotifications(userId) {
  const res = await fetch(API_ENDPOINTS.USER_NOTIFICATIONS(userId));
  return res.json();
}

// Lấy thông báo chưa đọc của user
export async function getUnreadNotifications(userId) {
  const res = await fetch(API_ENDPOINTS.USER_UNREAD_NOTIFICATIONS(userId));
  return res.json();
}

// Lấy số lượng thông báo chưa đọc
export async function getUnreadCount(userId) {
  const res = await fetch(API_ENDPOINTS.USER_UNREAD_COUNT(userId));
  return res.json();
}

// Lấy thông báo gần đây
export async function getRecentNotifications(userId, count = 10) {
  const res = await fetch(API_ENDPOINTS.USER_RECENT_NOTIFICATIONS(userId, count));
  return res.json();
}

// Lấy thông báo theo ID
export async function getNotificationById(notificationId) {
  const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
  return res.json();
}

// Đánh dấu thông báo đã đọc
export async function markAsRead(notificationId) {
  const res = await fetch(API_ENDPOINTS.NOTIFICATION_MARK_READ(notificationId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

// Đánh dấu tất cả thông báo đã đọc
export async function markAllAsRead(userId) {
  const res = await fetch(API_ENDPOINTS.USER_MARK_ALL_READ(userId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

// Xóa thông báo
export async function deleteNotification(notificationId) {
  const res = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`, {
    method: "DELETE",
  });
  return res.json();
}

// Lấy danh sách loại thông báo
export async function getNotificationTypes() {
  const res = await fetch(API_ENDPOINTS.NOTIFICATION_TYPES);
  return res.json();
}