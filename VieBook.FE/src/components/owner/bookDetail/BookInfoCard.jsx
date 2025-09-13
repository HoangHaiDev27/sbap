// eslint-disable-next-line no-unused-vars
export default function BookInfoCard({ bookId }) {
  const book = {
    title: "Triết học cuộc sống",
    author: "Nguyễn Văn A",
    price: "150,000 VND",
    rating: 4.8,
    ratingCount: 45,
    createdAt: "15/01/2024",
    updatedAt: "20/01/2024",
    tags: ["Triết học", "Chương"],
    status: "Đang bán",
    cover: "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg"
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg text-center shadow">
      <img src={book.cover} alt={book.title} className="mx-auto rounded shadow mb-4" />
      <h2 className="text-lg font-bold">{book.title}</h2>
      <p className="text-sm text-gray-400 mb-2">Tác giả: {book.author}</p>

      <div className="flex justify-center gap-2 mb-3">
        {book.tags.map((tag, i) => (
          <span key={i} className={`text-xs px-2 py-1 rounded ${i === 0 ? "bg-blue-600" : "bg-green-600"}`}>
            {tag}
          </span>
        ))}
      </div>

      <p className="text-orange-400 font-bold text-xl mb-2">{book.price}</p>
      <p className="text-yellow-400 text-sm mb-1">
        ⭐ {book.rating} ({book.ratingCount} đánh giá)
      </p>

      <p className="text-sm mb-1">
        Trạng thái: <span className="text-green-400 font-semibold">{book.status}</span>
      </p>
      <p className="text-xs text-gray-400">Ngày tạo: {book.createdAt}</p>
      <p className="text-xs text-gray-400">Lần cập nhật: {book.updatedAt}</p>
    </div>
  );
}
