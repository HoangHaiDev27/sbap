import { Link } from "react-router-dom";
import {
  RiStarFill,
  RiBookOpenLine,
  RiEyeLine,
  RiEdit2Line,
  RiDeleteBinLine,
  RiSoundModuleLine,
} from "react-icons/ri";

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
              <td className="p-3 align-middle text-yellow-400">
                <div className="flex items-center">
                  <RiStarFill className="mr-1" /> {book.rating}
                </div>
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${book.status === "Đang bán"
                    ? "bg-green-600"
                    : "bg-yellow-600"
                    }`}
                >
                  {book.status}
                </span>
              </td>
              <td className="p-3 align-middle">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/owner/books/${book.id}`}
                    className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition"
                    title="Xem"
                  >
                    <RiEyeLine className="text-white text-lg" />
                  </Link>

                  <button
                    className="p-2 bg-green-500 rounded hover:bg-green-600 transition"
                    title="Sửa"
                  >
                    <RiEdit2Line className="text-white text-lg" />
                  </button>
                  <Link
                    to={`/owner/books/${book.id}/chapters`}
                    className="p-2 bg-indigo-500 rounded hover:bg-indigo-600 transition"
                    title="Quản lý chương"
                  >
                    <RiBookOpenLine className="text-white text-lg" />
                  </Link>
                  <button
                    className="p-2 bg-purple-500 rounded hover:bg-purple-600 transition"
                    title="Audio"
                  >
                    <RiSoundModuleLine className="text-white text-lg" />
                  </button>
                  <button
                    className="p-2 bg-red-500 rounded hover:bg-red-600 transition"
                    title="Xóa"
                  >
                    <RiDeleteBinLine className="text-white text-lg" />
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
