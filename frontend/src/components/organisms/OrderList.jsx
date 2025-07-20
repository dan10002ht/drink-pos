import React from "react";
import {
  Box,
  Text,
  VStack,
  Flex,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useFetchApi } from "../../hooks/useFetchApi";
import OrderCard from "../molecules/OrderCard";

const OrderList = ({ status, page, onLoadMore }) => {
  // Fetch orders for the specific status
  const {
    data: ordersData,
    isLoading,
    error,
  } = useFetchApi({
    url: "/admin/orders",
    params: {
      status,
      page: page || 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    },
    protected: true,
  });

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <VStack spacing={4} align="stretch">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} height="200px" borderRadius="lg" />
        ))}
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Lỗi tải dữ liệu!</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="lg" color="gray.500" mb={2}>
          Chưa có đơn hàng nào
        </Text>
        <Text fontSize="sm" color="gray.400">
          Các đơn hàng mới sẽ xuất hiện ở đây
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {/* Header with count */}
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" color="gray.600">
          Hiển thị {orders.length} trong tổng số {total} đơn hàng
        </Text>
        {status === "pending" && (
          <Button size="sm" colorScheme="blue" variant="outline">
            Xử lý tất cả
          </Button>
        )}
        {status === "processing" && (
          <Button size="sm" colorScheme="green" variant="outline">
            Hoàn thành tất cả
          </Button>
        )}
      </Flex>

      {/* Orders list */}
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} status={status} />
      ))}

      {/* Load More Button */}
      {orders.length < total && (
        <Button
          size="md"
          variant="outline"
          onClick={() => onLoadMore && onLoadMore(status)}
          isLoading={isLoading}
          w="full"
          mt={4}
        >
          Tải thêm ({total - orders.length} đơn hàng)
        </Button>
      )}
    </VStack>
  );
};

export default OrderList;
