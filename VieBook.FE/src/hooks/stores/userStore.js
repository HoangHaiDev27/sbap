import { create } from "zustand";
import { getCurrentUser } from "../../api/userApi";
import { getUserId, getToken } from "../../api/authApi";
import { API_ENDPOINTS } from "../../config/apiConfig";

export const useUserStore = create((set, get) => ({
  // State
  user: null,
  isLoading: false,
  error: null,

  // Fetch user data
  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const userData = await getCurrentUser();
      console.log("UserStore - Fetched user data:", userData);
      set({ user: userData, isLoading: false });
      return userData;
    } catch (error) {
      console.error("UserStore - Error fetching user:", error);
      set({ error: error.message, isLoading: false });
      
      // Fallback to localStorage
      const localUser = JSON.parse(localStorage.getItem("auth_user") || "null");
      if (localUser) {
        set({ user: localUser, isLoading: false });
      }
      
      throw error;
    }
  },

  // Update user in store (called after profile update)
  updateUserData: async () => {
    try {
      set({ isLoading: true, error: null });
      const updatedUser = await getCurrentUser();
      console.log("UserStore - User data updated, new user data:", updatedUser);
      set({ user: updatedUser, isLoading: false });
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent("user:profile:updated", { 
        detail: { user: updatedUser } 
      }));
      
      return updatedUser;
    } catch (error) {
      console.error("UserStore - Error updating user data:", error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Get avatar URL
  getAvatarUrl: () => {
    return get().user?.userProfile?.avatarUrl || null;
  },

  // Get user profile
  getUserProfile: () => {
    return get().user?.userProfile || null;
  },

  // Set user directly (for manual updates)
  setUser: (user) => {
    console.log("UserStore - Setting user:", user);
    set({ user });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Initialize user data
  initializeUser: async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn("No user ID available for user initialization");
      return;
    }
    
    console.log("Initializing user data for user:", userId);
    await get().fetchUser();
  }
}));

