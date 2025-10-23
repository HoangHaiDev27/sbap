export default function BestSellers({ books = [] }) {
  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('vi-VN').format(amount)} xu`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Top sách bán chạy</h2>
        <span className="text-sm text-gray-400">Tháng này</span>
      </div>
      <ul className="space-y-3">
        {books.length === 0 ? (
          <li className="text-center text-gray-400 py-4">
            Chưa có dữ liệu bán hàng
          </li>
        ) : (
          books.map((book, idx) => (
            <li
              key={book.bookId}
              className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium">{book.bookTitle}</p>
                  <p className="text-xs text-gray-400">{book.soldCount} đã bán</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-green-400">
                {formatCurrency(book.revenue)}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
