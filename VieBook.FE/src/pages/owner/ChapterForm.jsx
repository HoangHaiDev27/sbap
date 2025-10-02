import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { uploadChapterFile, createChapter } from "../../api/ownerBookApi";
import { useLocation } from "react-router-dom";

export default function ChapterForm() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(10);
  const [isFree, setIsFree] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("Draft");
  const fileInputRef = useRef(null);
  const location = useLocation();

  const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");


  // Khi tick vào free, giá tự = 0
  useEffect(() => {
    if (isFree) setPrice(0);
    else if (price === 0) setPrice(10);
  }, [isFree]);

  // Xử lý chọn file TXT/PDF
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPdfPages(null);

    if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => setContent(event.target.result);
      reader.readAsText(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        setPdfPages(pdf.numPages);

        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + "\n";
        }
        setContent(text);
      };
      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Chỉ nhận file TXT hoặc PDF" },
        })
      );
      setFile(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileTag = () => {
    if (!file) return null;
    if (file.type === "text/plain")
      return <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black rounded text-xs">TXT</span>;
    if (file.type === "application/pdf")
      return <span className="ml-2 px-2 py-0.5 bg-green-400 text-black rounded text-xs">PDF</span>;
    return null;
  };

  // Lưu chương
  // Validate giá không âm
  useEffect(() => {
    if (price < 0) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Giá chương không được âm" },
        })
      );
      setPrice(0);
    }
  }, [price]);

  // Lưu chương
  const handleSaveChapter = async () => {
    if (!title.trim()) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Vui lòng nhập tiêu đề chương" },
        })
      );
      return;
    }
    if (!content.trim()) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Nội dung chương trống" },
        })
      );
      return;
    }
    if (price < 0) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Giá chương không được âm" },
        })
      );
      return;
    }

    setIsSaving(true);
    try {
      const uploadResult = await uploadChapterFile({ bookId, title, price, content });
      const chapterUrl = uploadResult.url;

      await createChapter({
        ChapterId: 0,
        BookId: bookId,
        ChapterTitle: title,
        ChapterView: 0,
        ChapterSoftUrl: chapterUrl,
        ChapterAudioUrl: null,
        DurationSec: null,
        PriceAudio: price,
        UploadedAt: new Date().toISOString(),
        Status: status, // gửi status chuẩn: "Draft" hoặc "Active"
      });

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Đã lưu chương thành công!" },
        })
      );
      navigate(`/owner/books/${bookId}/chapters`, {
        state: { bookTitle },
      });
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Có lỗi khi lưu chương" },
        })
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Thêm chương mới: <span className="text-orange-400">{bookTitle}</span></h1>

      {/* Thông tin chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin chương</h2>
        <div className="grid grid-cols-1 gap-4">
          {/* Tiêu đề chương */}
          <div>
            <label className="block text-sm mb-1">Tiêu đề chương *</label>
            <input
              type="text"
              placeholder="Ví dụ: Khởi đầu cuộc hành trình"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-6">
            {/* Giá chương */}
            <div className="flex flex-col max-w-[120px]">
              <label className="block text-sm mb-1">Giá (xu)</label>
              <input
                type="number"
                value={isFree ? 0 : price}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val === "" ? 0 : parseInt(val, 10));
                }}
                disabled={isFree}
                className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
              />
            </div>

            {/* Miễn phí */}
            <div className="flex items-center space-x-3 mt-6 ml-6">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <span className="text-sm">Miễn phí</span>
            </div>

            {/* Trạng thái */}
            <div className="flex flex-col ml-6">
              <label className="block text-sm mb-1">Trạng thái</label>
              <div className="flex space-x-3">
                <label
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${status === "Draft" ? "bg-purple-600 text-white" : "bg-gray-700"
                    }`}
                >
                  <input
                    type="radio"
                    name="chapterStatus"
                    value="Draft"
                    checked={status === "Draft"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="hidden"
                  />
                  Bản nháp
                </label>
                <label
                  className={`px-3 py-1 rounded-lg cursor-pointer transition ${status === "Active" ? "bg-green-600 text-white" : "bg-gray-700"
                    }`}
                >
                  <input
                    type="radio"
                    name="chapterStatus"
                    value="Active"
                    checked={status === "Active"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="hidden"
                  />
                  Phát hành
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload file chương */}
      <div
        className="bg-slate-800 p-6 rounded-lg mb-6 border-2 border-dashed border-gray-500 cursor-pointer hover:border-gray-400 flex flex-col items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileChange} />
        <p className="text-center">
          {file ? file.name : "Chọn file chương (TXT hoặc PDF không nhận hình ảnh)"} {getFileTag()}
        </p>
        {file && <p className="text-xs text-gray-400 mt-1 text-center">{formatFileSize(file.size)}{pdfPages && ` • Số trang: ${pdfPages}`}</p>}
      </div>

      {/* Nội dung chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Nội dung chương</h2>
        <textarea
          placeholder="Nhập nội dung chương..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={30}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
        />
        <div className="text-right text-xs text-gray-400 mt-2">{content.length}/50000 ký tự</div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => navigate(`/owner/books/${bookId}/chapters`, {
            state: { bookTitle },
          })}
          className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
          disabled={isSaving}
        >
          Hủy
        </button>
        <button
          onClick={handleSaveChapter}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg transition ${isSaving ? "bg-gray-500 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
        >
          {isSaving ? "Đang xử lý..." : "Thêm chương"}
        </button>
      </div>
    </div>
  );
}
