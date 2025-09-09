import { RiCloseLine, RiBookOpenLine } from "react-icons/ri";

export default function ReaderContents({ setCurrentPage, close }) {
  const chapters = [
    { chapter: 1, title: "Những Nguyên Tắc Cơ Bản", page: 1 },
    { chapter: 2, title: "Cách Khiến Mọi Người Yêu Thích Bạn", page: 45 },
    { chapter: 3, title: "Nghệ Thuật Thuyết Phục", page: 89 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-gray-700 p-6 rounded-lg max-w-md w-full">
        {/* Tiêu đề */}
        <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
          <RiBookOpenLine /> Mục lục
        </h3>

        {/* Nút đóng */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <RiCloseLine size={24} />
        </button>

        {/* Danh sách chương */}
        <ul className="space-y-2">
          {chapters.map((c) => (
            <li key={c.chapter}>
              <button
                onClick={() => {
                  setCurrentPage(c.page);
                  close();
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-gray-600"
              >
                <RiBookOpenLine className="text-orange-400" />
                <span>
                  Chương {c.chapter}: {c.title}{" "}
                  <span className="text-gray-300">(Trang {c.page})</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
