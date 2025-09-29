import { create } from "zustand";

export const useHomeStore = create((set) => ({
  audioBooks: [],
  readBooks: [],
  categories: [],
  recommendBooks: [],
  loaded: false, // đã fetch chưa?

  setHomeData: (data) =>
    set({
      audioBooks: data.audioBooks,
      readBooks: data.readBooks,
      categories: data.categories,
      recommendBooks: data.recommendBooks,
      loaded: true,
    }),
}));
