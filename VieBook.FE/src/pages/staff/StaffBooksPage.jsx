import React, { useState, useEffect, useCallback } from "react";
import BookDetailModal from "../../components/staff/books/BookDetailModal";
import ConfirmModal from "../../components/staff/books/ConfirmModal";
import toast from "react-hot-toast";
import { getAllBooksPaged, getBooksStats } from "../../api/staffApi";
import { getCategories } from "../../api/ownerBookApi";
import { API_ENDPOINTS } from "../../config/apiConfig";

const StaffBooksPage = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        inactive: 0,
        active: 0,
        refused: 0,
        pendingChapters: 0,
        totalRatings: 0
    });

    const [confirmBook, setConfirmBook] = useState(null);

    const getStatusFilterValue = (filter) => {
        const statusMap = {
            "all": "all",
            "Phát hành": "Approved",
            "Tạm dừng": "InActive",
            "Chờ duyệt": "Active",
            "Chờ đăng chương": "PendingChapters",
            "Bị từ chối": "Refused"
        };
        return statusMap[filter] || "all";
    };

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            const searchTerm = debouncedSearch.trim() || null;
            const status = statusFilter !== "all" ? getStatusFilterValue(statusFilter) : null;
            const categoryId = categoryFilter !== "all" ? parseInt(categoryFilter) : null;
            
            const statsData = await getBooksStats(searchTerm, status, categoryId);
            
            if (statsData && typeof statsData === 'object') {
                setStats({
                    total: parseInt(statsData.total) || 0,
                    approved: parseInt(statsData.approved) || 0,
                    inactive: parseInt(statsData.inactive) || 0,
                    active: parseInt(statsData.active) || 0,
                    refused: parseInt(statsData.refused) || 0,
                    pendingChapters: parseInt(statsData.pendingChapters) || 0,
                    totalRatings: parseInt(statsData.totalRatings) || 0
                });
            }
        } catch (error) {
            console.error("Lỗi khi load stats:", error);
        }
    }, [debouncedSearch, statusFilter, categoryFilter]);

    // Fetch dữ liệu
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const searchTerm = debouncedSearch.trim() || null;
            const status = statusFilter !== "all" ? getStatusFilterValue(statusFilter) : null;
            const categoryId = categoryFilter !== "all" ? parseInt(categoryFilter) : null;
            
            const booksResponse = await getAllBooksPaged(currentPage, itemsPerPage, searchTerm, status, categoryId);
            
            if (booksResponse && booksResponse.data) {
                setBooks(booksResponse.data);
                setTotalCount(booksResponse.totalCount || 0);
                setTotalPages(booksResponse.totalPages || 1);
            } else {
                setBooks([]);
                setTotalCount(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi khi load dữ liệu:", error);
            toast.error("Không thể tải dữ liệu sách");
            setBooks([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearch, statusFilter, categoryFilter]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await getCategories();
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error("Lỗi khi load categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 2000);

        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, categoryFilter, debouncedSearch]);

    const formatBookForDisplay = (book) => {
        const statusMap = {
            "Approved": "Phát hành",
            "InActive": "Tạm dừng",
            "Active": "Chờ duyệt",
            "PendingChapters": "Chờ đăng chương",
            "Refused": "Bị từ chối"
        };

        const mappedStatus = statusMap[book.status] || book.status;

        return {
            ...book,
            id: book.bookId,
            title: book.title || "Không có tiêu đề",
            author: book.author || "Không rõ",
            owner: book.ownerName || `Owner ID: ${book.ownerId}`,
            ownerName: book.ownerName || `Owner ID: ${book.ownerId}`,
            ownerId: book.ownerId,
            category: book.categoryNames?.join(", ") || "Chưa phân loại",
            categoryNames: book.categoryNames || [],
            categoryIds: book.categoryIds || [],
            views: `${book.totalView || 0}`,
            rating: book.rating || 0,
            status: mappedStatus,
            statusRaw: book.status,
            coverUrl: book.coverUrl,
            totalPrice: book.totalPrice || 0,
            sold: book.sold || 0,
            totalRatings: book.totalRatings || 0,
            description: book.description
        };
    };

    const getStatusColor = (statusRaw) => {
        switch (statusRaw) {
            case "Approved":
                return "bg-green-100 text-green-700";
            case "InActive":
                return "bg-slate-200 text-slate-700";
            case "Active":
                return "bg-amber-100 text-amber-700";
            case "PendingChapters":
                return "bg-indigo-100 text-indigo-700";
            case "Refused":
                return "bg-red-100 text-red-700";
            default:
                return "bg-purple-100 text-purple-700";
        }
    };

    const getCategoryColor = (categoryName) => {
        const colors = [
            "bg-blue-100 text-blue-700 border-blue-300",
            "bg-purple-100 text-purple-700 border-purple-300",
            "bg-pink-100 text-pink-700 border-pink-300",
            "bg-indigo-100 text-indigo-700 border-indigo-300",
            "bg-teal-100 text-teal-700 border-teal-300",
            "bg-cyan-100 text-cyan-700 border-cyan-300",
            "bg-emerald-100 text-emerald-700 border-emerald-300",
            "bg-violet-100 text-violet-700 border-violet-300",
        ];
        let hash = 0;
        for (let i = 0; i < categoryName.length; i++) {
            hash = ((hash << 5) - hash) + categoryName.charCodeAt(i);
            hash = hash & hash;
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const displayBooks = books.map(formatBookForDisplay);

    // Handle confirm
    const handleConfirm = async () => {
        if (!confirmBook) return;
        
        try {
            const newStatus = confirmBook.statusRaw === "Approved" ? "InActive" : "Approved";
            const response = await fetch(API_ENDPOINTS.BOOKS.UPDATE_STATUS(confirmBook.id), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Cập nhật trạng thái thất bại");
            }

            await fetchStats();
            await fetchData();
            
            toast.success(`Cập nhật trạng thái sách "${confirmBook.title}" thành công!`);
            setConfirmBook(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật trạng thái");
        }
    };

    const statsDisplay = [
        { 
            label: "Tổng số sách", 
            value: stats.total, 
            color: "text-blue-600"
        },
        { 
            label: "Phát hành", 
            value: stats.approved, 
            color: "text-green-600"
        },
        { 
            label: "Tạm dừng", 
            value: stats.inactive, 
            color: "text-orange-600"
        },
        { 
            label: "Tổng đánh giá", 
            value: stats.totalRatings, 
            color: "text-purple-600"
        },
    ];

    if (loading) {
        return (
            <div className="pt-30 p-6 bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-30 p-6 bg-gray-50 text-gray-900 min-h-screen">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-700">Quản lý sách</h2>
                <p className="text-sm text-gray-500">Trang dành cho nhân viên quản lý kho sách</p>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statsDisplay.map((s, i) => (
                    <div key={i} className="rounded-2xl shadow-md p-4 text-center bg-white border border-gray-200">
                        <p className={`${s.color} text-2xl font-bold`}>{s.value}</p>
                        <p className="text-gray-600">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm sách, tác giả, chủ sách..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-64 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm"
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 shadow-sm w-full sm:w-auto min-w-[150px]"
                >
                    <option value="all">Tất cả thể loại</option>
                    {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 shadow-sm w-full sm:w-auto min-w-[150px]"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Phát hành">Phát hành</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Chờ đăng chương">Chờ đăng chương</option>
                    <option value="Bị từ chối">Bị từ chối</option>
                </select>
            </div>

            {/* Bảng sách */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl bg-white shadow-sm">
                        <thead className="bg-gray-100 text-left text-gray-700">
                            <tr>
                                <th className="p-3 w-16 text-center">STT</th>
                                <th className="p-3">Sách</th>
                                <th className="p-3">Chủ sách</th>
                                <th className="p-3">Thể loại</th>
                                <th className="p-3">Lượt xem</th>
                                <th className="p-3">Đánh giá</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-900">
                            {displayBooks.map((b, idx) => (
                                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3 w-16 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="p-3 max-w-xs">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={b.coverUrl || "https://via.placeholder.com/48x64?text=No+Image"}
                                                alt={b.title}
                                                className="w-12 h-16 object-cover rounded flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/48x64?text=No+Image";
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-gray-800 truncate" title={b.title}>{b.title}</p>
                                                <p className="text-sm text-gray-500 truncate" title={b.author}>{b.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <p className="truncate" title={b.owner}>{b.owner}</p>
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <div className="flex flex-col gap-1.5">
                                            {b.categoryNames && b.categoryNames.length > 0 ? (
                                                b.categoryNames.map((catName, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`px-2 py-1 text-xs rounded-md border whitespace-nowrap ${getCategoryColor(catName)}`}
                                                    >
                                                        {catName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded-md border bg-gray-100 text-gray-600 border-gray-300 whitespace-nowrap">
                                                    Chưa phân loại
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 whitespace-nowrap">{b.views}</td>
                                    <td className="p-3 whitespace-nowrap">⭐ {b.rating.toFixed(1)}</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-sm rounded-full ${getStatusColor(b.statusRaw)}`}
                                        >
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedBook(b)}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                                                title="Xem"
                                            >
                                                <i className="ri-eye-line text-lg"></i>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    (window.location.href = `/staff/feedback?bookId=${b.id}`)
                                                }
                                                className="p-2 hover:bg-purple-50 rounded-lg text-purple-600"
                                                title="Xem đánh giá"
                                            >
                                                <i className="ri-message-2-line text-lg"></i>
                                            </button>

                                            <button
                                                onClick={() => setConfirmBook(b)}
                                                className="p-2 hover:bg-orange-50 rounded-lg text-orange-600"
                                                title="Ẩn/Hiện"
                                            >
                                                <i className="ri-eye-off-line text-lg"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {displayBooks.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={8} className="p-6 text-center text-gray-500">
                                        Không có dữ liệu phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Phân trang */}
                    {totalPages > 0 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t">
                        <p className="text-sm text-gray-600">
                            Trang {currentPage}/{totalPages}
                        </p>
                        <div className="space-x-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 text-gray-800"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            </div>

            {/* Popup chi tiết */}
            {selectedBook && (
                <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
            )}

            {/* Popup xác nhận */}
            <ConfirmModal
                isOpen={!!confirmBook}
                title="Xác nhận thay đổi trạng thái"
                message={`Bạn có chắc muốn ${confirmBook?.statusRaw === "Approved" ? "ẩn" : "hiển thị"} sách "${confirmBook?.title}" không?`}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmBook(null)}
            />
        </div>
    );
};

export default StaffBooksPage;
