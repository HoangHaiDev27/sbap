import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const mockData = {
      id: orderId || "ORD-001",
      customer: "Nguyễn Văn A",
      status: "Hoàn thành",
      total: 50000,
      date: "2024-01-20T10:30:00",
      items: [
        {
          id: "B001",
          title: "Triết học cuộc sống",
          price: 50000,
          qty: 1,
          cover:
            "https://salt.tikicdn.com/cache/w1200/ts/product/8f/92/84/e9969cda8595166e3b9378db0fb96556.jpg",
        },
      ],
      payment: "Ví MoMo",
    };

    setOrder(mockData);
  }, [orderId]);

  if (!order) {
    return <div className="text-white p-6">Đang tải dữ liệu đơn hàng...</div>;
  }

  const book = order.items[0];
  const formatCurrency = (amount) => `${amount.toLocaleString()} VND`;

  return (
    <div className="p-6 text-white">
      {/* Tiêu đề + quay lại */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
        <Link
          to="/owner/orders"
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      {/* Thông tin đơn hàng */}
      <section className="bg-slate-800 rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h2>
          <p><span className="text-gray-400">Khách hàng:</span> {order.customer}</p>
          <p>
            <span className="text-gray-400">Ngày giờ đặt:</span>{" "}
            {new Date(order.date).toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="text-gray-400">Trạng thái:</span>{" "}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                order.status === "Hoàn thành"
                  ? "bg-green-600"
                  : order.status === "Đang chờ"
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            >
              {order.status}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-2">Thông tin thanh toán</h2>
          <p><span className="text-gray-400">Phương thức:</span> {order.payment}</p>
        </div>
      </section>

      {/* Sản phẩm */}
      <section className="bg-slate-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <img
            src={book.cover}
            alt={book.title}
            className="w-24 h-32 object-cover rounded shadow"
          />
          <div className="flex-1 space-y-1">
            <p className="text-lg font-semibold">{book.title}</p>
            <p><span className="text-gray-400">Mã sách:</span> {book.id}</p>
            <p><span className="text-gray-400">Số lượng:</span> {book.qty}</p>
            <p><span className="text-gray-400">Đơn giá:</span> {formatCurrency(book.price)}</p>
            <p className="text-green-400 font-semibold mt-2">
              Thành tiền: {formatCurrency(book.price * book.qty)}
            </p>
          </div>
        </div>
      </section>

      {/* Tổng cộng */}
      <section className="bg-slate-800 rounded-lg shadow p-6 flex justify-end">
        <p className="text-xl font-bold text-green-400">
          Tổng cộng: {formatCurrency(order.total)}
        </p>
      </section>
    </div>
  );
}
