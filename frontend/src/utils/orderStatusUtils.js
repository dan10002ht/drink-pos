export function calculateStats(statsData) {
  if (!statsData?.data) return [];
  const stats = statsData.data;
  const statusCounts = stats.status_counts || {};
  return [
    {
      label: "Tổng đơn hàng",
      value: stats.total_orders?.toString() || "0",
      change: "+12%",
      changeType: "increase",
    },
    {
      label: "Chờ xử lý",
      value: (statusCounts.pending || 0).toString(),
      change: "+5%",
      changeType: "increase",
    },
    {
      label: "Đang xử lý",
      value: (statusCounts.processing || 0).toString(),
      change: "-2%",
      changeType: "decrease",
    },
    {
      label: "Đã xử lý",
      value: (statusCounts.completed || 0).toString(),
      change: "+8%",
      changeType: "increase",
    },
  ];
}
