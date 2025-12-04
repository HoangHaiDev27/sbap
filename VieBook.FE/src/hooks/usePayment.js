import { useState } from "react";
import { createPaymentLink } from "../api/paymentApi";

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processPayment = async (amount) => {
    if (!amount || amount < 10000) {
      throw new Error("Số tiền nạp tối thiểu là 10,000 VNĐ");
    }
    setIsLoading(true);
    try {
      const response = await createPaymentLink(amount);
      
      if (response.error === 0 && response.data) {
        // Chuyển đến trang thanh toán PayOS
        window.location.href = response.data.checkoutUrl;
      } 
    } catch (error) {
      console.error("Error creating payment link:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processPayment
  };
};
