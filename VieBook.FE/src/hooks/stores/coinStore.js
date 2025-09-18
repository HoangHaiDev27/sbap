import { create } from "zustand";
const API_URL = "http://localhost:5757/api/users";
export const useCoinsStore = create((set) => ({
  coins: 0,
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  setCoins: (value) => set({ coins: value }),
  fetchCoins: async (userId) => {
    try {
    const res = await fetch(`${API_URL}/${userId}`);
      const data = await res.json();
      set({ coins: data.wallet });
    } catch (error) {
      console.error("Error fetching coins:", error);
    }
  },
}));