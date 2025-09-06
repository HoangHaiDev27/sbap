import React from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import AuthorSection from "../components/home/AuthorSection";

export default function HomeManager() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Gợi ý cho người mới bắt đầu */}
        <BookCarousel
          title="Gợi ý cho người mới bắt đầu"
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
          ]}
        />

        {/* Sách nói chất lượng */}
        <BookCarousel
          title="Sách nói chất lượng"
          hasCategories
          categories={["Tất cả", "Tâm linh", "Kinh tế", "Chính trị", "Lịch sử"]}
          books={[
            {
              id: "6",
              title: "Dám Dẫn Đầu",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/825/webp_3c2ed8637391e7d1.webp",
              author: "Tác giả 6",
              category: "Lãnh đạo",
            },
          ]}
        />

        {/* Truyện nói hấp dẫn */}
        <BookCarousel
          title="Truyện nói hấp dẫn"
          hasCategories
          categories={[
            "Tất cả",
            "Việt Nam Danh Tác",
            "Kinh điển Quốc tế",
            "Ngôn tình",
            "Trinh thám",
          ]}
          books={[
            {
              id: "10",
              title: "Tỉnh Mộng - Hồ Biểu Chánh",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/434781/webp_e21bef3677d9a3cc.webp",
              author: "Hồ Biểu Chánh",
              category: "Danh tác",
            },
          ]}
        />

        {/* Podcast đặc sắc */}
        <BookCarousel
          title="Podcast đặc sắc"
          hasCategories
          categories={[
            "Tất cả",
            "Văn hóa",
            "Giải trí",
            "Kiến thức",
            "Pháp thoại",
          ]}
          books={[
            {
              id: "13",
              title: "English For Office",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/429154/webp_f268c4174fef177a.webp",
              author: "Tác giả 13",
              category: "Học ngoại ngữ",
            },
            {
              id: "14",
              title: "Thông Deep",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/432998/webp_a22041ed2d9c6de8.webp",
              author: "Tác giả 14",
              category: "Văn hóa",
            },
          ]}
        />

        {/* Tác giả nổi bật */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <AuthorSection />
        </div>
      </div>
    </div>
  );
}
