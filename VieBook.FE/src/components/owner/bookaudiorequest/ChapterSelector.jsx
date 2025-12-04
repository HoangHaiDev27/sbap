export default function ChapterSelector({ chapters, selected, setSelected }) {
  const toggleChapter = (id) => {
    setSelected(selected === id ? null : id);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">Chọn chương</h2>
      </div>

      {/* Danh sách chương */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
        {chapters.map((ch) => {
          const isSelected = selected === ch.id;
          return (
            <div
              key={ch.id}
              onClick={() => toggleChapter(ch.id)}
              className={`p-3 rounded border cursor-pointer transition select-none ${isSelected
                ? "bg-slate-700 border-orange-500"
                : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={isSelected}
                  readOnly
                  className="mr-2 accent-orange-500 cursor-pointer"
                  name="chapterSelect"
                />
                <span className="font-medium">{ch.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hiển thị chương đã chọn */}
      {selected && (
        <p className="text-sm text-gray-400 mt-3">
          Đã chọn:{" "}
          <span className="text-orange-400 font-semibold">
            {chapters.find((c) => c.id === selected)?.title}
          </span>
        </p>
      )}
    </div>
  );
}
