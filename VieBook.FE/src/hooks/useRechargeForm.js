import { useState } from "react";
import { useAmountSuggestion } from "./useAmountSuggestion";

export const useRechargeForm = () => {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("banking");

  // Amount suggestion logic
  const {
    suggestions,
    showSuggestions,
    handleInputFocus,
    handleInputBlur,
    handleSuggestionClick
  } = useAmountSuggestion(customAmount);

  const presetAmounts = [
    { amount: 50000, coins: 50, bonus: 2 },
    { amount: 100000, coins: 100, bonus: 5 },
    { amount: 200000, coins: 200, bonus: 10 },
    { amount: 500000, coins: 500, bonus: 20 },
    { amount: 1000000, coins: 1000, bonus: 30 },
  ];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleSuggestionSelect = (suggestionValue) => {
    setCustomAmount(suggestionValue.toString());
    setSelectedAmount(null);
    handleSuggestionClick(suggestionValue);
  };

  const getCurrentAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

  const getTotalCoins = () => {
    const amount = getCurrentAmount();
    const baseCoins = amount / 1000;
    const bonus = selectedAmount ? presetAmounts.find(item => item.amount === selectedAmount)?.bonus || 0 : 0;
    return baseCoins + bonus;
  };

  const getBonusCoins = () => {
    if (!selectedAmount) return 0;
    return presetAmounts.find(item => item.amount === selectedAmount)?.bonus || 0;
  };

  const isFormValid = () => {
    const amount = getCurrentAmount();
    return amount >= 10000;
  };

  return {
    selectedAmount,
    customAmount,
    paymentMethod,
    presetAmounts,
    suggestions,
    showSuggestions,
    handleAmountSelect,
    handleCustomAmount,
    handleSuggestionSelect,
    handleInputFocus,
    handleInputBlur,
    getCurrentAmount,
    getTotalCoins,
    getBonusCoins,
    isFormValid
  };
};
