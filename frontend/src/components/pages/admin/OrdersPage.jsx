import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Flex,
  Spacer,
  IconButton,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import Page from "../../common/Page";
import { useFetchApi } from "../../../hooks/useFetchApi";

const OrdersPage = () => {
  const navigate = useNavigate();

  // State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    search: "",
    date_from: "",
    date_to: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Fetch orders
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: ordersError,
  } = useFetchApi({
    url: "/admin/orders",
    params: filters,
    protected: true,
  });

  // Fetch order statuses
  const { data: statusesData } = useFetchApi({
    url: "/admin/orders/statuses",
    protected: true,
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      processing: "blue",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Đã xử lý",
      cancelled: "Đã hủy",
    };
    return labels[status] || status;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Loading state
  if (isLoadingOrders && !ordersData) {
    return (
      <Page title="Quản lý đơn hàng">
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="40px" />
              <Skeleton height="400px" />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <Page title="Quản lý đơn hàng">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  const orders = ordersData?.orders || [];
  const total = ordersData?.total || 0;
  const pages = ordersData?.pages || 1;
  const statuses = statusesData?.data || [];

  return (
    <Page
      title="Quản lý đơn hàng"
      primaryAction={{
        label: "Tạo đơn hàng",
        icon: FiPlus,
        onClick: () => navigate("/admin/orders/create"),
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* Filters */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Tìm kiếm
                </Text>
                <Input
                  placeholder="Tìm theo mã đơn hàng, tên khách hàng, số điện thoại..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  leftIcon={<FiSearch />}
                />
              </Box>

              {/* Filters Row */}
              <VStack spacing={3} align="stretch">
                <HStack spacing={3} wrap="wrap">
                  <Box flex={1} minW="200px">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Trạng thái
                    </Text>
                    <Select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      placeholder="Tất cả trạng thái"
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  <Box flex={1} minW="150px">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Từ ngày
                    </Text>
                    <Input
                      type="date"
                      value={filters.date_from}
                      onChange={(e) =>
                        handleFilterChange("date_from", e.target.value)
                      }
                    />
                  </Box>
                  <Box flex={1} minW="150px">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Đến ngày
                    </Text>
                    <Input
                      type="date"
                      value={filters.date_to}
                      onChange={(e) =>
                        handleFilterChange("date_to", e.target.value)
                      }
                    />
                  </Box>
                </HStack>
              </VStack>
              {/* Summary and Sort */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Tổng cộng: {total} đơn hàng
                </Text>
                <HStack spacing={2} wrap="wrap">
                  <Text fontSize="sm" color="gray.600">
                    Sắp xếp theo:
                  </Text>
                  <Select
                    size="sm"
                    value={filters.sort_by}
                    onChange={(e) =>
                      handleFilterChange("sort_by", e.target.value)
                    }
                    w={{ base: "full", sm: "150px" }}
                  >
                    <option value="created_at">Ngày tạo</option>
                    <option value="order_number">Mã đơn hàng</option>
                    <option value="total_amount">Tổng tiền</option>
                    <option value="customer_name">Tên khách hàng</option>
                  </Select>
                  <Select
                    size="sm"
                    value={filters.sort_order}
                    onChange={(e) =>
                      handleFilterChange("sort_order", e.target.value)
                    }
                    w={{ base: "full", sm: "100px" }}
                  >
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                  </Select>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Orders Table - Desktop */}
        <Card display={{ base: "none", lg: "block" }}>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Mã đơn hàng</Th>
                    <Th>Khách hàng</Th>
                    <Th>Trạng thái</Th>
                    <Th>Tổng tiền</Th>
                    <Th>Phương thức thanh toán</Th>
                    <Th>Ngày tạo</Th>
                    <Th>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.map((order) => (
                    <Tr key={order.id}>
                      <Td>
                        <Text fontWeight="medium" color="blue.600">
                          {order.order_number}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{order.customer_name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {order.customer_phone}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {formatCurrency(order.total_amount)}
                          </Text>
                          {order.discount_amount > 0 && (
                            <Text fontSize="sm" color="green.600">
                              -{formatCurrency(order.discount_amount)}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {order.payment_method || "Chưa chọn"}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {format(
                            new Date(order.created_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<FiEye />}
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                            aria-label="Xem chi tiết"
                          />
                          <IconButton
                            size="sm"
                            icon={<FiEdit />}
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}/edit`)
                            }
                            aria-label="Chỉnh sửa"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Orders Cards - Mobile */}
        <VStack
          spacing={4}
          align="stretch"
          display={{ base: "flex", lg: "none" }}
        >
          {orders.map((order) => (
            <Card key={order.id}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="blue.600" fontSize="lg">
                        {order.order_number}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {format(
                          new Date(order.created_at),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: vi,
                          }
                        )}
                      </Text>
                    </VStack>
                    <Badge colorScheme={getStatusColor(order.status)} size="lg">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </HStack>

                  {/* Customer Info */}
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="md">
                      {order.customer_name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {order.customer_phone}
                    </Text>
                  </VStack>

                  {/* Payment Info */}
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Thanh toán: {order.payment_method || "Chưa chọn"}
                    </Text>
                  </HStack>

                  {/* Total */}
                  <VStack align="start" spacing={1}>
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="bold" fontSize="lg">
                        Tổng cộng:
                      </Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {formatCurrency(order.total_amount)}
                      </Text>
                    </HStack>
                    {order.discount_amount > 0 && (
                      <Text fontSize="sm" color="green.600">
                        Giảm giá: -{formatCurrency(order.discount_amount)}
                      </Text>
                    )}
                  </VStack>

                  {/* Actions */}
                  <HStack spacing={2} justify="center">
                    <Button
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      variant="outline"
                      colorScheme="blue"
                      flex={1}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiEdit />}
                      onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                      variant="outline"
                      colorScheme="teal"
                      flex={1}
                    >
                      Chỉnh sửa
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Pagination */}
        {pages > 1 && (
          <Flex justify="center" mt={6}>
            <HStack spacing={2} wrap="wrap" justify="center">
              <Button
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                isDisabled={filters.page <= 1}
              >
                Trước
              </Button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={filters.page === page ? "solid" : "outline"}
                    onClick={() => handlePageChange(page)}
                    display={{ base: "none", sm: "inline-flex" }}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                isDisabled={filters.page >= pages}
              >
                Sau
              </Button>
            </HStack>
          </Flex>
        )}

        {/* Empty state */}
        {orders.length === 0 && !isLoadingOrders && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">Không có đơn hàng nào</Text>
          </Box>
        )}
      </VStack>
    </Page>
  );
};

export default OrdersPage;
