import React from "react";
import { VStack, HStack, Text, Badge, Box } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const OrderStatusHistory = ({ statusHistory = [] }) => {
  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      preparing: "orange",
      ready: "green",
      completed: "teal",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Text color="gray.500" fontSize="sm">
          Chưa có lịch sử trạng thái
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {statusHistory.map((history, index) => (
        <HStack key={index} spacing={4}>
          <Box p={2} bg="blue.50" borderRadius="full">
            <FiClock color="blue.500" />
          </Box>
          <VStack align="start" spacing={1} flex={1}>
            <HStack spacing={2}>
              <Badge colorScheme={getStatusColor(history.status)}>
                {getStatusLabel(history.status)}
              </Badge>
              <Text fontSize="sm" color="gray.600">
                {format(new Date(history.created_at), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </Text>
            </HStack>
            {history.notes && (
              <Text fontSize="sm" color="gray.600">
                {history.notes}
              </Text>
            )}
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
};

export default OrderStatusHistory;
