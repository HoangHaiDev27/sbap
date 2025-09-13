import React from "react";
import HeroSection from "../components/home/HeroSection";
import BookCarousel from "../components/home/BookCarousel";
import AuthorSection from "../components/home/AuthorSection";

export default function HomeManager() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
    <div className="flex-1">
      <HeroSection />

      <div className="px-6 py-8 space-y-12">
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
          categories={[
            "Tất cả",
            "Tâm linh",
            "Kinh tế",
            "Chính trị",
            "Lịch sử",
            "Tâm lý học",
          ]}
          books={[
            {
              id: "6",
              title: "Dám Dẫn Đầu",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/825/webp_3c2ed8637391e7d1.webp",
              author: "Tác giả 6",
              category: "Lãnh đạo",
            },
            {
              id: "7",
              title: "Từng Bước Nở Hoa Sen",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/429056/webp_f3ccdd27d2000e3f.webp",
              author: "Ka Nguyễn",
              category: "Tâm linh",
            },
          ]}
        />

        <BookCarousel
          title="Truyện nói hấp dẫn"
          hasCategories={true}
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
            {
              id: "11",
              title: "Là Đánh Mất Hay Chưa Từng Có",
              image:
                "https://voiz-prod.s3-wewe.cloud.cmctelecom.vn/uploads/avatar/filename/416826/webp_e7ba222503aa0b79.webp",
              author: "Tác giả 11",
              category: "Ngôn tình",
            },
          ]}
        />

        <AuthorSection />
      </div>
    </div>
    </div>
  );
}
