import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { uploadChapterFile, updateChapter, getChapterById } from "../../api/ownerBookApi";

// Cấu hình PDF.js worker - sử dụng từ public folder
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

// Lazy load Tesseract.js - chỉ load khi cần OCR
let tesseractWorker = null;
async function loadTesseract() {
  if (!tesseractWorker) {
    const { createWorker } = await import('tesseract.js');
    tesseractWorker = await createWorker('vie+eng'); // Tiếng Việt + Tiếng Anh
  }
  return tesseractWorker;
}

export default function ChapterEdit() {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const location = useLocation();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(10.0);
    const [isFree, setIsFree] = useState(false);
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [file, setFile] = useState(null);
    const [pdfPages, setPdfPages] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // OCR states
    const [isProcessingOCR, setIsProcessingOCR] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrStatus, setOcrStatus] = useState("");

    const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");
    const [status, setStatus] = useState("Draft");

    // Khi tick Free
    useEffect(() => {
        if (isFree) setPrice(0);
        else if (price === 0) setPrice(10.0);
    }, [isFree, price]);

    // Kiểm tra PDF có text layer không
    const detectPDFHasText = useCallback(async (pdf) => {
        try {
            let totalTextLength = 0;
            const samplePages = Math.min(3, pdf.numPages); // Kiểm tra 3 trang đầu
            
            for (let i = 1; i <= samplePages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const text = textContent.items.map((item) => item.str).join(" ");
                totalTextLength += text.trim().length;
            }
            
            // Nếu có ít nhất 50 ký tự text → có text layer
            return totalTextLength >= 50;
        } catch (error) {
            console.error("Error detecting PDF text:", error);
            return false;
        }
    }, []);

    // Convert PDF page thành image
    const pdfPageToImage = useCallback(async (page, scale = 2) => {
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        return canvas.toDataURL('image/png');
    }, []);

    // Thực hiện OCR trên image
    const performOCR = useCallback(async (imageDataUrl, pageNum, totalPages, pageProgressCallback) => {
        try {
            setOcrStatus(`Đang OCR trang ${pageNum}/${totalPages}...`);
            const worker = await loadTesseract();
            
            const { data } = await worker.recognize(imageDataUrl, 'vie+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text' && pageProgressCallback) {
                        const pageProgress = Math.round(m.progress * 100);
                        pageProgressCallback(pageProgress);
                    }
                }
            });
            
            return data.text;
        } catch (error) {
            console.error(`OCR error for page ${pageNum}:`, error);
            throw error;
        }
    }, []);

    // Xử lý chọn file TXT/PDF với hybrid approach
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPdfPages(null);
        setContent("");
        setIsProcessingOCR(false);
        setOcrProgress(0);
        setOcrStatus("");

        if (selectedFile.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => setContent(event.target.result);
            reader.readAsText(selectedFile);
        } else if (selectedFile.type === "application/pdf") {
            const fileReader = new FileReader();
            fileReader.onload = async function () {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    setPdfPages(pdf.numPages);

                    // Bước 1: Thử đọc text layer trước
                    const hasTextLayer = await detectPDFHasText(pdf);
                    
                    if (hasTextLayer) {
                        // PDF có text layer → đọc text trực tiếp
                        setOcrStatus("Đang đọc nội dung từ PDF...");
                        let text = "";
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            text += content.items.map((item) => item.str).join(" ") + "\n";
                        }
                        setContent(text);
                        setOcrStatus("");
                    } else {
                        // PDF không có text layer → dùng OCR
                        setIsProcessingOCR(true);
                        setOcrStatus("Đang khởi tạo OCR...");
                        setOcrProgress(0);
                        
                        let allText = "";
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const imageDataUrl = await pdfPageToImage(page);
                            
                            // Callback để cập nhật progress tổng thể
                            const pageProgressCallback = (pageProgress) => {
                                const baseProgress = ((i - 1) / pdf.numPages) * 100;
                                const currentPageProgress = (pageProgress / pdf.numPages);
                                setOcrProgress(Math.round(baseProgress + currentPageProgress));
                            };
                            
                            const ocrText = await performOCR(imageDataUrl, i, pdf.numPages, pageProgressCallback);
                            allText += ocrText + "\n\n";
                            
                            // Cập nhật progress sau khi hoàn thành trang
                            setOcrProgress(Math.round((i / pdf.numPages) * 100));
                        }
                        
                        setContent(allText);
                        setIsProcessingOCR(false);
                        setOcrProgress(100);
                        setOcrStatus("Hoàn thành OCR!");
                        
                        // Cleanup worker sau khi xong
                        setTimeout(() => {
                            setOcrStatus("");
                            setOcrProgress(0);
                        }, 2000);
                    }
                } catch (error) {
                    console.error("Error processing PDF:", error);
                    setIsProcessingOCR(false);
                    setOcrStatus("");
                    window.dispatchEvent(
                        new CustomEvent("app:toast", {
                            detail: { 
                                type: "error", 
                                message: error.message || "Lỗi khi xử lý file PDF. Vui lòng thử lại." 
                            },
                        })
                    );
                }
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

    useEffect(() => {
        async function fetchChapter() {
            try {
                const data = await getChapterById(chapterId);
                setTitle(data.chapterTitle || "");
                setPrice(data.priceSoft || 10.0);
                setIsFree(data.priceSoft === 0);
                setBookTitle(data.bookTitle || "Không xác định");
                setStatus(data.status || "Draft"); // ✅ lấy status từ BE

                let text = "";
                if (data.chapterSoftUrl) {
                    const res = await fetch(data.chapterSoftUrl);
                    text = await res.text();
                }
                setContent(text);
                setOriginalContent(text);
            } catch (err) {
                console.error("Lỗi khi tải chương:", err);
                window.dispatchEvent(
                    new CustomEvent("app:toast", {
                        detail: { type: "error", message: "Không tải được chương" },
                    })
                );
                navigate(`/owner/books/${bookId}/chapters`, { state: { bookTitle } });
            }
        }
        fetchChapter();
    }, [chapterId, bookId, navigate]);

    // Validate giá âm
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

    // Cập nhật chương
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
            let chapterUrl = null;
            const contentChanged = content !== originalContent;

            if (file || contentChanged) {
                const uploadResult = await uploadChapterFile({ bookId, content });
                chapterUrl = uploadResult.url;
            } else {
                const oldData = await getChapterById(chapterId);
                chapterUrl = oldData.chapterSoftUrl;
            }

            await updateChapter(chapterId, {
                chapterId: chapterId,
                bookId: bookId,
                chapterTitle: title,
                chapterView: 0,
                chapterSoftUrl: chapterUrl,
                chapterAudioUrl: null,
                durationSec: null,
                priceSoft: price,
                uploadedAt: new Date().toISOString(),
                status: status,
            });


            window.dispatchEvent(
                new CustomEvent("app:toast", {
                    detail: { type: "success", message: "Cập nhật chương thành công!" },
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
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-6">Sửa chương của sách: <span className="text-orange-400">{bookTitle}</span></h1>

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
                        <div className="flex flex-col max-w-[150px]">
                            <label className="block text-sm mb-1">Giá (xu)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={isFree ? 0 : price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPrice(val === "" ? 0 : parseFloat(val) || 0);
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
                                {/* Bản nháp */}
                                <div
                                    onClick={() => setStatus("Draft")}
                                    className={`px-3 py-1 rounded-lg cursor-pointer transition ${status === "Draft" ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300"
                                        }`}
                                >
                                    Bản nháp
                                </div>

                                {/* Phát hành */}
                                <div
                                    onClick={() => setStatus("Active")}
                                    className={`px-3 py-1 rounded-lg cursor-pointer transition ${status === "Active" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
                                        }`}
                                >
                                    Phát hành
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload file mới (tùy chọn) */}
            <div className="bg-slate-800 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Upload file mới (tùy chọn)</h2>
                <div
                    className="bg-slate-700 p-6 rounded-lg mb-4 border-2 border-dashed border-gray-500 cursor-pointer hover:border-gray-400 flex flex-col items-center justify-center transition"
                    onClick={() => !isProcessingOCR && fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileChange} disabled={isProcessingOCR} />
                    <p className="text-center">
                        {file ? file.name : "Chọn file chương mới (TXT hoặc PDF)"} {getFileTag()}
                    </p>
                    {file && (
                        <p className="text-xs text-gray-400 mt-1 text-center">
                            {formatFileSize(file.size)}
                            {pdfPages && ` • Số trang: ${pdfPages}`}
                        </p>
                    )}
                    
                    {/* OCR Progress Indicator */}
                    {isProcessingOCR && (
                        <div className="w-full mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-orange-400">{ocrStatus || "Đang xử lý..."}</span>
                                <span className="text-gray-400">{ocrProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div 
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-1">
                                Đang sử dụng OCR để nhận diện văn bản từ PDF scan...
                            </p>
                        </div>
                    )}
                    
                    {ocrStatus && !isProcessingOCR && (
                        <div className="mt-2 text-xs text-green-400 text-center">
                            {ocrStatus}
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung chương */}
            <div className="bg-slate-800 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Nội dung chương</h2>
                <textarea
                    value={content}
                    readOnly
                    rows={30}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none cursor-not-allowed opacity-75"
                    placeholder="Nội dung chương (chỉ đọc)"
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
                    {isSaving ? "Đang xử lý..." : "Cập nhật thay đổi"}
                </button>
            </div>
        </div>
    );
}
