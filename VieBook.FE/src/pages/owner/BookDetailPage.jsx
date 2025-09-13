import { useParams } from "react-router-dom";
import { useState } from "react";
import BookOverview from "../../components/owner/bookDetail/BookOverview";
import BookContent from "../../components/owner/bookDetail/BookContent";
import BookReviews from "../../components/owner/bookDetail/BookReviews";
import BookInfoCard from "../../components/owner/bookDetail/BookInfoCard";
import BookStatsCard from "../../components/owner/bookDetail/BookStatsCard";

export default function BookDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 text-white grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Bên trái */}
      <div className="xl:col-span-1 space-y-6">
        <BookInfoCard bookId={id} />
      </div>

      {/* Bên phải */}
      <div className="xl:col-span-3 space-y-6">
        {/* Stats */}
        <BookStatsCard />

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-gray-700">
          {["overview", "content", "reviews"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 border-b-2 transition ${
                activeTab === tab
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" && "Tổng quan"}
              {tab === "content" && "Nội dung"}
              {tab === "reviews" && "Đánh giá"}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "overview" && <BookOverview bookId={id} />}
          {activeTab === "content" && <BookContent bookId={id} />}
          {activeTab === "reviews" && <BookReviews bookId={id} />}
        </div>
      </div>
    </div>
  );
}
