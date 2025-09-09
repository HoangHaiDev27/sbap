export default function BestSellers() {
  const bestSellers = [
    { id: 1, title: "Triết học cuộc sống", sold: 45, revenue: "13.5M VND" },
    { id: 2, title: "Kỹ năng giao tiếp", sold: 36, revenue: "7.6M VND" },
    { id: 3, title: "Đầu tư chứng khoán", sold: 29, revenue: "9.5M VND" },
    { id: 4, title: "Quản lý thời gian", sold: 22, revenue: "5.4M VND" },
    { id: 5, title: "Tâm lý học tích cực", sold: 18, revenue: "5.5M VND" },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Top sách bán chạy</h2>
        <span className="text-sm text-gray-400">Tháng này</span>
      </div>
      <ul className="space-y-3">
        {bestSellers.map((book, idx) => (
          <li
            key={book.id}
            className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
          >
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                {idx + 1}
              </span>
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-xs text-gray-400">{book.sold} đã bán</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-green-400">
              {book.revenue}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
