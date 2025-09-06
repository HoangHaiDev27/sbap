import { RiStarFill } from "react-icons/ri";

export default function BookTable({ books }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-700 text-gray-300">
            <th className="p-3">Sách</th>
            <th className="p-3">Thể loại</th>
            <th className="p-3">Giá</th>
            <th className="p-3">Đã bán</th>
            <th className="p-3">Đánh giá</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr
              key={book.id}
              className="border-b border-gray-700 hover:bg-gray-800"
            >
              <td className="p-3 flex items-center space-x-3">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{book.title}</p>
                  <p className="text-xs text-gray-400">{book.author}</p>
                </div>
              </td>
              <td className="p-3">{book.category}</td>
              <td className="p-3">{book.price}</td>
              <td className="p-3">{book.sold}</td>
              <td className="p-3 flex items-center text-yellow-400">
                <RiStarFill className="mr-1" /> {book.rating}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    book.status === "Đang bán"
                      ? "bg-green-600"
                      : "bg-yellow-600"
                  }`}
                >
                  {book.status}
                </span>
              </td>
              <td className="p-3 flex space-x-2">
                <button className="px-2 py-1 bg-blue-500 rounded text-xs hover:bg-blue-600">
                  Xem
                </button>
                <button className="px-2 py-1 bg-green-500 rounded text-xs hover:bg-green-600">
                  Sửa
                </button>
                <button className="px-2 py-1 bg-purple-500 rounded text-xs hover:bg-purple-600">
                  Audio
                </button>
                <button className="px-2 py-1 bg-orange-500 rounded text-xs hover:bg-orange-600">
                  Tạm dừng
                </button>
                <button className="px-2 py-1 bg-red-500 rounded text-xs hover:bg-red-600">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
