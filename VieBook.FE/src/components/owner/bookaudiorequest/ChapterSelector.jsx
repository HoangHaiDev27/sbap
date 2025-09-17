export default function ChapterSelector({ chapters, selected, setSelected }) {
  const allSelected = selected.length === chapters.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : chapters.map((c) => c.id));
  };

  const toggleChapter = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">
          Chọn chương{" "}
          <span className="text-sm text-gray-400">
            ({selected.length}/{chapters.length})
          </span>
        </h2>
        <button
          onClick={toggleAll}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>

      {/* Danh sách chương có scroll */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map((ch) => {
          const isSelected = selected.includes(ch.id);
          return (
            <label
              key={ch.id}
              className={`block p-3 rounded border cursor-pointer transition 
                ${
                  isSelected
                    ? "bg-slate-700 border-orange-500"
                    : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleChapter(ch.id)}
                  className="mr-2 accent-orange-500"
                />
                <span className="font-medium">{ch.title}</span>
              </div>
              <p className="text-xs text-gray-400 ml-6 mt-1">
                {ch.words} từ • Ước tính: {ch.duration} phút
              </p>
            </label>
          );
        })}
      </div>
    </div>
  );
}
