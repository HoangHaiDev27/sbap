import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  RiArrowLeftLine, 
  RiUserLine, 
  RiBookLine, 
  RiTimeLine, 
  RiMoneyDollarCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiCoinsLine
} from "react-icons/ri";
import orderItemApi from "../../api/orderItemApi";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy orderId từ URL (bỏ prefix "ORD-" nếu có)
        const actualOrderId = orderId.replace('ORD-', '');
        const response = await orderItemApi.getOrderById(parseInt(actualOrderId));

        if (response.success) {
          setOrder(response.data);
        } else {
          setError(response.message || "Không thể tải chi tiết đơn hàng");
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError("Có lỗi xảy ra khi tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-600";
      case "Đã hoàn tiền":
        return "bg-red-600";
      case "Đang chờ":
        return "bg-yellow-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Hoàn thành":
        return <RiCheckLine className="text-green-400" />;
      case "Đã hoàn tiền":
        return <RiCloseLine className="text-red-400" />;
      case "Đang chờ":
        return <RiTimeLine className="text-yellow-400" />;
      default:
        return <RiTimeLine className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/owner/sales-history')}
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <RiArrowLeftLine size={20} />
            <span className="ml-2">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/owner/sales-history')}
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <RiArrowLeftLine size={20} />
            <span className="ml-2">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-400">Lỗi: {error}</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/owner/sales-history')}
            className="flex items-center text-gray-400 hover:text-white mr-4"
          >
            <RiArrowLeftLine size={20} />
            <span className="ml-2">Quay lại</span>
          </button>
          <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Không tìm thấy đơn hàng</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/owner/sales-history')}
          className="flex items-center text-gray-400 hover:text-white mr-4"
        >
          <RiArrowLeftLine size={20} />
          <span className="ml-2">Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin đơn hàng */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <RiBookLine className="mr-2" />
              Thông tin đơn hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Mã đơn hàng</label>
                <p className="text-white font-semibold">ORD-{order.orderItemId}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Trạng thái</label>
                <div className="flex items-center mt-1">
                  {getStatusIcon(order.status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Thời gian thanh toán</label>
                <p className="text-white">{new Date(order.paidAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Loại giao dịch</label>
                <p className="text-white">{order.orderType}</p>
              </div>
            </div>
          </div>

          {/* Thông tin sách */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <RiBookLine className="mr-2" />
              Thông tin sách
            </h2>
            <div className="flex items-start space-x-4">
              <img
                src={order.bookCoverUrl || "https://via.placeholder.com/120x160.png?text=Book"}
                alt={order.bookTitle}
                className="w-24 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">{order.bookTitle}</h3>
                <p className="text-gray-400 mb-2">Chương: {order.chapterTitle}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-gray-400 text-sm">Giá chương</label>
                    <p className="text-white font-semibold">{order.unitPrice.toLocaleString()} xu</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Tổng thanh toán</label>
                    <p className="text-white font-semibold text-lg">{order.cashSpent.toLocaleString()} xu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Thông tin khách hàng và tổng kết */}
        <div className="space-y-6">
          {/* Thông tin khách hàng */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <RiUserLine className="mr-2" />
              Thông tin khách hàng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-sm">Tên khách hàng</label>
                <p className="text-white font-semibold">{order.customerName}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-white">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Tổng kết đơn hàng */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <RiCoinsLine className="mr-2" />
              Tổng kết đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Giá chương:</span>
                <span className="text-white">{order.unitPrice.toLocaleString()} xu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phí dịch vụ:</span>
                <span className="text-white">0 xu</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-orange-400">{order.cashSpent.toLocaleString()} xu</span>
              </div>
            </div>
          </div>

          {/* Hành động */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Hành động</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/owner/sales-history')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Quay lại danh sách
              </button>
              {/* TODO: Thêm các hành động khác khi cần thiết */}
              {/* {order.status === "Hoàn thành" && (
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Xác nhận hoàn thành
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}