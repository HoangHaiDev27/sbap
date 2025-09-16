export default function ChapterSelector({ chapters, selected, setSelected }) {
  const allSelected = selected.length === chapters.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]); // Bỏ chọn tất cả
    } else {
      setSelected(chapters.map((c) => c.id)); // Chọn tất cả
    }
  };

  const toggleChapter = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">
          Chọn chương{" "}
          <span className="text-sm text-gray-400">
            ({selected.length}/{chapters.length})
          </span>
        </h2>
        <button
          onClick={toggleAll}
          className="text-blue-400 hover:underline text-sm"
        >
          {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {chapters.map((ch) => (
          <label
            key={ch.id}
            className="flex items-center justify-between bg-slate-700 p-2 rounded cursor-pointer"
          >
            <div>
              <input
                type="checkbox"
                checked={selected.includes(ch.id)}
                onChange={() => toggleChapter(ch.id)}
                className="mr-2"
              />
              {ch.title}
              <p className="text-xs text-gray-400">
                {ch.words} từ • Ước tính: {ch.duration} phút
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
