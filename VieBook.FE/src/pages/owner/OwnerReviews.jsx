import { useState } from "react";
import ReviewStats from "../../components/owner/reviews/ReviewStats";
import ReviewFilters from "../../components/owner/reviews/ReviewFilters";
import ReviewItem from "../../components/owner/reviews/ReviewItem";

// Demo data (10 reviews)
const reviewsData = [
  {
    id: 1,
    book: "Đắc Nhân Tâm",
    customer: "Nguyễn Minh Anh",
    avatar: "https://i.pravatar.cc/40?img=1",
    rating: 5,
    date: "16/01/2025",
    content:
      "Cuốn sách rất hay, giúp tôi hiểu rõ hơn về cách giao tiếp và xây dựng mối quan hệ.",
    replied: true,
    reply: "Cảm ơn bạn đã đánh giá!",
  },
  {
    id: 2,
    book: "Tư Duy Nhanh Và Chậm",
    customer: "Trần Văn Đức",
    avatar: "https://i.pravatar.cc/40?img=2",
    rating: 4,
    date: "14/01/2025",
    content: "Sách khá khó hiểu ở một số phần, nhưng nhìn chung rất bổ ích.",
    replied: false,
    reply: "",
  },
  {
    id: 3,
    book: "Nhà Giả Kim",
    customer: "Lê Thảo Nhi",
    avatar: "https://i.pravatar.cc/40?img=3",
    rating: 5,
    date: "12/01/2025",
    content: "Một cuốn sách truyền cảm hứng tuyệt vời, đọc xong thấy nhiều động lực hơn.",
    replied: true,
    reply: "Rất vui vì bạn thấy hữu ích!",
  },
  {
    id: 4,
    book: "Dám Bị Ghét",
    customer: "Phạm Hồng Quân",
    avatar: "https://i.pravatar.cc/40?img=4",
    rating: 3,
    date: "10/01/2025",
    content: "Nội dung có phần lặp lại, nhưng tư tưởng khá mới mẻ.",
    replied: false,
    reply: "",
  },
  {
    id: 5,
    book: "Không Gia Đình",
    customer: "Vũ Thanh Hằng",
    avatar: "https://i.pravatar.cc/40?img=5",
    rating: 5,
    date: "08/01/2025",
    content: "Câu chuyện cảm động, nhiều đoạn làm mình rơi nước mắt.",
    replied: true,
    reply: "Cảm ơn bạn đã chia sẻ cảm xúc!",
  },
  {
    id: 6,
    book: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    customer: "Ngô Hải Long",
    avatar: "https://i.pravatar.cc/40?img=6",
    rating: 4,
    date: "06/01/2025",
    content: "Có nhiều lời khuyên thực tế cho giới trẻ, nhưng đôi chỗ hơi sáo rỗng.",
    replied: false,
    reply: "",
  },
  {
    id: 7,
    book: "Khéo Ăn Nói Sẽ Có Được Thiên Hạ",
    customer: "Đỗ Mai Lan",
    avatar: "https://i.pravatar.cc/40?img=7",
    rating: 5,
    date: "04/01/2025",
    content: "Rất hữu ích cho công việc bán hàng của mình.",
    replied: true,
    reply: "Chúc bạn áp dụng thành công!",
  },
  {
    id: 8,
    book: "7 Thói Quen Hiệu Quả",
    customer: "Hoàng Văn Bình",
    avatar: "https://i.pravatar.cc/40?img=8",
    rating: 4,
    date: "02/01/2025",
    content: "Thực sự đáng đọc, giúp mình thay đổi thói quen tích cực hơn.",
    replied: true,
    reply: "Cảm ơn bạn đã phản hồi!",
  },
  {
    id: 9,
    book: "Cha Giàu Cha Nghèo",
    customer: "Nguyễn Hải Yến",
    avatar: "https://i.pravatar.cc/40?img=9",
    rating: 5,
    date: "30/12/2024",
    content: "Kiến thức tài chính dễ hiểu, phù hợp cho người mới bắt đầu.",
    replied: false,
    reply: "",
  },
  {
    id: 10,
    book: "Quẳng Gánh Lo Đi Và Vui Sống",
    customer: "Trịnh Văn Lộc",
    avatar: "https://i.pravatar.cc/40?img=10",
    rating: 4,
    date: "28/12/2024",
    content: "Cuốn sách nhẹ nhàng, giúp mình suy nghĩ tích cực hơn.",
    replied: true,
    reply: "Cảm ơn bạn đã đọc sách!",
  },
];


export default function OwnerReviews() {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(reviewsData.length / pageSize);
  const paginated = reviewsData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Đánh giá & Phản hồi</h1>

      <ReviewStats />
      <ReviewFilters />

      <div className="space-y-4">
        {paginated.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Trước
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1 ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
