import { create } from "zustand";
import { 
  getNotifications, 
  getUnreadNotifications, 
  getUnreadCount, 
  getRecentNotifications,
  markAsRead as markAsReadApi,
  markAllAsRead as markAllAsReadApi,
  deleteNotification
} from "../../api/notificationApi";
import { getUserId } from "../../api/authApi";

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  userId: null, // Will be set dynamically

  // Actions
  setUserId: (userId) => set({ userId }),

  // Fetch all notifications
  fetchNotifications: async (userId = null) => {
    const targetUserId = userId || get().userId;
    set({ isLoading: true, error: null });
    
    try {
      const response = await getNotifications(targetUserId);
      if (response.error === 0) {
        set({ notifications: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch unread notifications
  fetchUnreadNotifications: async (userId = null) => {
    const targetUserId = userId || get().userId;
    set({ isLoading: true, error: null });
    
    try {
      const response = await getUnreadNotifications(targetUserId);
      if (response.error === 0) {
        set({ unreadNotifications: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async (userId = null) => {
    const targetUserId = userId || get().userId;
    
    try {
      console.log(`Fetching unread count for user ${targetUserId}`);
      const response = await getUnreadCount(targetUserId);
      console.log("Unread count response:", response);
      if (response.error === 0) {
        const serverCount = response.data.unreadCount || 0;
        const currentCount = get().unreadCount || 0;
        // Use the larger value to avoid overwriting with stale data
        const newCount = Math.max(serverCount, currentCount);
        console.log(`Setting unread count to: ${newCount} (server: ${serverCount}, current: ${currentCount})`);
        set({ unreadCount: newCount });
      } else {
        console.error("Error in unread count response:", response.message);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  },

  // Fetch recent notifications
  fetchRecentNotifications: async (userId = null, count = 10) => {
    const targetUserId = userId || get().userId;
    
    try {
      const response = await getRecentNotifications(targetUserId, count);
      if (response.error === 0) {
        set({ notifications: response.data });
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await markAsReadApi(notificationId);
      if (response.error === 0) {
        // Update local state
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.notificationId === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
          unreadNotifications: state.unreadNotifications.filter(
            notification => notification.notificationId !== notificationId
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId = null) => {
    const targetUserId = userId || get().userId;
    
    try {
      const response = await markAllAsReadApi(targetUserId);
      if (response.error === 0) {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            isRead: true
          })),
          unreadNotifications: [],
          unreadCount: 0
        }));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await deleteNotification(notificationId);
      if (response.error === 0) {
        set((state) => ({
          notifications: state.notifications.filter(
            notification => notification.notificationId !== notificationId
          ),
          unreadNotifications: state.unreadNotifications.filter(
            notification => notification.notificationId !== notificationId
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  },

  // Add new notification (for real-time updates)
  addNotification: (notification) => {
    console.log("NotificationStore - Adding notification:", notification);
    set((state) => {
      // Ensure notification has required fields
      const notificationId = notification.notificationId || notification.NotificationId;
      if (!notificationId) {
        console.warn("Notification missing notificationId, skipping add");
        return state;
      }
      
      // Check if notification already exists to avoid duplicates
      const exists = state.notifications.some(
        n => (n.notificationId || n.NotificationId) === notificationId
      );
      
      if (exists) {
        console.log("Notification already exists, skipping add");
        return state;
      }
      
      // Ensure isRead is false for new notifications
      const isRead = notification.isRead === false ? false : (notification.IsRead === false ? false : false);
      
      // Normalize notification format
      const normalizedNotification = {
        notificationId: notificationId,
        userId: notification.userId || notification.UserId,
        type: notification.type || notification.Type,
        title: notification.title || notification.Title,
        body: notification.body || notification.Body,
        isRead: isRead,
        createdAt: notification.createdAt || notification.CreatedAt,
        userName: notification.userName || notification.UserName,
        userEmail: notification.userEmail || notification.UserEmail
      };
      
      console.log("Adding notification with isRead:", normalizedNotification.isRead, "Current unreadCount:", state.unreadCount);
      
      return {
        notifications: [normalizedNotification, ...state.notifications],
        unreadNotifications: isRead 
          ? state.unreadNotifications 
          : [normalizedNotification, ...state.unreadNotifications],
        unreadCount: isRead 
          ? state.unreadCount 
          : (state.unreadCount || 0) + 1
      };
    });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Initialize notifications for user
  initializeNotifications: async (userId = null) => {
    const currentUserId = userId || getUserId();
    if (!currentUserId) {
      console.warn("No user ID available for notification initialization");
      return;
    }
    
    console.log("Initializing notifications for user:", currentUserId);
    set({ userId: currentUserId });
    
    // Fetch all data in parallel
    await Promise.all([
      get().fetchNotifications(currentUserId),
      get().fetchUnreadNotifications(currentUserId),
      get().fetchUnreadCount(currentUserId)
    ]);
    
    console.log("Initialization complete. Current unread count:", get().unreadCount);
  }
}));
