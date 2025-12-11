import { RiCloseLine, RiAddLine, RiSubtractLine } from "react-icons/ri";

export default function ReaderSettings({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme,
  setTheme,
  close,
}) {
  const fonts = [
    { value: "serif", label: "Serif" },
    { value: "sans", label: "Sans" },
    { value: "mono", label: "Mono" },
  ];

  const themes = [
    { value: "dark", label: "Tối", color: "bg-gray-900" },
    { value: "light", label: "Sáng", color: "bg-white" },
    { value: "sepia", label: "Sepia", color: "bg-yellow-100" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay nền tối */}
      <div
        className="fixed inset-0 bg-black/30"
        onClick={close}
      ></div>

      {/* Popup */}
      <div className="relative bg-gray-700/95 backdrop-blur-sm p-4 sm:p-6 rounded-lg max-w-md w-full mx-4 shadow-xl z-10">
        <h3 className="mb-4 sm:mb-6 text-base sm:text-lg font-bold">Cài đặt đọc</h3>

        {/* Nút đóng */}
        <button
          onClick={close}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-lg sm:text-xl hover:text-red-400"
        >
          <RiCloseLine />
        </button>

        {/* Font size */}
        <div className="mb-4 sm:mb-6">
          <label className="block mb-2 text-xs sm:text-sm">Kích thước chữ</label>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              <RiSubtractLine className="text-base sm:text-lg" />
            </button>
            <span className="text-base sm:text-lg">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(30, fontSize + 2))}
              className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              <RiAddLine className="text-base sm:text-lg" />
            </button>
          </div>
        </div>

        {/* Font family */}
        <div className="mb-4 sm:mb-6">
          <label className="block mb-2 text-xs sm:text-sm">Font chữ</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {fonts.map((f) => (
              <button
                key={f.value}
                onClick={() => setFontFamily(f.value)}
                className={`p-2 sm:p-3 md:p-4 rounded-lg border text-center ${
                  fontFamily === f.value
                    ? "border-orange-500 bg-gray-700"
                    : "border-gray-600 hover:bg-gray-700"
                }`}
              >
                <span className="block text-base sm:text-lg">Aa</span>
                <span className="text-xs sm:text-sm">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block mb-2 text-xs sm:text-sm">Chủ đề</label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`p-2 sm:p-3 md:p-4 rounded-lg border flex flex-col items-center ${
                  theme === t.value
                    ? "border-orange-500"
                    : "border-gray-600 hover:bg-gray-700"
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded mb-1 sm:mb-2 border ${t.color}`}
                ></div>
                <span className="text-xs sm:text-sm">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
