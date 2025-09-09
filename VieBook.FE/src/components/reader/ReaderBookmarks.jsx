import {
  RiBookmarkLine,   // Thay thế cho RiBookmarkAddLine
  RiCloseLine,
  RiBook2Line,
} from "react-icons/ri";

export default function ReaderBookmarks({ bookmarks, removeBookmark, setCurrentPage, close }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-gray-700 p-6 rounded-lg max-w-md w-full">
        <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
          <RiBookmarkLine /> Dấu trang
        </h3>

        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <RiCloseLine size={22} />
        </button>

        {bookmarks.length === 0 ? (
          <p>Chưa có dấu trang nào</p>
        ) : (
          <ul className="space-y-2">
            {bookmarks.map((page) => (
              <li key={page} className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setCurrentPage(page);
                    close();
                  }}
                  className="flex items-center gap-2 hover:text-orange-400"
                >
                  <RiBook2Line /> Trang {page}
                </button>
                <button
                  onClick={() => removeBookmark(page)}
                  className="text-red-400 hover:text-red-600"
                >
                  <RiCloseLine />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
