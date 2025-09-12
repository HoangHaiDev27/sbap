import {
  RiBookmarkLine, // Thay thế cho RiBookmarkAddLine
  RiCloseLine,
  RiBook2Line,
} from "react-icons/ri";

export default function ReaderBookmarks({
  bookmarks,
  removeBookmark,
  setCurrentPage,
  close,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay nền tối */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={close} // 👉 click ra ngoài để đóng
      ></div>

      {/* Popup */}
      <div className="relative bg-gray-700/95 backdrop-blur-sm p-6 rounded-lg max-w-md w-full shadow-xl z-10">
        {/* Tiêu đề */}
        <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
          <RiBookmarkLine /> Dấu trang
        </h3>

        {/* Nút đóng */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <RiCloseLine size={22} />
        </button>

        {/* Nội dung */}
        {bookmarks.length === 0 ? (
          <p className="text-gray-300">Chưa có dấu trang nào</p>
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
