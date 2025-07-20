import { useState, useEffect } from "react";

/**
 * Custom hook để debounce một giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (milliseconds)
 * @returns {any} - Giá trị đã được debounce
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Tạo timer để delay việc cập nhật giá trị
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timer khi component unmount hoặc value/delay thay đổi
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
