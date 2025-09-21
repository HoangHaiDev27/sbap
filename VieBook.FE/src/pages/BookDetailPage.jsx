import React from "react";
import { useParams } from "react-router-dom";
import BookDetailsPage from "../components/bookdetails/BookDetailsPage";
import BookDetailManager from "../layouts/BookDetailManager";

export default function BookDetailPage() {
  const { id } = useParams(); // lấy id từ URL

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Chi tiết sách */}
      <BookDetailsPage/>

      {/* Grid + Filter (các sách khác hoặc gợi ý)
      <div className="mt-12 px-6">
        <BookDetailManager />
      </div> */}
    </div>
  );
}

