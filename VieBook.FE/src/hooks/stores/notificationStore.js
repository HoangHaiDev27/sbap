import { create } from "zustand";
import { 
  getNotifications, 
  getUnreadNotifications, 
  getUnreadCount, 
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../../api/notificationApi";

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  userId: 4, // Default user ID

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
        console.log(`Setting unread count to: ${response.data.unreadCount}`);
        set({ unreadCount: response.data.unreadCount });
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
      const response = await markAsRead(notificationId);
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
      const response = await markAllAsRead(targetUserId);
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
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotifications: [notification, ...state.unreadNotifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Initialize notifications for user
  initializeNotifications: async (userId = null) => {
    const targetUserId = userId || get().userId;
    console.log("Initializing notifications for user:", targetUserId);
    set({ userId: targetUserId });
    
    // Fetch all data in parallel
    await Promise.all([
      get().fetchNotifications(targetUserId),
      get().fetchUnreadNotifications(targetUserId),
      get().fetchUnreadCount(targetUserId)
    ]);
    
    console.log("Initialization complete. Current unread count:", get().unreadCount);
  }
}));
