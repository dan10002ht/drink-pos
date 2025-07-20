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
  Divider,
  useToast,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Textarea,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit, FiClock } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../../utils/formatters";

import Page from "../../common/Page";
import OrderStatusHistory from "../../molecules/OrderStatusHistory";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
  });

  // Fetch order details
  const {
    data: orderData,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useFetchApi(`/admin/orders/${id}`);

  // Fetch order statuses
  const { data: statusesData } = useFetchApi({
    url: "/admin/orders/statuses",
    protected: true,
  });

  // Update order status mutation
  const { mutate: updateOrderStatus, isLoading: isUpdatingStatus } = useEditApi(
    `/admin/orders/${id}/status`
  );

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

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(statusUpdate);
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái đơn hàng đã được cập nhật",
        status: "success",
      });
      onClose();
      refetchOrder();
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái đơn hàng",
        status: "error",
      });
    }
  };

  // Loading state
  if (isLoadingOrder) {
    return (
      <Page title="Chi tiết đơn hàng">
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="20px" />
              <Skeleton height="40px" />
              <Skeleton height="100px" />
              <Skeleton height="100px" />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (orderError) {
    return (
      <Page title="Chi tiết đơn hàng">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  const order = orderData?.data;

  if (!order) {
    return (
      <Page title="Chi tiết đơn hàng">
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Không tìm thấy!</AlertTitle>
          <AlertDescription>
            Đơn hàng không tồn tại hoặc đã bị xóa.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  const statuses = statusesData?.data || [];

  return (
    <>
      <Page
        title={`Đơn hàng ${order.order_number}`}
        backAction={{
          label: "Quay lại",
          icon: FiArrowLeft,
          onClick: () => navigate("/admin/orders"),
        }}
        primaryAction={{
          label: "Cập nhật trạng thái",
          icon: FiEdit,
          onClick: onOpen,
        }}
        secondaryAction={{
          label: "Chỉnh sửa",
          icon: FiEdit,
          onClick: () => navigate(`/admin/orders/${order.id}/edit`),
        }}
      >
        <VStack spacing={6} align="stretch">
          {/* Order Header */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                      {order.order_number}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Tạo lúc: {formatDate(order.created_at)}
                    </Text>
                  </VStack>
                  <Badge size="lg" colorScheme={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Thông tin khách hàng
                </Text>
                <HStack spacing={6}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Tên khách hàng
                    </Text>
                    <Text fontWeight="medium">{order.customer_name}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Số điện thoại
                    </Text>
                    <Text fontWeight="medium">{order.customer_phone}</Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Email
                    </Text>
                    <Text fontWeight="medium">
                      {order.customer_email || "Không có"}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Order Items */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Sản phẩm ({order.items?.length || 0} sản phẩm)
                </Text>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Sản phẩm</Th>
                        <Th>Số lượng</Th>
                        <Th>Đơn giá</Th>
                        <Th>Thành tiền</Th>
                        <Th>Ghi chú</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {order.items?.map((item, index) => (
                        <Tr key={index}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">
                                {item.product_name}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {item.variant_name}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>{item.quantity}</Td>
                          <Td>{formatCurrency(item.unit_price)}</Td>
                          <Td>{formatCurrency(item.total_price)}</Td>
                          <Td>
                            <Text fontSize="sm" color="gray.600">
                              {item.notes || "Không có"}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </CardBody>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Tóm tắt đơn hàng
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text>Tổng tiền hàng:</Text>
                    <Text fontWeight="medium">
                      {formatCurrency(order.subtotal)}
                    </Text>
                  </HStack>
                  {order.discount_amount > 0 && (
                    <HStack justify="space-between">
                      <Text>Giảm giá:</Text>
                      <Text fontWeight="medium" color="green.600">
                        -{formatCurrency(order.discount_amount)}
                      </Text>
                    </HStack>
                  )}
                  <Divider />
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">
                      Tổng cộng:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {formatCurrency(order.total_amount)}
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Thông tin bổ sung
                </Text>
                <HStack spacing={6} wrap="wrap">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Phương thức thanh toán
                    </Text>
                    <Text fontWeight="medium">
                      {order.payment_method || "Chưa chọn"}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Trạng thái thanh toán
                    </Text>
                    <Badge
                      colorScheme={
                        order.payment_status === "paid" ? "green" : "yellow"
                      }
                    >
                      {order.payment_status === "paid"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </Badge>
                  </VStack>
                  {order.discount_code && (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">
                        Mã giảm giá
                      </Text>
                      <Text fontWeight="medium">{order.discount_code}</Text>
                    </VStack>
                  )}
                </HStack>
                {order.notes && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Ghi chú đơn hàng
                    </Text>
                    <Text>{order.notes}</Text>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Status History */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Lịch sử trạng thái
                </Text>
                <OrderStatusHistory statusHistory={order.status_history} />
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Page>

      {/* Status Update Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập nhật trạng thái đơn hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Trạng thái mới
                </Text>
                <Select
                  value={statusUpdate.status}
                  onChange={(e) =>
                    setStatusUpdate((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  placeholder="Chọn trạng thái"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Ghi chú (tùy chọn)
                </Text>
                <Textarea
                  value={statusUpdate.notes}
                  onChange={(e) =>
                    setStatusUpdate((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Ghi chú khi thay đổi trạng thái"
                  rows={3}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Hủy
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleStatusUpdate}
              isLoading={isUpdatingStatus}
              isDisabled={!statusUpdate.status}
            >
              Cập nhật
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderDetailPage;
