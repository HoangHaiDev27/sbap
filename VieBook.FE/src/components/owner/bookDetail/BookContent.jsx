import { RiEyeLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import { getChaptersByBookId } from "../../../api/bookApi";
import { useNavigate } from "react-router-dom";

// eslint-disable-next-line no-unused-vars
export default function BookContent({ bookId }) {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();
    
    const INITIAL_DISPLAY = 5; // Hiển thị 5 chương đầu tiên
    const displayedChapters = showAll ? chapters : chapters.slice(0, INITIAL_DISPLAY);
    const hasMore = chapters.length > INITIAL_DISPLAY;

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        getChaptersByBookId(Number(bookId))
            .then((data) => {
                if (!mounted) return;
                setChapters(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Không lấy được danh sách chương");
            })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, [bookId]);

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    Danh sách chương <span className="text-sm text-gray-400 ml-2">({chapters.length} chương)</span>
                </h3>
                <button
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                    onClick={() => navigate(`/owner/books/${bookId}/chapters`) }
                >
                    Quản lý chương
                </button>
            </div>

            <div className="space-y-3">
                {displayedChapters.map((chap, index) => {
                    const chapterNumber = showAll ? index + 1 : index + 1;
                    return (
                    <div key={chap.chapterId} className="flex items-center justify-between bg-slate-800/60 hover:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                {chapterNumber}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{chap.chapterTitle}</p>
                                <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                  {chap.totalPage != null && (<span>{chap.totalPage} trang</span>)}
                                  {chap.chapterView != null && (
                                    <span className="flex items-center gap-1">
                                      <RiEyeLine className="w-3 h-3" />
                                      {chap.chapterView.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs bg-green-600/80 px-2 py-0.5 rounded text-white">{chap.status || "Active"}</span>
                            <button
                                title="Xem chương"
                                className="p-1.5 bg-blue-500 rounded hover:bg-blue-600 transition"
                            >
                                <RiEyeLine className="text-white text-sm" />
                            </button>
                        </div>
                    </div>
                    );
                })}
            </div>

            {/* Nút hiển thị thêm/ẩn bớt */}
            {hasMore && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        {showAll ? (
                            <>
                                <span>Ẩn bớt</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </>
                        ) : (
                            <>
                                <span>Xem thêm {chapters.length - INITIAL_DISPLAY} chương</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Empty state */}
            {chapters.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-4xl mb-2">📚</div>
                    <p className="text-gray-400 text-sm">Chưa có chương nào</p>
                </div>
            )}

            <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4 mt-6 text-sm text-blue-200">
                <p className="font-semibold mb-1">ℹ️ Chỉ đọc trực tuyến</p>
                <p>Người dùng chỉ có thể đọc sách trên nền tảng, không được tải về</p>
            </div>
        </div>
    );
}
