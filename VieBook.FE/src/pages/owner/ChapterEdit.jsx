import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { uploadChapterFile, updateChapter, getChapterById } from "../../api/ownerBookApi";

export default function ChapterEdit() {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const location = useLocation();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState(5000);
    const [isFree, setIsFree] = useState(false);
    const [content, setContent] = useState("");
    const [originalContent, setOriginalContent] = useState("");
    const [file, setFile] = useState(null);
    const [pdfPages, setPdfPages] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [audioUrl, setAudioUrl] = useState(null);
    const [duration, setDuration] = useState(null);

    const [bookTitle, setBookTitle] = useState(location.state?.bookTitle || "Không xác định");

    // Load chương
    useEffect(() => {
        async function fetchChapter() {
            try {
                const data = await getChapterById(chapterId);
                setTitle(data.chapterTitle || "");
                setPrice(data.priceAudio || 5000);
                setAudioUrl(data.chapterAudioUrl || null);
                setDuration(data.durationSec || null);
                setIsFree(data.priceAudio === 0);
                setBookTitle(data.bookTitle || "Không xác định");

                let text = "";
                if (data.chapterSoftUrl) {
                    const res = await fetch(data.chapterSoftUrl);
                    text = await res.text();
                } else {
                    text = "";
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
                navigate(`/owner/books/${bookId}/chapters`);
            }
        }
        fetchChapter();
    }, [chapterId, bookId, navigate]);

    // Khi tick Free
    useEffect(() => {
        if (isFree) setPrice(0);
        else if (price === 0) setPrice(5000);
    }, [isFree, price]);

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

        setIsSaving(true);
        try {
            let chapterUrl = null;
            const contentChanged = content !== originalContent;

            // Nếu có file mới HOẶC nội dung bị sửa → upload lại
            if (file || contentChanged) {
                const uploadResult = await uploadChapterFile({
                    bookId,
                    content
                });
                chapterUrl = uploadResult.url;
            } else {
                // Giữ lại url cũ
                const oldData = await getChapterById(chapterId);
                chapterUrl = oldData.chapterSoftUrl;
            }

            await updateChapter(chapterId, {
                ChapterId: chapterId,
                BookId: bookId,
                ChapterTitle: title,
                ChapterView: 0,
                ChapterSoftUrl: chapterUrl,
                ChapterAudioUrl: audioUrl,
                DurationSec: duration,
                PriceAudio: price,
                UploadedAt: new Date().toISOString()
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
            <h1 className="text-2xl font-bold mb-6">Sửa chương: <span className="text-orange-400">{bookTitle}</span></h1>

            {/* Thông tin chương */}
            <div className="bg-slate-800 p-6 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-4">Thông tin chương</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.pdf" onChange={handleFileChange} />
                <p className="text-center">
                    {file ? file.name : "Chọn file chương (TXT hoặc PDF)"} {getFileTag()}
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
                    rows={10}
                    className="w-full px-3 py-2 rounded-lg bg-gray-700 focus:outline-none"
                />
                <div className="text-right text-xs text-gray-400 mt-2">{content.length}/50000 ký tự</div>
            </div>

            {/* Audio chương (nếu có) */}
            {audioUrl && (
                <div className="bg-slate-800 p-6 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-4">Audio chương</h2>
                    <p className="mb-2">Đã có Audio {duration ? `(Thời lượng: ${Math.floor(duration / 60)} phút ${duration % 60} giây)` : ""}</p>
                    <audio controls src={audioUrl} className="w-full" />
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => navigate(`/owner/books/${bookId}/chapters`)}
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
                    {isSaving ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
            </div>
        </div>
    );
}
