// eslint-disable-next-line no-unused-vars
export default function BookOverview({ bookId }) {
  const book = {
    description: `Cuốn sách “Triết học cuộc sống” là một hành trình khám phá sâu sắc về những triết lý cơ bản nhất của con người. Tác giả đã khéo léo kết hợp giữa những lý thuyết triết học cổ điển với những ứng dụng thực tế trong cuộc sống hiện đại. Thông qua từng chương, người đọc sẽ tìm thấy những câu trả lời cho các câu hỏi về ý nghĩa cuộc sống, hạnh phúc, và cách sống một cuộc đời đáng giá.`,
    tags: ["triết học", "tự phát triển", "cuộc sống", "hạnh phúc", "tâm lý học"],
    chapters: 4,
    format: "Chương",
    language: "Tiếng Việt",
    totalWords: "~120K từ"
  };

  return (
    <div className="space-y-6">
      {/* Mô tả sách */}
      <div>
        <h3 className="text-lg font-semibold mb-2 text-orange-400">Mô tả sách</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{book.description}</p>
      </div>

      {/* Tags */}
      <div>
        <h4 className="font-semibold mb-2">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {book.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div>
        <h4 className="font-semibold mb-2">Thông tin chi tiết</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-200">
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Số chương</p>
            <p className="font-semibold">{book.chapters} chương</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Ngôn ngữ</p>
            <p className="font-semibold">{book.language}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Định dạng</p>
            <p className="font-semibold">{book.format}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <p className="text-gray-400">Tổng từ</p>
            <p className="font-semibold">{book.totalWords}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
