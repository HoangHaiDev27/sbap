import { create } from "zustand";
import { getAdminById } from "../../api/adminApi";

export const useAdminStore = create((set) => ({
  admin: null,
  fetchAdmin: async (id = 7) => {
    try {
      const data = await getAdminById(id); // fetch admin theo id
      set({ admin: data });
    } catch (error) {
      console.error("Failed to fetch admin:", error);
    }
  },
  updateAdmin: (newData) => set({ admin: newData }), // update trực tiếp
}));