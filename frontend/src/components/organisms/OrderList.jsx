import React, { useEffect, useRef, useState } from "react";
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
import ScrollToTopButton from "../atoms/ScrollToTopButton";

const OrderList = ({ status, page, onLoadMore, prependOrder, refetchList }) => {
  const queryClient = useQueryClient();
  const listRef = useRef();
  const [showScrollToTop, setShowScrollToTop] = useState(false);
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

  // Prepend order nếu có (realtime, page 1)
  useEffect(() => {
    if (prependOrder && page === 1) {
      // Kiểm tra trùng id tránh thêm lặp
      if (!orders.find((o) => o.id === prependOrder.id)) {
        queryClient.setQueryData(
          [
            "/admin/orders",
            {
              status,
              page: 1,
              limit: 20,
              sort_by: "created_at",
              sort_order: "desc",
            },
          ],
          (old) => {
            if (!old?.orders) return old;
            return {
              ...old,
              orders: [prependOrder, ...old.orders],
              total: (old.total || 0) + 1,
            };
          }
        );
      }
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

  // Theo dõi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (listRef.current) {
        setShowScrollToTop(listRef.current.scrollTop > 100);
      }
    };
    const node = listRef.current;
    if (node) node.addEventListener("scroll", handleScroll);
    return () => node && node.removeEventListener("scroll", handleScroll);
  }, []);

  // Khi có prependOrder, nếu scroll không ở top, show button
  useEffect(() => {
    if (prependOrder && page === 1 && listRef.current) {
      if (listRef.current.scrollTop > 100) {
        setShowScrollToTop(true);
      }
    }
  }, [prependOrder, page]);

  // Scroll về top khi bấm nút
  const handleScrollToTop = () => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setShowScrollToTop(false);
    }
  };

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
      <ScrollToTopButton onClick={handleScrollToTop} show={showScrollToTop} />
    </Box>
  );
};

export default OrderList;
