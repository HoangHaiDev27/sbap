import React, { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import AuthorSection from "../components/home/AuthorSection";
import { getAudioBooks } from "../api/audioBookApi";
import {
  getReadBooks,
  getAllCategories,
  getRecommendations,
} from "../api/bookApi";
import { getUserId } from "../api/authApi";

export default function HomeManager() {
  const [audioBooks, setAudioBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendBooks, setRecommendBooks] = useState([]);
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const userId = getUserId();
        console.log("🧑‍💻 [HomeManager] userId:", userId);

        const [audioRes, readRes, categoriesRes, recommendRes] =
          await Promise.all([
            getAudioBooks().catch(() => []),
            getReadBooks().catch(() => []),
            getAllCategories().catch(() => []),
            getRecommendations(userId).catch(() => []),
          ]);

        if (cancelled) return;

        const mapToCarouselItem = (b) => ({
          id: b.bookId || b.id,
          title: b.title,
          image: b.coverUrl || b.image,
          author: b.author || b.narrator || "",
          category: b.category || b.categoryIds?.join(", ") || "",
        });

        setAudioBooks(
          Array.isArray(audioRes) ? audioRes.map(mapToCarouselItem) : []
        );
        setReadBooks(
          Array.isArray(readRes) ? readRes.map(mapToCarouselItem) : []
        );
        setRecommendBooks(
          Array.isArray(recommendRes) ? recommendRes.map(mapToCarouselItem) : []
        );
        const catNames = Array.isArray(categoriesRes)
          ? categoriesRes.map((c) => c.name).filter(Boolean)
          : [];
        setCategories(["Tất cả", ...catNames]);
      } catch (e) {
        if (!cancelled) setError("Không thể tải dữ liệu trang chủ.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex-1">
        <HeroSection />

        <div className="px-6 py-8 space-y-12">
          <BookCarousel
            title="Gợi ý cho bạn"
            books={loading ? [] : recommendBooks}
          />

          <BookCarousel
            title="Sách nói chất lượng"
            hasCategories={true}
            categories={categories}
            books={loading ? [] : audioBooks}
          />

          <BookCarousel
            title="Sách đọc hấp dẫn"
            hasCategories={true}
            categories={categories}
            books={loading ? [] : readBooks}
          />

          {/* <AuthorSection /> */}
        </div>
      </div>
    </div>
  );
}
