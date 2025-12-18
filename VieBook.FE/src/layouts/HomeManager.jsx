import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import { getAudioBooks } from "../api/audioBookApi";
import {
  getReadBooks,
  getAllCategories,
  getRecommendations,
  getCollaborativeRecommendations,
} from "../api/bookApi";
import { getUserId } from "../api/authApi";
import { useHomeStore } from "../hooks/stores/homeStore";
import ChatbaseWidget from "../components/chat/ChatbaseWidget"

export default function HomeManager() {
  const {
    audioBooks,
    readBooks,
    categories,
    recommendBooks,
    collaborativeRecommendBooks,
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

        const [audioRes, readRes, categoriesRes, recommendRes, collaborativeRes] =
          await Promise.all([
            getAudioBooks().catch(() => []),
            getReadBooks().catch(() => []),
            getAllCategories().catch(() => []),
            getRecommendations(userId).catch(() => []),
            userId ? getCollaborativeRecommendations(userId, 10).catch(() => []) : Promise.resolve([]),
          ]);

        if (cancelled) return;

        // Extract data nếu có wrapper (response có thể là { data: [...] } hoặc { code: 0, data: [...] })
        const extractData = (response) => {
          if (Array.isArray(response)) return response;
          if (response?.data && Array.isArray(response.data)) return response.data;
          if (response?.Data && Array.isArray(response.Data)) return response.Data;
          return [];
        };

        const audioBooksData = extractData(audioRes);
        const readBooksData = extractData(readRes);
        const recommendBooksData = extractData(recommendRes);

        // Debug: Log một vài books để xem structure
        if (audioBooksData.length > 0) {
          console.log("Sample audio book:", audioBooksData[0]);
        }
        if (readBooksData.length > 0) {
          console.log("Sample read book:", readBooksData[0]);
        }

        const mapToCarouselItem = (b) => {
          // Extract promotion data - kiểm tra nhiều format
          const hasPromotion = b.hasPromotion !== undefined ? b.hasPromotion : 
                              (b.HasPromotion !== undefined ? b.HasPromotion : false);
          const discountValue = b.discountValue !== undefined ? b.discountValue : 
                               (b.DiscountValue !== undefined ? b.DiscountValue : null);
          
          // Debug: log để kiểm tra promotion
          if (hasPromotion || discountValue !== null) {
            console.log("Book with promotion (mapped):", { 
              title: b.title || b.Title, 
              hasPromotion, 
              discountValue,
              rawHasPromotion: b.hasPromotion,
              rawHasPromotionCaps: b.HasPromotion,
              rawDiscountValue: b.discountValue,
              rawDiscountValueCaps: b.DiscountValue
            });
          }
          
          const mapped = {
            id: b.bookId || b.id || b.Id || b.BookId,
            title: b.title || b.Title,
            image: b.coverUrl || b.image || b.Image || b.CoverUrl,
            author: b.author || b.Author || b.narrator || b.Narrator || "",
            category: b.category || b.Category || b.categoryIds?.join(", ") || b.Categories?.map(c => c.name || c.Name || c).join(", ") || "",
            completionStatus: b.completionStatus || b.CompletionStatus || "Ongoing",
            // Promotion data - giữ nguyên giá trị boolean và number
            hasPromotion: Boolean(hasPromotion),
            discountValue: discountValue !== null && discountValue !== undefined ? Number(discountValue) : null,
          };
          
          return mapped;
        };

        const data = {
          audioBooks: audioBooksData.map(mapToCarouselItem),
          readBooks: readBooksData.map(mapToCarouselItem),
          recommendBooks: recommendBooksData.map(mapToCarouselItem),
          collaborativeRecommendBooks: extractData(collaborativeRes).map(mapToCarouselItem),
          categories: [
            "Tất cả",
            ...(Array.isArray(categoriesRes)
              ? categoriesRes.map((c) => c.name || c.Name).filter(Boolean)
              : []),
          ],
        };

        // Debug: Kiểm tra data sau khi map
        const booksWithPromo = [
          ...data.audioBooks.filter(b => b.hasPromotion),
          ...data.readBooks.filter(b => b.hasPromotion),
          ...data.recommendBooks.filter(b => b.hasPromotion)
        ];
        if (booksWithPromo.length > 0) {
          console.log("Books with promotion in final data:", booksWithPromo);
        }

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
          {collaborativeRecommendBooks && collaborativeRecommendBooks.length > 0 && (
            <BookCarousel
              title="Gợi ý từ cộng đồng"
              books={loading ? [] : collaborativeRecommendBooks}
            />
          )}
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
      <ChatbaseWidget />
    </div>
  );
}
