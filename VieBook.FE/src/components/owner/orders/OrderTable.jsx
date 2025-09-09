import { useState } from "react";
import { Link } from "react-router-dom";

export default function OrderTable({ orders }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const pageSize = 5;

    // filter logic
    const filtered = orders.filter((o) => {
        const matchSearch =
            o.customer.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === "all" || o.status === status;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="bg-slate-800 p-4 rounded-lg">
            {/* Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm mã đơn hoặc khách hàng..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded bg-gray-700 text-white flex-1"
                />
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                    className="px-3 py-2 rounded bg-gray-700 text-white"
                >
                    <option value="all">Tất cả</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đang chờ">Đang chờ</option>
                    <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                </select>
            </div>

            {/* Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-700 text-gray-300">
                        <th className="p-3">Mã</th>
                        <th className="p-3">Ảnh</th>
                        <th className="p-3">Khách hàng</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3">Tổng tiền</th>
                        <th className="p-3">Thời gian</th>
                        <th className="p-3">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map((o) => (
                        <tr key={o.id} className="border-b border-gray-600">
                            <td className="p-3">{o.id}</td>

                            {/* Ảnh sách */}
                            <td className="p-3">
                                <img
                                    src={o.image}
                                    alt="Book cover"
                                    className="w-12 h-16 object-cover rounded"
                                />
                            </td>

                            <td className="p-3">{o.customer}</td>
                            <td className="p-3">
                                <span
                                    className={`px-2 py-1 rounded text-xs ${o.status === "Hoàn thành"
                                            ? "bg-green-600"
                                            : o.status === "Đang chờ"
                                                ? "bg-yellow-600"
                                                : "bg-red-600"
                                        }`}
                                >
                                    {o.status}
                                </span>
                            </td>
                            <td className="p-3">{o.total.toLocaleString()} VND</td>
                            <td className="p-3">{o.date}</td>
                            <td className="p-3">
                                <Link
                                    to={`/owner/orders/${o.id}`}
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm"
                                >
                                    Chi tiết
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* Pagination */}
            <div className="flex justify-end mt-4 space-x-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                    Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-500" : "bg-gray-700"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                    Sau
                </button>
            </div>
        </div>
    );
}
