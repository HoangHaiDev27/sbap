import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Giả lập API lấy chi tiết đơn hàng
    const mockData = {
      id: orderId,
      customer: "Nguyễn Văn A",
      status: "Hoàn thành",
      total: 150000,
      date: "20/01/2024 10:30",
      items: [
        { id: "B001", title: "Triết học cuộc sống", price: 50000, qty: 1 },
        { id: "B002", title: "Khoa học vui", price: 100000, qty: 1 },
      ],
      payment: "Ví MoMo",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    };

    setOrder(mockData);
  }, [orderId]);

  if (!order) {
    return <div className="text-white p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h1>

      {/* Thông tin cơ bản */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <p><span className="font-semibold">Mã đơn:</span> {order.id}</p>
        <p><span className="font-semibold">Khách hàng:</span> {order.customer}</p>
        <p><span className="font-semibold">Trạng thái:</span> {order.status}</p>
        <p><span className="font-semibold">Ngày giờ:</span> {order.date}</p>
        <p><span className="font-semibold">Phương thức thanh toán:</span> {order.payment}</p>
        <p><span className="font-semibold">Địa chỉ giao hàng:</span> {order.address}</p>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Sản phẩm</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-700 text-gray-300">
              <th className="p-3">Mã sách</th>
              <th className="p-3">Tên sách</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-600">
                <td className="p-3">{item.id}</td>
                <td className="p-3">{item.title}</td>
                <td className="p-3">{item.qty}</td>
                <td className="p-3">{item.price.toLocaleString()} VND</td>
                <td className="p-3">
                  {(item.price * item.qty).toLocaleString()} VND
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tổng cộng */}
      <div className="bg-slate-800 p-4 rounded-lg mb-6">
        <p className="text-lg font-bold">
          Tổng cộng: {order.total.toLocaleString()} VND
        </p>
      </div>

      {/* Quay lại */}
      <Link
        to="/owner/orders"
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
      >
        Quay lại danh sách
      </Link>
    </div>
  );
}
