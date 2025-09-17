import { useState, useMemo } from "react";

export const useAmountSuggestion = (inputValue) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 1) {
      return [];
    }

    // Tạo các gợi ý dựa trên số nhập vào
    const suggestions = [];
    
    // Nếu số có 1-2 chữ số, tạo gợi ý với 3, 4, 5 số 0
    if (numValue < 100) {
      suggestions.push(
        { value: numValue * 1000, label: `${(numValue * 1000).toLocaleString()} VNĐ` },
        { value: numValue * 10000, label: `${(numValue * 10000).toLocaleString()} VNĐ` },
        { value: numValue * 100000, label: `${(numValue * 100000).toLocaleString()} VNĐ` }
      );
    }
    // Nếu số có 3-4 chữ số, tạo gợi ý với 2, 3, 4 số 0
    else if (numValue < 10000) {
      suggestions.push(
        { value: numValue * 100, label: `${(numValue * 100).toLocaleString()} VNĐ` },
        { value: numValue * 1000, label: `${(numValue * 1000).toLocaleString()} VNĐ` },
        { value: numValue * 10000, label: `${(numValue * 10000).toLocaleString()} VNĐ` }
      );
    }
    // Nếu số có 5-6 chữ số, tạo gợi ý với 1, 2, 3 số 0
    else if (numValue < 1000000) {
      suggestions.push(
        { value: numValue * 10, label: `${(numValue * 10).toLocaleString()} VNĐ` },
        { value: numValue * 100, label: `${(numValue * 100).toLocaleString()} VNĐ` },
        { value: numValue * 1000, label: `${(numValue * 1000).toLocaleString()} VNĐ` }
      );
    }
    // Nếu số lớn hơn, tạo gợi ý với 1, 2 số 0
    else {
      suggestions.push(
        { value: numValue * 10, label: `${(numValue * 10).toLocaleString()} VNĐ` },
        { value: numValue * 100, label: `${(numValue * 100).toLocaleString()} VNĐ` }
      );
    }

    // Lọc các gợi ý hợp lệ (tối thiểu 10,000 VNĐ)
    return suggestions.filter(s => s.value >= 10000);
  }, [inputValue]);

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay để cho phép click vào suggestion
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (value) => {
    setShowSuggestions(false);
    return value;
  };

  return {
    suggestions,
    showSuggestions,
    handleInputFocus,
    handleInputBlur,
    handleSuggestionClick
  };
};
