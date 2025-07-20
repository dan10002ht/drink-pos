import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Icon,
  Flex,
  IconButton,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FiChevronDown, FiChevronUp, FiEye, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { formatCurrency } from "../../../utils/formatters";

const OrderStatusPage = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const itemBgColor = useColorModeValue("gray.50", "gray.700");

  // State for pagination
  const [orderPages, setOrderPages] = useState({
    pending: 1,
    processing: 1,
    completed: 1,
  });

  // Fetch order statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useFetchApi({
    url: "/admin/orders/statistics",
    protected: true,
  });

  // Fetch orders for each status
  const { data: pendingOrdersData, isLoading: isLoadingPending } = useFetchApi({
    url: "/admin/orders",
    params: {
      status: "pending",
      page: orderPages.pending,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    },
    protected: true,
  });

  const { data: processingOrdersData, isLoading: isLoadingProcessing } =
    useFetchApi({
      url: "/admin/orders",
      params: {
        status: "processing",
        page: orderPages.processing,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      },
      protected: true,
    });

  const { data: completedOrdersData, isLoading: isLoadingCompleted } =
    useFetchApi({
      url: "/admin/orders",
      params: {
        status: "completed",
        page: orderPages.completed,
        limit: 20,
        sort_by: "created_at",
        sort_order: "desc",
      },
      protected: true,
    });

  // Calculate stats from API data
  const calculateStats = () => {
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
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  // Handle load more
  const handleLoadMore = (status) => {
    setOrderPages((prev) => ({
      ...prev,
      [status]: prev[status] + 1,
    }));
  };

  // Get orders data for a status
  const getOrdersData = (status) => {
    switch (status) {
      case "pending":
        return pendingOrdersData?.data;
      case "processing":
        return processingOrdersData?.data;
      case "completed":
        return completedOrdersData?.data;
      default:
        return null;
    }
  };

  // Get loading state for a status
  const getLoadingState = (status) => {
    switch (status) {
      case "pending":
        return isLoadingPending;
      case "processing":
        return isLoadingProcessing;
      case "completed":
        return isLoadingCompleted;
      default:
        return false;
    }
  };

  // Status configuration
  const statusConfig = [
    { key: "pending", label: "Chờ xử lý", color: "yellow", icon: "⏳" },
    { key: "processing", label: "Đang xử lý", color: "blue", icon: "🔄" },
    { key: "completed", label: "Đã xử lý", color: "green", icon: "✅" },
  ];

  // Loading state
  if (isLoadingStats) {
    return (
      <Box>
        <Heading size="lg" mb={6}>
          Trạng thái đơn hàng
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} bg={bgColor} border="1px" borderColor={borderColor}>
              <CardBody>
                <Skeleton height="60px" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <Skeleton height="400px" />
          </CardBody>
        </Card>
      </Box>
    );
  }

  // Error state
  if (statsError) {
    return (
      <Box>
        <Heading size="lg" mb={6}>
          Trạng thái đơn hàng
        </Heading>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải dữ liệu trạng thái đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  const orderStats = calculateStats();

  // Order List Component
  const OrderList = ({ status }) => {
    const ordersData = getOrdersData(status);
    const orders = ordersData?.orders || [];
    const total = ordersData?.total || 0;
    const isLoading = getLoadingState(status);

    if (isLoading) {
      return (
        <VStack spacing={3} align="stretch">
          {Array.from({ length: 5 }).map((_, index) => (
            <Box key={index} p={3} bg={itemBgColor} borderRadius="md">
              <Skeleton height="20px" mb={2} />
              <Skeleton height="16px" width="60%" />
            </Box>
          ))}
        </VStack>
      );
    }

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

        {orders.map((order) => (
          <Box
            key={order.id}
            p={{ base: 3, md: 4 }}
            bg={itemBgColor}
            borderRadius="lg"
            border="1px"
            borderColor="transparent"
            _hover={{
              borderColor: borderColor,
              cursor: "pointer",
              transform: "translateY(-1px)",
              boxShadow: "md",
            }}
            transition="all 0.2s"
          >
            <VStack spacing={3} align="stretch">
              {/* Header */}
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "md", md: "lg" }}
                    color="blue.600"
                  >
                    #{order.order_number}
                  </Text>
                  <Badge
                    colorScheme={
                      status === "pending"
                        ? "yellow"
                        : status === "processing"
                        ? "blue"
                        : "green"
                    }
                  >
                    {status === "pending"
                      ? "Chờ xử lý"
                      : status === "processing"
                      ? "Đang xử lý"
                      : "Đã xử lý"}
                  </Badge>
                </HStack>
                <Text
                  fontWeight="bold"
                  fontSize={{ base: "md", md: "lg" }}
                  color="green.600"
                >
                  {formatCurrency(order.total_amount)}
                </Text>
              </Flex>

              {/* Customer Info */}
              <VStack align="start" spacing={1}>
                <Text fontWeight="medium" fontSize="md">
                  {order.customer_name}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  📞 {order.customer_phone}
                </Text>
                {order.customer_email && (
                  <Text fontSize="sm" color="gray.600">
                    📧 {order.customer_email}
                  </Text>
                )}
              </VStack>

              {/* Meta Info */}
              <HStack spacing={4} flexWrap="wrap">
                <Text fontSize="xs" color="gray.500">
                  🕒 {formatTimeAgo(order.created_at)}
                </Text>
                {order.items && (
                  <Text fontSize="xs" color="gray.500">
                    📦 {order.items.length} sản phẩm
                  </Text>
                )}
              </HStack>

              {/* Actions */}
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <IconButton
                    icon={<FiEye />}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    aria-label="Xem chi tiết"
                  />
                  <IconButton
                    icon={<FiEdit />}
                    size="sm"
                    variant="outline"
                    colorScheme="orange"
                    onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                    aria-label="Chỉnh sửa"
                  />
                </HStack>
              </Flex>
            </VStack>
          </Box>
        ))}

        {/* Load More Button */}
        {orders.length < total && (
          <Button
            size="md"
            variant="outline"
            onClick={() => handleLoadMore(status)}
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

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Trạng thái đơn hàng
          </Heading>
          <Text color="gray.600">
            Quản lý và theo dõi tình trạng xử lý đơn hàng
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {orderStats.map((stat, index) => (
            <Card
              key={index}
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
            >
              <CardBody>
                <Stat>
                  <StatLabel color="gray.500">{stat.label}</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={stat.changeType}
                      color={
                        stat.changeType === "increase" ? "green.500" : "red.500"
                      }
                    />
                    {stat.change} so với tháng trước
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Tabs */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody p={0}>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList px={{ base: 4, md: 6 }} pt={6} overflowX="auto">
                {statusConfig.map((status) => (
                  <Tab key={status.key} fontWeight="semibold" minW="auto">
                    <HStack spacing={2}>
                      <Text fontSize="lg">{status.icon}</Text>
                      <Text display={{ base: "none", sm: "block" }}>
                        {status.label}
                      </Text>
                      <Badge colorScheme={status.color} variant="subtle">
                        {getOrdersData(status.key)?.total || 0}
                      </Badge>
                    </HStack>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {statusConfig.map((status) => (
                  <TabPanel key={status.key} px={{ base: 4, md: 6 }} py={6}>
                    <OrderList status={status.key} />
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default OrderStatusPage;
