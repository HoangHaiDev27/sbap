import { RiEyeLine } from "react-icons/ri";

// eslint-disable-next-line no-unused-vars
export default function BookContent({ bookId }) {
    // Dữ liệu mock, có thể thay bằng API call
    const chapters = [
        { id: 1, title: "Chương 1: Giới thiệu về triết học", pages: 25, status: "Đã xuất bản" },
        { id: 2, title: "Chương 2: Các trường phái triết học cổ điển", pages: 32, status: "Đã xuất bản" },
        { id: 3, title: "Chương 3: Triết học phương Đông", pages: 28, status: "Đã xuất bản" },
        { id: 4, title: "Chương 4: Ứng dụng triết học trong cuộc sống", pages: 35, status: "Đã xuất bản" },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                    Danh sách chương <span className="text-sm text-gray-400 ml-2">({chapters.length} chương)</span>
                </h3>
                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                    + Thêm chương
                </button>
            </div>

            <div className="space-y-4">
                {chapters.map((chap, index) => (
                    <div key={chap.id} className="flex items-center justify-between bg-slate-800 p-4 rounded-lg shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-semibold">{chap.title}</p>
                                <p className="text-sm text-gray-400">{chap.pages} trang</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm bg-green-600 px-2 py-1 rounded text-white">{chap.status}</span>
                            <button
                                title="Xem chương"
                                className="p-2 bg-blue-500 rounded hover:bg-blue-600 transition"
                            >
                                <RiEyeLine className="text-white text-lg" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-950/30 border border-blue-600 rounded-lg p-4 mt-6 text-sm text-blue-200">
                <p className="font-semibold mb-1">ℹ️ Chỉ đọc trực tuyến</p>
                <p>Người dùng chỉ có thể đọc sách trên nền tảng, không được tải về</p>
            </div>
        </div>
    );
}
