import { create } from "zustand";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { getUserId } from "../../api/authApi";

export const useCoinsStore = create((set) => ({
  coins: 0,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  setCoins: (value) => set({ coins: value }),
  fetchCoins: async (userId = null) => {
    try {
      const currentUserId = userId || getUserId();
      if (!currentUserId) {
        console.warn("No user ID available for fetching coins");
        return;
      }
      
      const res = await fetch(`${API_ENDPOINTS.USERS}/${currentUserId}`);
      const data = await res.json();
      set({ coins: data.wallet || 0 });
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  },
}));