import {
  RiAddLine,
  RiBook2Line,
  RiCheckLine,
  RiGiftLine,
  RiDraftLine,
  RiEyeLine,
  RiVoiceprintLine,
  RiMoreFill,
  RiEdit2Line,
  RiDeleteBin6Line,
} from "react-icons/ri";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  getChaptersByBookId,
  deleteChapter,
  removeOldBookImage,
  getBookById,
  updateCompletionStatus,
  submitForApproval,
  checkAllChaptersActive,
  checkBookHasDraftChapters,
  updateDraftChaptersToInActive,
  getBookChapterAudios,
} from "../../api/ownerBookApi";

export default function OwnerChapters() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookTitle, setBookTitle] = useState(
    location.state?.bookTitle || "Không xác định"
  );
  const [chapterToDelete, setChapterToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookInfo, setBookInfo] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSellerThankModal, setShowSellerThankModal] = useState(false);
  const [showDraftWarningModal, setShowDraftWarningModal] = useState(false);
  const [chapterAudios, setChapterAudios] = useState([]); // Danh sách audio từ bảng ChapterAudio
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(chapters.length / pageSize));
  const paginatedChapters = chapters.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    async function fetchChapters() {
      try {
        setLoading(true);
        const data = await getChaptersByBookId(bookId);
        setChapters(data || []);
        // nếu API trả bookTitle chung, cập nhật
        if (data && data.length > 0 && data[0].bookTitle) {
          setBookTitle(data[0].bookTitle);
        }
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setError(err?.message || "Lỗi khi tải chương");
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
  }, [bookId]);

  // Load book info để kiểm tra UploaderType và UploadStatus
  useEffect(() => {
    async function fetchBookInfo() {
      try {
        const bookData = await getBookById(bookId);
        setBookInfo(bookData);
      } catch (err) {
        console.error("Failed to fetch book info:", err);
      }
    }

    fetchBookInfo();
  }, [bookId]);

  // Load ChapterAudio data từ bảng ChapterAudio
  useEffect(() => {
    async function fetchChapterAudios() {
      try {
        const audioData = await getBookChapterAudios(bookId);
        setChapterAudios(audioData || []);
      } catch (err) {
        console.error("Failed to fetch chapter audios:", err);
        setChapterAudios([]);
      }
    }

    if (bookId) {
      fetchChapterAudios();
    }
  }, [bookId]);


  useEffect(() => {
    const tp = Math.max(1, Math.ceil(chapters.length / pageSize));
    if (currentPage > tp) {
      setCurrentPage(tp);
    }
  }, [chapters, pageSize, currentPage]);

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const toggleMenu = (chapterId) => {
    setOpenMenuId(openMenuId === chapterId ? null : chapterId);
  };

  function getPaginationRange(currentPage, totalPages, delta = 1) {
    const range = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  }

  const handleDeleteConfirm = async () => {
    if (!chapterToDelete) return;

    try {
      await deleteChapter(chapterToDelete);

      setChapters((prev) =>
        prev.map((ch) =>
          ch.chapterId === chapterToDelete ? { ...ch, status: "InActive" } : ch
        )
      );

      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: {
            type: "success",
            message: "Đã chuyển chương sang trạng thái tạm dừng",
          },
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Cập nhật trạng thái thất bại" },
        })
      );
    } finally {
      setChapterToDelete(null);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const {
        uploaderType,
        status: bookStatus,
        uploadStatus,
        completionStatus,
      } = bookInfo;

      // Kiểm tra sách có chương nào không
      if (chapters.length === 0) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "error",
              message: "Sách bạn hiện tại đang không có chương nào",
            },
          })
        );
        setShowCompletionModal(false);
        return;
      }

      // Kiểm tra chương Draft cho Owner
      if (uploaderType === "Owner") {
        const hasDraftChapters = await checkBookHasDraftChapters(bookId);
        if (hasDraftChapters.hasDraftChapters) {
          // Hiển thị modal xác nhận xóa chương Draft
          setShowDraftWarningModal(true);
          setShowCompletionModal(false);
          return;
        }
      }

      // Trường hợp 2 & 4: UploaderType = Owner/Seller, Status = PendingChapters, UploadStatus = Full, CompletionStatus = Ongoing
      if (
        bookStatus === "PendingChapters" &&
        uploadStatus === "Full" &&
        completionStatus === "Ongoing"
      ) {
        // Kiểm tra tất cả chapters phải có Status = Active
        const allChaptersActive = await checkAllChaptersActive(bookId);

        if (!allChaptersActive.hasAllActive) {
          window.dispatchEvent(
            new CustomEvent("app:toast", {
              detail: {
                type: "error",
                message:
                  "Bạn phải phát hành tất cả các chương mới được kiểm duyệt",
              },
            })
          );
          setShowCompletionModal(false);
          return;
        }

        // Cập nhật CompletionStatus = Completed
        await updateCompletionStatus(bookId, "Completed", "Full");

        setBookInfo((prev) => ({
          ...prev,
          completionStatus: "Completed",
          uploadStatus: "Full",
        }));
      } else {
        // Trường hợp 1 & 3: UploaderType = Owner/Seller, Status = PendingChapters, UploadStatus = Incomplete, CompletionStatus = Ongoing
        // Cập nhật UploadStatus = Full và CompletionStatus = Completed
        await updateCompletionStatus(bookId, "Completed", "Full");

        setBookInfo((prev) => ({
          ...prev,
          completionStatus: "Completed",
          uploadStatus: "Full",
        }));
      }

      // Đóng modal xác nhận
      setShowCompletionModal(false);

      // Phân biệt thông báo theo loại user
      if (bookInfo?.uploaderType === "Seller") {
        // Seller: Chỉ thông báo hoàn thành, không gửi kiểm duyệt
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "success",
              message: "Bạn đã hoàn thành sách thành công!",
            },
          })
        );
      } else {
        // Owner: Thông báo hoàn thành sách
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "success",
              message: "Bạn đã hoàn thành sách thành công!",
            },
          })
        );
      }
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Cập nhật trạng thái thất bại" },
        })
      );
    }
  };

  // Xử lý xác nhận xóa chương Draft và hoàn thành sách
  const handleConfirmDeleteDraftsAndComplete = async () => {
    try {
      // Thay đổi status của tất cả chương Draft thành InActive
      await updateDraftChaptersToInActive(bookId);

      // Cập nhật danh sách chapters trong state
      const updatedChapters = chapters.map((chapter) =>
        chapter.status === "Draft"
          ? { ...chapter, status: "InActive" }
          : chapter
      );
      setChapters(updatedChapters);

      // Kiểm tra sau khi thay đổi status, sách còn chương Active nào không
      const activeChapters = updatedChapters.filter(
        (chapter) => chapter.status === "Active"
      );
      if (activeChapters.length === 0) {
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: {
              type: "error",
              message:
                "Sách bạn hiện tại đang không có chương nào đang hoạt động",
            },
          })
        );
        setShowDraftWarningModal(false);
        return;
      }

      // Đóng modal cảnh báo
      setShowDraftWarningModal(false);

      // Tiếp tục logic hoàn thành sách
      const { status: bookStatus, uploadStatus, completionStatus } = bookInfo;

      // Trường hợp 2 & 4: UploaderType = Owner/Seller, Status = PendingChapters, UploadStatus = Full, CompletionStatus = Ongoing
      if (
        bookStatus === "PendingChapters" &&
        uploadStatus === "Full" &&
        completionStatus === "Ongoing"
      ) {
        // Kiểm tra tất cả chapters phải có Status = Active
        const allChaptersActive = await checkAllChaptersActive(bookId);

        if (!allChaptersActive.hasAllActive) {
          window.dispatchEvent(
            new CustomEvent("app:toast", {
              detail: {
                type: "error",
                message:
                  "Bạn phải phát hành tất cả các chương mới được kiểm duyệt",
              },
            })
          );
          return;
        }

        // Cập nhật CompletionStatus = Completed
        await updateCompletionStatus(bookId, "Completed", "Full");

        setBookInfo((prev) => ({
          ...prev,
          completionStatus: "Completed",
          uploadStatus: "Full",
        }));
      } else {
        // Trường hợp 1 & 3: UploaderType = Owner/Seller, Status = PendingChapters, UploadStatus = Incomplete, CompletionStatus = Ongoing
        // Cập nhật UploadStatus = Full và CompletionStatus = Completed
        await updateCompletionStatus(bookId, "Completed", "Full");

        setBookInfo((prev) => ({
          ...prev,
          completionStatus: "Completed",
          uploadStatus: "Full",
        }));
      }

      // Thông báo hoàn thành
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: {
            type: "success",
            message:
              "Đã vô hiệu hóa chương nháp và hoàn thành sách thành công!",
          },
        })
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("app:toast", {
          detail: { type: "error", message: "Có lỗi khi xử lý" },
        })
      );
    }
  };

  const formatDuration = (sec) => {
    if (!sec && sec !== 0) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const formatDateSafe = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
  };

  if (loading) return <p className="p-6 text-white">Loading chapters...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-3 sm:p-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="mb-4">
            <button
              onClick={() => navigate("/owner/books")}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm mb-2"
            >
              ← Quay lại
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">Quản lý Chương</h1>
          </div>
          <p className="text-gray-400 text-base sm:text-xl">{bookTitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-3">
          {/* Nút đánh dấu hoàn thành - hiển thị trừ khi đã hoàn thành hoàn toàn */}
          {bookInfo &&
            !(
              bookInfo.uploadStatus === "Full" &&
              bookInfo.completionStatus === "Completed"
            ) && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base"
              >
                <RiCheckLine className="mr-2" /> <span className="hidden sm:inline">Đã hoàn thành</span><span className="sm:hidden">Hoàn thành</span>
              </button>
            )}

          {/* Nút thêm chương mới - ẩn khi đã hoàn thành hoàn toàn */}
          {bookInfo &&
            !(
              bookInfo.uploadStatus === "Full" &&
              bookInfo.completionStatus === "Completed"
            ) && (
              <Link
                to={`/owner/books/${bookId}/chapters/new`}
                state={{ bookTitle }}
                className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm sm:text-base"
              >
                <RiAddLine className="mr-2" /> <span className="hidden sm:inline">Thêm chương mới</span><span className="sm:hidden">Thêm mới</span>
              </Link>
            )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiBook2Line size={28} className="text-blue-400" />
          <div>
            <p className="text-xl font-bold">{chapters.length}</p>
            <p className="text-sm text-gray-400">Tổng chương</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiCheckLine size={28} className="text-green-400" />
          <div>
            <p className="text-xl font-bold">{chapters.filter((ch) => ch.priceSoft > 0).length}</p>
            <p className="text-sm text-gray-400">Có tính phí</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiGiftLine size={28} className="text-yellow-400" />
          <div>
            <p className="text-xl font-bold">{chapters.filter((ch) => ch.priceSoft === 0).length}</p>
            <p className="text-sm text-gray-400">Chương miễn phí</p>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg flex items-center space-x-3">
          <RiDraftLine size={28} className="text-purple-400" />
          <div>
            <p className="text-xl font-bold">
              {chapters.filter((ch) => ch.status === "Draft").length}
            </p>
            <p className="text-sm text-gray-400">Bản nháp</p>
          </div>
        </div>
      </div>

      {/* Chapter list */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-2 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Danh sách chương</h2>
        {chapters.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm sm:text-base">
            Sách này chưa có chương nào.
          </p>
        ) : (
          <div className="space-y-3">
            {
              paginatedChapters.map((ch, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                const isFree = ch.priceSoft === 0;
                // Kiểm tra xem chapter có audio trong bảng ChapterAudio không
                const chapterAudio = chapterAudios.find(audio => audio.chapterId === ch.chapterId);
                const hasAudio = !!chapterAudio;
                // Lấy duration từ ChapterAudio (có thể là durationSec hoặc duration)
                const audioDuration = chapterAudio?.durationSec || chapterAudio?.duration || 0;

              // status badge
              let statusBadge = null;
              switch (ch.status) {
                case "Draft":
                  statusBadge = (
                    <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white rounded text-xs">
                      Bản nháp
                    </span>
                  );
                  break;
                case "Active":
                  statusBadge = (
                    <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded text-xs">
                      Phát hành
                    </span>
                  );
                  break;
                case "InActive":
                  statusBadge = (
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded text-xs">
                      Tạm dừng
                    </span>
                  );
                  break;
                default:
                  statusBadge = (
                    <span className="ml-2 px-2 py-0.5 bg-slate-500 text-white rounded text-xs">
                      Không rõ
                    </span>
                  );
              }

              return (
                <>
                  {/* Desktop View */}
                  <div
                    key={ch.chapterId}
                    className="hidden md:flex items-start justify-between bg-slate-700 p-3 rounded-lg gap-4"
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <span className="px-2 py-1 bg-orange-500 rounded-full text-xs font-bold text-white flex-shrink-0">
                        Chương {globalIndex}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold break-words">
                          {ch.chapterTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 flex-shrink-0">
                      {/* Giá chương và giá audio */}
                      <div className="flex items-start gap-3 min-w-[280px]">
                        <div className="flex-1 text-right">
                          {isFree ? (
                            <span className="px-2 py-1 bg-yellow-400 text-black rounded text-xs font-semibold">
                              Miễn phí
                            </span>
                          ) : (
                            <span className="text-orange-400 font-semibold text-sm whitespace-nowrap">
                              Giá bản đọc: {ch.priceSoft.toLocaleString()} xu
                            </span>
                          )}
                          <div className="mt-1 flex justify-end">
                            {statusBadge}
                          </div>
                        </div>
                        <div className="flex-1 text-right">
                          {ch.audioPrice !== undefined &&
                          ch.audioPrice !== null ? (
                            <span className="text-blue-400 text-sm whitespace-nowrap">
                              Giá bản nghe:{" "}
                              {ch.audioPrice === 0
                                ? "Miễn phí"
                                : `${ch.audioPrice.toLocaleString()} xu`}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              Chưa có audio
                            </span>
                          )}
                          {hasAudio && (
                            <div className="mt-1 flex justify-end items-center gap-1">
                              <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs">
                                Audio
                              </span>
                              {/* <span className="text-xs text-gray-300">
                                {formatDuration(audioDuration)}
                              </span> */}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {formatDateSafe(ch.uploadedAt)}
                      </span>

                      {/* CHỨC NĂNG: Audio / Sửa / Xem / Xóa */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/owner/books/${bookId}/audio`}
                          state={{ bookTitle }}
                          className="px-2 py-1 min-w-[50px] text-center bg-blue-500 rounded text-xs text-white hover:bg-blue-600 flex items-center justify-center gap-1"
                          aria-label="Quản lý Audio"
                        >
                          <RiVoiceprintLine className="text-sm" />
                          Audio
                        </Link>

                        <Link
                          to={`/owner/books/${bookId}/chapters/edit/${ch.chapterId}`}
                          state={{ bookTitle }}
                          className="px-2 py-1 min-w-[50px] text-center bg-green-500 rounded text-xs text-white hover:bg-green-600"
                          aria-label={`Sửa chương của sách ${ch.chapterTitle}`}
                        >
                          Sửa
                        </Link>

                        <Link
                          to={`/owner/books/${bookId}/chapters/view/${ch.chapterId}`}
                          state={{ bookTitle }}
                          className="px-2 py-1 min-w-[50px] text-center bg-purple-500 rounded text-xs text-white hover:bg-purple-600"
                          aria-label={`Xem chương ${ch.chapterTitle}`}
                        >
                          Xem
                        </Link>

                        <button
                          onClick={() => setChapterToDelete(ch.chapterId)}
                          className="px-2 py-1 min-w-[50px] text-center bg-red-500 rounded text-xs text-white hover:bg-red-600"
                          aria-label={`Xóa chương ${ch.chapterTitle}`}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div
                    key={`mobile-${ch.chapterId}`}
                    className="md:hidden bg-slate-700 p-3 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="px-2 py-1 bg-orange-500 rounded-full text-xs font-bold text-white flex-shrink-0">
                          Chương {globalIndex}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm break-words mb-2">
                            {ch.chapterTitle}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {statusBadge}
                            {isFree ? (
                              <span className="px-2 py-0.5 bg-yellow-400 text-black rounded text-xs font-semibold">
                                Miễn phí
                              </span>
                            ) : (
                              <span className="text-orange-400 font-semibold text-xs">
                                {ch.priceSoft.toLocaleString()} xu
                              </span>
                            )}
                            {ch.audioPrice !== undefined && ch.audioPrice !== null && (
                              <span className="text-blue-400 text-xs">
                                Audio: {ch.audioPrice === 0 ? "Miễn phí" : `${ch.audioPrice.toLocaleString()} xu`}
                              </span>
                            )}
                            {hasAudio && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs">
                                Audio
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDateSafe(ch.uploadedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Menu 3 chấm */}
                      <div className="relative flex-shrink-0" ref={(el) => (menuRefs.current[ch.chapterId] = el)}>
                        <button
                          onClick={() => toggleMenu(ch.chapterId)}
                          className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition"
                          aria-label="Menu"
                        >
                          <RiMoreFill className="text-xl" />
                        </button>
                        
                        {openMenuId === ch.chapterId && (
                          <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-gray-600 rounded-lg shadow-xl z-50 w-40 max-w-[calc(100vw-1rem)]">
                            <Link
                              to={`/owner/books/${bookId}/audio`}
                              state={{ bookTitle }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 rounded-t-lg transition"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <RiVoiceprintLine className="text-blue-400 text-sm flex-shrink-0" />
                              <span className="truncate">Audio</span>
                            </Link>
                            
                            <Link
                              to={`/owner/books/${bookId}/chapters/edit/${ch.chapterId}`}
                              state={{ bookTitle }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <RiEdit2Line className="text-green-400 text-sm flex-shrink-0" />
                              <span className="truncate">Sửa</span>
                            </Link>
                            
                            <Link
                              to={`/owner/books/${bookId}/chapters/view/${ch.chapterId}`}
                              state={{ bookTitle }}
                              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 transition"
                              onClick={() => setOpenMenuId(null)}
                            >
                              <RiEyeLine className="text-purple-400 text-sm flex-shrink-0" />
                              <span className="truncate">Xem</span>
                            </Link>
                            
                            <button
                              onClick={() => {
                                setChapterToDelete(ch.chapterId);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-b-lg transition text-red-400 hover:bg-gray-700"
                            >
                              <RiDeleteBin6Line className="text-sm flex-shrink-0" />
                              <span className="truncate">Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-1 sm:space-x-2 flex-wrap gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-xs sm:text-sm"
            >
              Trước
            </button>

            {getPaginationRange(currentPage, totalPages).map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-2 text-xs sm:text-sm text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                    currentPage === p
                      ? "bg-orange-500 text-white"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-xs sm:text-sm"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Popup confirm xóa chương */}
      {chapterToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-[500px] text-center">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa</h3>
            <p className="mb-6 text-gray-300">
              Bạn có chắc chắn muốn xóa chương này?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setChapterToDelete(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận hoàn thành */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-[500px] text-center">
            <h3 className="text-lg font-bold mb-4">Xác nhận hoàn thành sách</h3>
            <p className="mb-6 text-gray-300">
              {bookInfo?.uploadStatus === "Full"
                ? "Bạn có chắc chắn đã hoàn thành việc upload tất cả chương cho sách này? Sau khi xác nhận, sách sẽ được gửi đi kiểm duyệt."
                : "Bạn có chắc chắn đã hoàn thành việc upload tất cả chương cho sách này?"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600"
              >
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup cảm ơn cho Seller */}
      {showSellerThankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-[500px] text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckLine className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Cảm ơn bạn!
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Cảm ơn bạn đã sử dụng nền tảng và thông tin sách của bạn đã được
                gửi đến bộ phận kiểm duyệt.
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>Lưu ý:</strong> Sách của bạn sẽ được xem xét và thông
                báo kết quả trong thời gian sớm nhất.
              </p>
            </div>

            <button
              onClick={() => setShowSellerThankModal(false)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup cảnh báo chương Draft cho Owner */}
      {showDraftWarningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-[600px] text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiDraftLine className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Cảnh báo chương nháp
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Sách bạn đang có chương nháp. Nếu bạn xác nhận hoàn thành, tất
                cả chương nháp sẽ được vô hiệu hóa .
              </p>
            </div>

            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">
                <strong>Lưu ý:</strong> Các chương nháp sẽ được chuyển thành
                trạng thái Tạm dừng và chỉnh sửa.
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDraftWarningModal(false)}
                className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 text-white font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDeleteDraftsAndComplete}
                className="px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 text-white font-semibold"
              >
                Vô hiệu hóa chương nháp và hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
