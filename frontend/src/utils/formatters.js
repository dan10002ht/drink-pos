/**
 * Format currency to Vietnamese Dong (VND)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'VND')
 * @param {string} locale - Locale (default: 'vi-VN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "VND", locale = "vi-VN") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format currency with custom options
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrencyCustom = (amount, options = {}) => {
  const defaultOptions = {
    currency: "VND",
    locale: "vi-VN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  };

  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }

  return new Intl.NumberFormat(defaultOptions.locale, {
    style: "currency",
    currency: defaultOptions.currency,
    minimumFractionDigits: defaultOptions.minimumFractionDigits,
    maximumFractionDigits: defaultOptions.maximumFractionDigits,
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} number - The number to format
 * @param {string} locale - Locale (default: 'vi-VN')
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, locale = "vi-VN") => {
  if (number === null || number === undefined || isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format percentage
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) {
    return "N/A";
  }

  const defaultOptions = {
    locale: "vi-VN",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat(defaultOptions.locale, {
      year: defaultOptions.year,
      month: defaultOptions.month,
      day: defaultOptions.day,
      hour: defaultOptions.hour,
      minute: defaultOptions.minute,
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "N/A";
  }
};

/**
 * Format date without time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string without time
 */
export const formatDateOnly = (date) => {
  return formatDate(date, {
    hour: undefined,
    minute: undefined,
  });
};

/**
 * Format time only
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (date) => {
  if (!date) {
    return "N/A";
  }

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "N/A";
  }
};
