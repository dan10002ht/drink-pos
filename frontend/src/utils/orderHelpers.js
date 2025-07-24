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
    ready_for_delivery: "Sẵn sàng giao hàng",
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

/**
 * Valid status transitions for order status (FE/BE đồng bộ)
 */
export const validTransitions = {
  pending: ["processing", "cancelled"],
  processing: ["completed", "ready_for_delivery", "cancelled"],
  completed: ["ready_for_delivery"],
  ready_for_delivery: ["completed", "cancelled"],
  cancelled: [],
};

/**
 * Get delivery status label
 * @param {string} status - Delivery status
 * @returns {string} Vietnamese label
 */
export const getDeliveryStatusLabel = (status) => {
  const labels = {
    pending: "Chờ giao hàng",
    assigned: "Đã assign shipper",
    picked_up: "Shipper đã nhận hàng",
    in_transit: "Đang giao hàng",
    delivered: "Đã giao hàng thành công",
    failed: "Giao hàng thất bại",
    cancelled: "Đã hủy giao hàng",
  };
  return labels[status] || status;
};

/**
 * Get delivery status color
 * @param {string} status - Delivery status
 * @returns {string} Color scheme
 */
export const getDeliveryStatusColor = (status) => {
  const colors = {
    pending: "yellow",
    assigned: "blue",
    picked_up: "purple",
    in_transit: "orange",
    delivered: "green",
    failed: "red",
    cancelled: "gray",
  };
  return colors[status] || "gray";
};

/**
 * Check if order can be assigned to shipper
 * @param {string} status - Order status
 * @returns {boolean} Whether order can be assigned
 */
export const canAssignShipper = (status) => {
  return status === "ready_for_delivery" || status === "completed";
};

/**
 * Check if order can be split for delivery
 * @param {string} status - Order status
 * @returns {boolean} Whether order can be split
 */
export const canSplitOrder = (status) => {
  return status === "ready_for_delivery" || status === "completed";
};
