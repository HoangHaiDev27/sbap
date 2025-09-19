import { useState, useEffect } from "react";
import { verifyPayment } from "../api/paymentApi";
import { useCoinsStore } from "./stores/coinStore";
import { useNotificationStore } from "./stores/notificationStore";

export const usePaymentModal = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const getStatusMessage = (status) => {
    switch (status) {
      case 'success':
        return 'Giao dịch đã được xử lý thành công. Số xu đã được cộng vào tài khoản của bạn.';
      case 'error':
        return 'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
      case 'pending':
        return 'Giao dịch đang được xử lý. Vui lòng chờ trong giây lát.';
      case 'cancel':
        return 'Bạn đã hủy giao dịch. Không có khoản phí nào được tính.';
      default:
        return 'Bạn đã hủy giao dịch. Không có khoản phí nào được tính.';
    }
  };

  // Xử lý callback từ PayOS
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    const orderCode = urlParams.get('orderCode');

    // Debug logging
    console.log('URL params:', {
      status,
      amount,
      orderCode,
      fullUrl: window.location.href,
      search: window.location.search
    });

    if (status && orderCode) {
      // Verify payment thực tế với PayOS (bao gồm cả status=PAID)
      console.log(`Processing payment with status: ${status}, orderCode: ${orderCode}`);
      verifyPaymentWithPayOS(orderCode, status, amount);
    } else {
      // Nếu không có status/orderCode, có thể PayOS redirect về URL khác
      console.log('No status/orderCode found in URL, checking if this is a PayOS success page...');
      
      // Kiểm tra xem có phải từ PayOS success page không
      if (window.location.href.includes('payos.vn') || window.location.href.includes('success')) {
        console.log('Detected PayOS success page, but no orderCode. This might be a PayOS redirect issue.');
      }
    }
  }, []);
  const addCoins = useCoinsStore((state) => state.addCoins);
  const { addNotification, fetchUnreadCount } = useNotificationStore();
  const verifyPaymentWithPayOS = async (orderCode, status, amount) => {
    try {
      // Normalize status - PayOS có thể trả về PAID, CANCELLED, cancel, success, etc.
      const normalizedStatus = status?.toLowerCase();
      
      if (normalizedStatus === 'success' || normalizedStatus === 'paid') {
        // Verify với backend
        const response = await verifyPayment(orderCode);
        
        if (response.error === 0 && response.data.status === 'success') {
          setPaymentStatus('success');
          setPaymentMessage('Giao dịch đã được xử lý thành công. Số xu đã được cộng vào tài khoản của bạn.');
          setPaymentAmount(response.data.amount || parseInt(amount) || 0);
          // Chuyển đổi từ VNĐ sang xu (1 VNĐ = 1 xu)
          const coinAmount = (response.data.amount || parseInt(amount) || 0) / 1000;
          addCoins(coinAmount);
          
          // Thêm notification cho thanh toán thành công
          const now = new Date();
          const notification = {
            notificationId: Date.now(), // Temporary ID
            userId: 4,
            type: "WALLET_RECHARGE",
            title: "Nạp tiền thành công",
            body: `Bạn đã nạp thành công ${coinAmount.toLocaleString()} xu vào ví. Số dư hiện tại đã được cập nhật.`,
            isRead: false,
            createdAt: now.toISOString(),
            userName: "User",
            userEmail: "user@example.com"
          };
          addNotification(notification);
          
          // Cập nhật unread count
          fetchUnreadCount(4);
        } else {
          setPaymentStatus('error');
          setPaymentMessage('Giao dịch chưa được xác nhận. Vui lòng thử lại sau.');
          setPaymentAmount(parseInt(amount) || 0);
        }
      } else if (normalizedStatus === 'cancel' || normalizedStatus === 'cancelled') {
        setPaymentStatus('cancel');
        setPaymentMessage('Bạn đã hủy giao dịch. Không có khoản phí nào được tính.');
        setPaymentAmount(parseInt(amount) || 0);
      } else {
        setPaymentStatus('error');
        setPaymentMessage('Giao dịch không thành công. Vui lòng thử lại.');
        setPaymentAmount(parseInt(amount) || 0);
      }
      
      setShowPaymentModal(true);
      
      // Xóa query parameters khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('error');
      setPaymentMessage('Có lỗi xảy ra khi xác minh giao dịch. Vui lòng thử lại.');
      setPaymentAmount(parseInt(amount) || 0);
      setShowPaymentModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus("");
    setPaymentMessage("");
    setPaymentAmount(0);
  };

  const showModal = (status, message, amount) => {
    setPaymentStatus(status);
    setPaymentMessage(message || getStatusMessage(status));
    setPaymentAmount(amount || 0);
    setShowPaymentModal(true);
  };

  return {
    showPaymentModal,
    paymentStatus,
    paymentMessage,
    paymentAmount,
    handleCloseModal,
    showModal
  };
};
