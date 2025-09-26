import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { uploadChapterFile, createChapter } from "../../../api/ownerBookApi";

export default function ChapterForm() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [bookTitle, setBookTitle] = useState("Không xác định");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(5000);
  const [isFree, setIsFree] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [pdfPages, setPdfPages] = useState(null);
  const fileInputRef = useRef(null);

  // Lấy tên sách
  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`http://localhost:5000/api/books/${bookId}`);
        if (!res.ok) throw new Error("Không thể lấy thông tin sách");
        const data = await res.json();
        setBookTitle(data.bookTitle || "Không xác định");
      } catch (err) {
        console.error(err);
      }
    }
    fetchBook();
  }, [bookId]);

  // Khi tick vào free, giá tự = 0
  useEffect(() => {
    if (isFree) {
      setPrice(0);
    } else if (price === 0) {
      setPrice(5000);
    }
  }, [isFree]);

  // Xử lý chọn file TXT/PDF
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPdfPages(null);

    if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result);
      };
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
          const pageText = content.items.map((item) => item.str).join(" ");
          text += pageText + "\n";
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
      return (
        <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black rounded text-xs">
          TXT
        </span>
      );
    if (file.type === "application/pdf")
      return (
        <span className="ml-2 px-2 py-0.5 bg-green-400 text-black rounded text-xs">
          PDF
        </span>
      );
    return null;
  };

  // Lưu chương: upload lên Cloudinary rồi tạo chapter
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

    try {
      // 1️⃣ Upload content lên Cloudinary
      const uploadResult = await uploadChapterFile({
        bookId,
        title,
        price,
        isFree,
        content,
      });

      const chapterUrl = uploadResult.url;

      // 2️⃣ Tạo chapter trong DB
      await createChapter({
        bookId,
        title,
        price,
        isFree,
        contentUrl: chapterUrl, // lưu link Cloudinary
      });

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "success", message: "Đã lưu chương thành công!" },
        })
      );

      navigate(`/owner/books/${bookId}/chapters`);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: err.message || "Có lỗi khi lưu chương" },
        })
      );
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Thêm chương mới: <span className="text-orange-400">{bookTitle}</span>
      </h1>

      {/* Thông tin chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin chương</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tiêu đề */}
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Tiêu đề chương *</label>
            <input
              type="text"
              placeholder="Ví dụ: Chương 1: Khởi đầu cuộc hành trình"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>

          {/* Chương miễn phí */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            />
            <span>Chương miễn phí</span>
          </div>

          {/* Giá chương */}
          <div>
            <label className="block text-sm mb-1">Giá chương (xu)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              disabled={isFree}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Upload file chương */}
      <div
        className="bg-slate-800 p-6 rounded-lg mb-6 border-2 border-dashed border-gray-500 cursor-pointer hover:border-gray-400 flex flex-col items-center justify-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".txt,.pdf"
          onChange={handleFileChange}
        />
        <p className="text-center">
          {file ? file.name : "Chọn file chương (TXT hoặc PDF)"}
          {getFileTag()}
        </p>
        {file && (
          <p className="text-xs text-gray-400 mt-1 text-center">
            {formatFileSize(file.size)}
            {pdfPages && ` • Số trang: ${pdfPages}`}
          </p>
        )}
      </div>

      {/* Nội dung chương */}
      <div className="bg-slate-800 p-6 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Nội dung chương</h2>
        <textarea
          placeholder="Nhập nội dung chương..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
        />
        <div className="text-right text-xs text-gray-400 mt-2">
          {content.length}/50000 ký tự
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => navigate(`/owner/books/${bookId}/chapters`)}
          className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
        >
          Hủy
        </button>
        <button
          onClick={handleSaveChapter}
          className="px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition"
        >
          Lưu chương
        </button>
      </div>
    </div>
  );
}
