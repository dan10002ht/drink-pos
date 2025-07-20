import { useMemo } from "react";
import {
  formatCurrency,
  formatCurrencyCustom,
  formatNumber,
  formatPercentage,
} from "../utils/formatters";

/**
 * Custom hook for formatting functions
 * @returns {Object} Object containing formatting functions
 */
export const useFormatters = () => {
  const formatters = useMemo(
    () => ({
      /**
       * Format currency to Vietnamese Dong (VND)
       * @param {number} amount - The amount to format
       * @param {string} currency - Currency code (default: 'VND')
       * @param {string} locale - Locale (default: 'vi-VN')
       * @returns {string} Formatted currency string
       */
      formatCurrency: (amount, currency = "VND", locale = "vi-VN") => {
        return formatCurrency(amount, currency, locale);
      },

      /**
       * Format currency with custom options
       * @param {number} amount - The amount to format
       * @param {Object} options - Formatting options
       * @returns {string} Formatted currency string
       */
      formatCurrencyCustom: (amount, options = {}) => {
        return formatCurrencyCustom(amount, options);
      },

      /**
       * Format number with thousand separators
       * @param {number} number - The number to format
       * @param {string} locale - Locale (default: 'vi-VN')
       * @returns {string} Formatted number string
       */
      formatNumber: (number, locale = "vi-VN") => {
        return formatNumber(number, locale);
      },

      /**
       * Format percentage
       * @param {number} value - The value to format as percentage
       * @param {number} decimals - Number of decimal places (default: 2)
       * @returns {string} Formatted percentage string
       */
      formatPercentage: (value, decimals = 2) => {
        return formatPercentage(value, decimals);
      },
    }),
    []
  );

  return formatters;
};
