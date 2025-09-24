import React, { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import AuthorSection from "../components/home/AuthorSection";
import { getAudioBooks } from "../api/audioBookApi";
import { getReadBooks, getAllCategories } from "../api/bookApi";

export default function HomeManager() {
  const [audioBooks, setAudioBooks] = useState([]);
  const [readBooks, setReadBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const [audioRes, readRes, categoriesRes] = await Promise.all([
          getAudioBooks().catch(() => []),
          getReadBooks().catch(() => []),
          getAllCategories().catch(() => []),
        ]);

        if (cancelled) return;

        const mapToCarouselItem = (b) => ({
          id: b.id,
          title: b.title,
          image: b.image,
          author: b.author || b.narrator || "",
          category: b.category || "",
        });

        setAudioBooks(Array.isArray(audioRes) ? audioRes.map(mapToCarouselItem) : []);
        setReadBooks(Array.isArray(readRes) ? readRes.map(mapToCarouselItem) : []);
        const catNames = Array.isArray(categoriesRes) ? categoriesRes.map(c => c.name).filter(Boolean) : [];
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
          title="Gợi ý cho người bạn"
          books={[
            {
              id: "1",
              title: "Cặp Đôi Hoàn Cảnh",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/674/webp_4619250472f4de917b13d976c5f699daaa9f80b0.webp",
              author: "Tác giả 1",
              category: "Truyện nói",
            },
            {
              id: "2",
              title: "Sử Ký III - Thế Gia",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/427775/webp_2487324742bb2e88.webp",
              author: "Tác giả 2",
              category: "Lịch sử",
            },
            {
              id: "3",
              title: "Truyện Ngắn Thạch Lam 1",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/1935/webp_791488618ba8b70aa2082505031c3e1f922eba1d.webp",
              author: "Thạch Lam",
              category: "Văn học",
            },
          ]}
        />

        <BookCarousel
          title="Sách nói chất lượng"
          hasCategories={true}
          categories={categories}
          books={loading ? [] : audioBooks}
        />

        <BookCarousel
          title="Truyện đọc hấp dẫn"
          hasCategories={true}
          categories={categories}
          books={loading ? [] : readBooks}
        />

        <AuthorSection />
      </div>
    </div>
    </div>
  );
}
