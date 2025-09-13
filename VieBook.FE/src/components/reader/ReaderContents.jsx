import { RiCloseLine, RiBookOpenLine } from "react-icons/ri";

export default function ReaderContents({ currentPage, setCurrentPage, close }) {
  const chapters = [
    { chapter: 1, title: "Những Nguyên Tắc Cơ Bản", page: 1 },
    { chapter: 2, title: "Cách Khiến Mọi Người Yêu Thích Bạn", page: 45 },
    { chapter: 3, title: "Nghệ Thuật Thuyết Phục", page: 89 },
  ];

  // 👉 Tính chương hiện tại theo khoảng page
  const getCurrentChapter = () => {
    for (let i = 0; i < chapters.length; i++) {
      const start = chapters[i].page;
      const end = chapters[i + 1]?.page ?? Infinity;
      if (currentPage >= start && currentPage < end) {
        return chapters[i].chapter;
      }
    }
    return chapters[0].chapter;
  };

  const activeChapter = getCurrentChapter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" onClick={close}></div>

      {/* Popup */}
      <div className="relative bg-gray-700/95 backdrop-blur-md p-6 rounded-lg max-w-md w-full shadow-lg z-10">
        <h3 className="mb-4 text-lg font-bold flex items-center gap-2">
          <RiBookOpenLine /> Mục lục
        </h3>

        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <RiCloseLine size={24} />
        </button>

        <ul className="space-y-2">
          {chapters.map((c) => {
            const isActive = activeChapter === c.chapter; // 👉 highlight theo chương hiện tại
            return (
              <li key={c.chapter}>
                <button
                  onClick={() => {
                    setCurrentPage(c.page);
                    close();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-orange-600 text-white font-semibold"
                        : "hover:bg-gray-600 text-gray-100"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <RiBookOpenLine
                      className={isActive ? "text-white" : "text-orange-400"}
                    />
                    <span>
                      Chương {c.chapter}: {c.title}
                    </span>
                  </div>
                  <span className={isActive ? "text-white" : "text-gray-300"}>
                    Trang {c.page}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
