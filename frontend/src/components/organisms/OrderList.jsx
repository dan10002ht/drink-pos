import React, { useEffect, useRef } from "react";
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
import { useQueryClient } from "@tanstack/react-query";

const OrderList = ({ status, page, onLoadMore, prependOrder, refetchList }) => {
  const queryClient = useQueryClient();
  const listRef = useRef();
  const firstItemRef = useRef();
  // Fetch orders for the specific status
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
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

  // Prepend hoặc update order nếu có (realtime, loadmore)
  useEffect(() => {
    if (prependOrder) {
      queryClient.setQueryData(
        [
          "/admin/orders",
          {
            status,
            page: page || 1,
            limit: 20,
            sort_by: "created_at",
            sort_order: "desc",
          },
        ],
        (old) => {
          const oldData = old?.data;
          if (!oldData?.orders) return old;
          const idx = oldData.orders.findIndex((o) => o.id === prependOrder.id);
          let newOrders;
          let newTotal = oldData.total;
          if (idx === -1) {
            // Chưa có, prepend vào đầu
            newOrders = [prependOrder, ...oldData.orders];
            newTotal = (oldData.total || 0) + 1;
          } else {
            // Đã có, update order đó
            newOrders = [...oldData.orders];
            newOrders[idx] = prependOrder;
          }
          return {
            ...old,
            data: {
              ...oldData,
              orders: newOrders,
              total: newTotal,
            },
          };
        }
      );
    }
    // eslint-disable-next-line
  }, [prependOrder, page]);

  // Refetch list khi được yêu cầu
  useEffect(() => {
    if (refetchList) {
      refetch();
    }
    // eslint-disable-next-line
  }, [refetchList]);

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
    <Box position="relative">
      <VStack
        spacing={3}
        align="stretch"
        ref={listRef}
        style={{ maxHeight: 600, overflowY: "auto" }}
      >
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
        {orders.map((order, idx) => (
          <OrderCard
            key={order.id}
            order={order}
            status={status}
            ref={idx === 0 ? firstItemRef : undefined}
          />
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
    </Box>
  );
};

export default OrderList;
