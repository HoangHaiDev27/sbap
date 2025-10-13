import { create } from "zustand";
import { API_ENDPOINTS } from "../../config/apiConfig";
import { getUserId, getToken } from "../../api/authApi";

export const useCoinsStore = create((set) => ({
  coins: 0,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  setCoins: (value) => {
    console.log("CoinStore - Setting coins to:", value);
    set({ coins: value });
  },
  fetchCoins: async (userId = null) => {
    try {
      const currentUserId = userId || getUserId();
      if (!currentUserId) {
        console.warn("No user ID available for fetching coins");
        return;
      }
      
      const token = getToken();
      const res = await fetch(`${API_ENDPOINTS.USERS}/${currentUserId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch user data: ${res.status}`);
      }
      const data = await res.json();
      console.log("CoinStore - Fetched user data:", data);
      const walletAmount = data.wallet || 0;
      console.log("CoinStore - Setting coins to wallet amount:", walletAmount, "type:", typeof walletAmount);
      set({ coins: walletAmount });
    } catch (error) {
      console.error("Error fetching coins:", error);
      set({ coins: 0 });
    }
  },
}));