import { useEffect, useState } from "react";
import OrderStats from "../../components/owner/orders/OrderStats";
import OrderTable from "../../components/owner/orders/OrderTable";

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Giả lập API
    const data = [
      { 
      id: "ORD-001", 
      customer: "Nguyễn Văn A", 
      status: "Hoàn thành", 
      total: 150000, 
      date: "20/01/2024 10:30",
      image: "https://via.placeholder.com/60x80.png?text=Book+1" 
    },
    { 
      id: "ORD-002", 
      customer: "Trần Thị B", 
      status: "Hoàn thành", 
      total: 210000, 
      date: "19/01/2024 15:45",
      image: "https://via.placeholder.com/60x80.png?text=Book+2" 
    },
    { 
      id: "ORD-003", 
      customer: "Lê Văn C", 
      status: "Hoàn thành", 
      total: 200000, 
      date: "18/01/2024 09:15",
      image: "https://via.placeholder.com/60x80.png?text=Book+3" 
    },
    { 
      id: "ORD-004", 
      customer: "Phạm Thị D", 
      status: "Đã hoàn tiền", 
      total: 130000, 
      date: "17/01/2024 14:20",
      image: "https://via.placeholder.com/60x80.png?text=Book+4" 
    },
    { 
      id: "ORD-005", 
      customer: "Hoàng Văn E", 
      status: "Đang chờ", 
      total: 60000, 
      date: "16/01/2024 11:30",
      image: "https://via.placeholder.com/60x80.png?text=Book+5" 
    },
  ];
    setOrders(data);
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Lịch sử bán hàng</h1>
      <OrderStats orders={orders} />
      <OrderTable orders={orders} />
    </div>
  );
}
