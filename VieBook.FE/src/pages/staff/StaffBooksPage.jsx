import React, { useState } from "react";
import BookDetailModal from "../../components/staff/books/BookDetailModal";

const StaffBooksPage = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);

    const stats = [
        { label: "Tổng số sách", value: 6, color: "text-blue-600" },
        { label: "Đang hoạt động", value: 5, color: "text-green-600" },
        { label: "Đã ẩn", value: 1, color: "text-orange-600" },
        { label: "Tổng feedback", value: 304, color: "text-purple-600" },
    ];

    const books = [
        { id: 1, title: "Sapiens: Lược sử loài người", author: "Yuval Noah Harari", owner: "Nguyễn Văn A", category: "Khoa học", views: "15.420/8.930", rating: 4.8, status: "Hiển thị" },
        { id: 2, title: "Đắc nhân tâm", author: "Dale Carnegie", owner: "Trần Thị B", category: "Kỹ năng sống", views: "22.150/12.340", rating: 4.9, status: "Hiển thị" },
        { id: 3, title: "Atomic Habits", author: "James Clear", owner: "Lê Văn C", category: "Phát triển bản thân", views: "8.750/5.420", rating: 4.6, status: "Đã ẩn" },
        { id: 4, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", owner: "Phạm Thị D", category: "Tâm lý học", views: "18.940/11.230", rating: 4.7, status: "Hiển thị" },
    ];

    const filteredBooks = books.filter(
        (b) =>
            (statusFilter === "all" || b.status === statusFilter) &&
            (categoryFilter === "all" || b.category === categoryFilter) &&
            (b.title.toLowerCase().includes(search.toLowerCase()) ||
                b.author.toLowerCase().includes(search.toLowerCase()) ||
                b.owner.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="pt-24 p-6 bg-gray-50 text-gray-900 min-h-screen">
            {/* Page Title */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-dark-700">Quản lý sách</h2>
                <p className="text-sm text-gray-500">Trang dành cho nhân viên quản lý kho sách</p>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((s, i) => (
                    <div key={i} className="rounded-2xl shadow-md p-4 text-center bg-white border border-gray-200">
                        <p className={`${s.color} text-2xl font-bold`}>{s.value}</p>
                        <p className="text-gray-600">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-4 items-center mb-6">
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
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 shadow-sm"
                >
                    <option value="all">Tất cả thể loại</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Kỹ năng sống">Kỹ năng sống</option>
                    <option value="Phát triển bản thân">Phát triển bản thân</option>
                    <option value="Tâm lý học">Tâm lý học</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 shadow-sm"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Hiển thị">Hiển thị</option>
                    <option value="Đã ẩn">Đã ẩn</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-xl bg-white shadow-sm">
                    <thead className="bg-gray-100 text-left text-gray-700">
                        <tr>
                            <th className="p-3 w-16 text-center">STT</th>
                            <th className="p-3">Sách</th>
                            <th className="p-3">Chủ sách</th>
                            <th className="p-3">Thể loại</th>
                            <th className="p-3">Lượt xem/nghe</th>
                            <th className="p-3">Đánh giá</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-900">
                        {filteredBooks.map((b, idx) => (
                            <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-3 w-16 text-center">{idx + 1}</td>
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8ZiGxsnY5zk7Jzh_D0uIRnq-CYm1XiueQ1YluH9E7zDYK4Mjv"
                                            alt={b.title}
                                            className="w-12 h-16 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">{b.title}</p>
                                            <p className="text-sm text-gray-500">{b.author}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">{b.owner}</td>
                                <td className="p-3">{b.category}</td>
                                <td className="p-3">{b.views}</td>
                                <td className="p-3">⭐ {b.rating}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 text-sm rounded-full ${b.status === "Hiển thị"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-200 text-gray-700"
                                            }`}
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
                                                window.location.href = `/staff/feedback?bookId=${books.id}`
                                            }
                                            className="p-2 hover:bg-purple-50 rounded-lg text-purple-600"
                                            title="Nhận xét"
                                        >
                                            <i className="ri-message-2-line text-lg"></i>
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (window.confirm("Bạn có chắc muốn ẩn/hiện sách này không?")) {
                                                    alert("Cập nhật trạng thái thành công!");
                                                    // TODO: ở đây bạn có thể thêm logic gọi API để cập nhật trạng thái
                                                }
                                            }}
                                            className="p-2 hover:bg-orange-50 rounded-lg text-orange-600"
                                            title="Ẩn/Hiện"
                                        >
                                            <i className="ri-eye-off-line text-lg"></i>
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}

                        {filteredBooks.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500">
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Popup */}
            {selectedBook && (
                <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
            )}
        </div>
    );
};

export default StaffBooksPage;
