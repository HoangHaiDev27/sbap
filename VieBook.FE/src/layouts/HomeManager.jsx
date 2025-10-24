import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import { getAudioBooks } from "../api/audioBookApi";
import {
  getReadBooks,
  getAllCategories,
  getRecommendations,
} from "../api/bookApi";
import { getUserId } from "../api/authApi";
import { useHomeStore } from "../hooks/stores/homeStore";

export default function HomeManager() {
  const {
    audioBooks,
    readBooks,
    categories,
    recommendBooks,
    loaded,
    setHomeData,
  } = useHomeStore();
  const [loading, setLoading] = useState(!loaded);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loaded) return; // đã có data rồi, không fetch lại

    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const userId = getUserId();

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
          completionStatus: b.completionStatus || "Ongoing", // Default to Ongoing
        });

        const data = {
          audioBooks: Array.isArray(audioRes)
            ? audioRes.map(mapToCarouselItem)
            : [],
          readBooks: Array.isArray(readRes)
            ? readRes.map(mapToCarouselItem)
            : [],
          recommendBooks: Array.isArray(recommendRes)
            ? recommendRes.map(mapToCarouselItem)
            : [],
          categories: [
            "Tất cả",
            ...(Array.isArray(categoriesRes)
              ? categoriesRes.map((c) => c.name).filter(Boolean)
              : []),
          ],
        };

        setHomeData(data); // ✅ lưu vào store Zustand
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
  }, [loaded, setHomeData]);

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
        </div>
      </div>
    </div>
  );
}
