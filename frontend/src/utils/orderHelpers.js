/**
 * Get status color for order status
 * @param {string} status - Order status
 * @returns {string} Chakra UI color scheme
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: "yellow",
    processing: "blue",
    completed: "green",
    cancelled: "red",
  };
  return colors[status] || "gray";
};

/**
 * Get status label for order status
 * @param {string} status - Order status
 * @returns {string} Vietnamese label
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    completed: "Đã xử lý",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

/**
 * Get payment status color
 * @param {string} paymentStatus - Payment status
 * @returns {string} Chakra UI color scheme
 */
export const getPaymentStatusColor = (paymentStatus) => {
  const colors = {
    pending: "yellow",
    paid: "green",
    failed: "red",
  };
  return colors[paymentStatus] || "gray";
};

/**
 * Get payment status label
 * @param {string} paymentStatus - Payment status
 * @returns {string} Vietnamese label
 */
export const getPaymentStatusLabel = (paymentStatus) => {
  const labels = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
  };
  return labels[paymentStatus] || paymentStatus;
};
