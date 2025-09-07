import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import RelatedBooks from "./RelatedBook";
import {
  RiArrowRightSLine,
  RiBookOpenLine,
  RiPlayCircleLine,
  RiShoppingCartLine,
  RiHeartLine,
  RiShareLine,
  RiStarFill,
  RiStarLine,
  RiThumbUpLine,
  RiFlagLine,
} from "react-icons/ri";

export default function BookDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [showFullDescription, setShowFullDescription] = useState(false);

  const book = {
    id: parseInt(id),
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    narrator: "Nguyễn Minh Hoàng",
    category: "Tâm lý học",
    subcategory: "Phát triển bản thân",
    format: ["Sách điện tử", "Sách nói"],
    rating: 4.8,
    reviews: 1205,
    price: 89000,
    originalPrice: 120000,
    image:
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT5IqSs9SV7eTNQiNZSXsScSZXlw04fmXrMroTGQ6Q-bObZ_ZK_EBsPSrQzXXTklzyOi1JblhROK86yhNtJNJk6NG_rd41i7v-r4KhnSY2kuFSb0D3XZtcM&usqp=CAc",
    description:
      "Đắc Nhân Tâm là cuốn sách kinh điển về nghệ thuật giao tiếp và ảnh hưởng đến người khác.",
    fullDescription:
      "Đây là phiên bản đầy đủ của mô tả cuốn sách Đắc Nhân Tâm...",
    duration: "7h 30m",
    chapters: 18,
    language: "Tiếng Việt",
    publisher: "NXB Trẻ",
    publishDate: "2023",
    isbn: "978-604-1-23456-7",
    tags: ["Tâm lý học", "Kỹ năng sống", "Giao tiếp", "Phát triển bản thân"],
  };

  const reviews = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      rating: 5,
      date: "15/12/2023",
      content:
        "Cuốn sách tuyệt vời! Đã thay đổi cách tôi giao tiếp với mọi người.",
      helpful: 12,
    },
    {
      id: 2,
      user: "Trần Thị B",
      rating: 4,
      date: "10/12/2023",
      content: "Nội dung hay, dễ hiểu. Giọng đọc của người kể chuyện rất hay.",
      helpful: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-white">
          Trang chủ
        </Link>
        <RiArrowRightSLine />
        <Link to="/books" className="hover:text-white">
          Sách
        </Link>
        <RiArrowRightSLine />
        <span className="text-white">{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Book Cover + Actions */}
        <div className="lg:col-span-1">
          <img
            src={book.image}
            alt={book.title}
            className="w-full max-w-sm mx-auto rounded-lg shadow-2xl mb-6"
          />

          {/* Actions */}
          <div className="space-y-4">
            {/* Read & Listen */}
            <div className="flex space-x-2">
              <Link
                to={`/reader/${book.id}`}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2"
              >
                <RiBookOpenLine />
                Đọc ngay
              </Link>

              {book.format.includes("Sách nói") && (
                <Link
                  to={`/player/${book.id}`}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <RiPlayCircleLine />
                  Nghe
                </Link>
              )}
            </div>

            {/* Add to Cart */}
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2">
              <RiShoppingCartLine />
              Thêm vào giỏ hàng - {book.price.toLocaleString()}đ
            </button>

            {/* Favorite & Share */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                <RiHeartLine />
                Yêu thích
              </button>
              <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                <RiShareLine />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Book Info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-300 mb-4">bởi {book.author}</p>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) =>
                i < Math.floor(book.rating) ? (
                  <RiStarFill key={i} className="text-yellow-400" />
                ) : (
                  <RiStarLine key={i} className="text-yellow-400" />
                )
              )}
            </div>
            <span className="text-gray-400 text-sm">
              {book.rating} ({book.reviews} đánh giá)
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6 flex space-x-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 ${
                activeTab === "overview"
                  ? "border-b-2 border-orange-500 text-orange-400"
                  : "text-gray-400"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-2 ${
                activeTab === "details"
                  ? "border-b-2 border-orange-500 text-orange-400"
                  : "text-gray-400"
              }`}
            >
              Chi tiết
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 ${
                activeTab === "reviews"
                  ? "border-b-2 border-orange-500 text-orange-400"
                  : "text-gray-400"
              }`}
            >
              Đánh giá
            </button>
          </div>

          {/* Nội dung tab */}
          {activeTab === "overview" && (
            <div>
              <p className="text-gray-300 mb-4">
                {showFullDescription ? book.fullDescription : book.description}
              </p>
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-orange-400"
              >
                {showFullDescription ? "Thu gọn" : "Xem thêm"}
              </button>
            </div>
          )}

          {activeTab === "details" && (
            <ul className="text-gray-300 space-y-2">
              <li>Tác giả: {book.author}</li>
              <li>Người kể: {book.narrator}</li>
              <li>Thời lượng: {book.duration}</li>
              <li>Số chương: {book.chapters}</li>
              <li>Ngôn ngữ: {book.language}</li>
              <li>NXB: {book.publisher}</li>
              <li>Năm XB: {book.publishDate}</li>
              <li>ISBN: {book.isbn}</li>
            </ul>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                  <h4 className="font-medium">{review.user}</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) =>
                      i < review.rating ? (
                        <RiStarFill key={i} className="text-yellow-400" />
                      ) : (
                        <RiStarLine key={i} className="text-yellow-400" />
                      )
                    )}
                  </div>
                  <p className="text-gray-300 mt-2">{review.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <button className="flex items-center text-gray-400 hover:text-white">
                      <RiThumbUpLine className="mr-1" />
                      Hữu ích ({review.helpful})
                    </button>
                    <button className="flex items-center text-gray-400 hover:text-white">
                      <RiFlagLine className="mr-1" />
                      Báo cáo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Books */}
      <div className="mt-12">
        <RelatedBooks currentBookId={book.id} category={book.category} />
      </div>
    </div>
  );
}
