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
  Select,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverCloseButton,
  MenuItem,
  MenuList,
  Menu,
  MenuButton,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { FiArrowLeft, FiEdit, FiClock, FiChevronDown } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate, formatCurrency } from "../../../utils/formatters";
import {
  getStatusColor,
  getStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  validTransitions,
} from "../../../utils/orderHelpers";

import Page from "../../common/Page";
import OrderStatusHistory from "../../molecules/OrderStatusHistory";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import ActionList from "../../molecules/ActionList";

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // State
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: "",
  });

  // Fetch order details
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useFetchApi({
    url: `/admin/orders/${id}`,
    protected: true,
  });

  // Fetch order statuses
  const { data: statusesData } = useFetchApi({
    url: "/admin/orders/statuses",
    protected: true,
  });

  // Update order status mutation
  const { mutate: updateOrderStatus, isLoading: isUpdatingStatus } = useEditApi(
    {
      url: `/admin/orders/${id}/status`,
      protected: true,
    }
  );

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

  const statuses = statusesData || [];
  const headings = ["Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền", "Ghi chú"];

  const currentStatus = statusUpdate.status || order.status || "";
  const allowedStatuses = validTransitions[currentStatus] || [];
  const statusOptions = statuses.filter(
    (s) => s.value === currentStatus || allowedStatuses.includes(s.value)
  );

  return (
    <>
      <Page
        title={`Đơn hàng ${order.order_number}`}
        backAction={{
          label: "Quay lại",
          icon: FiArrowLeft,
          onClick: () => navigate("/admin/orders"),
        }}
        actions={
          <Popover
            isOpen={isOpen}
            onClose={onClose}
            closeOnBlur
            placement="bottom-end"
          >
            <PopoverTrigger>
              <Button
                size={{ base: "xs", md: "md" }}
                colorScheme="teal"
                onClick={onOpen}
                leftIcon={<FiEdit />}
                rightIcon={<FiChevronDown />}
              >
                {getStatusLabel(statusUpdate.status || order.status) ||
                  "Chưa có trạng thái"}
              </Button>
            </PopoverTrigger>
            <PopoverContent minW="200px">
              <PopoverArrow />
              <PopoverBody>
                <ActionList
                  actions={statusOptions.map((s) => ({
                    value: s.value,
                    label: getStatusLabel(s.value),
                    color: getStatusColor(s.value),
                  }))}
                  current={currentStatus}
                  onAction={async (value) => {
                    setStatusUpdate((prev) => ({ ...prev, status: value }));
                    await updateOrderStatus({ ...statusUpdate, status: value });
                    refetchOrder();
                    onClose();
                  }}
                />
                {isUpdatingStatus && <Spinner size="sm" ml={2} />}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        }
        secondaryAction={{
          label: "Chỉnh sửa",
          icon: FiEdit,
          onClick: () => navigate(`/admin/orders/${order.id}/edit`),
        }}
      >
        <VStack spacing={6} align="stretch">
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
                        {headings.map((heading) => (
                          <Th p="2" key={heading}>
                            {heading}
                          </Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {order.items?.map((item, index) => (
                        <Tr key={index}>
                          <Td p="2">
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

                  {/* Discount Section */}
                  {order.discount_amount > 0 && (
                    <>
                      {/* Discount Code */}
                      {order.discount_code && (
                        <HStack justify="space-between">
                          <Text>Mã giảm giá ({order.discount_code}):</Text>
                          <Text fontWeight="medium" color="green.600">
                            {order.discount_type === "percentage"
                              ? `-${order.discount_amount}%`
                              : `-${formatCurrency(order.discount_amount)}`}
                          </Text>
                        </HStack>
                      )}

                      {/* Manual Discount */}
                      {!order.discount_code && (
                        <HStack justify="space-between">
                          <Text>Giảm giá thủ công:</Text>
                          <Text fontWeight="medium" color="green.600">
                            {order.discount_type === "percentage"
                              ? `(-${order.discount_amount}%) -${formatCurrency(
                                  (order.subtotal * order.discount_amount) / 100
                                )}`
                              : `-${formatCurrency(order.discount_amount)}`}
                          </Text>
                        </HStack>
                      )}
                    </>
                  )}

                  {/* Shipping Fee */}
                  {order.shipping_fee > 0 && (
                    <>
                      <Divider />
                      <HStack justify="space-between">
                        <Text>Phí vận chuyển:</Text>
                        <Text fontWeight="medium" color="orange.600">
                          +{formatCurrency(order.shipping_fee)}
                        </Text>
                      </HStack>
                    </>
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
                      colorScheme={getPaymentStatusColor(order.payment_status)}
                    >
                      {getPaymentStatusLabel(order.payment_status)}
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

          {/* Shipper Info */}
          {order.shipper && (
            <Card>
              <CardBody>
                <VStack spacing={2} align="start">
                  <Text fontSize="lg" fontWeight="semibold">
                    Thông tin Shipper
                  </Text>
                  <HStack spacing={4}>
                    <Text fontWeight="medium">{order.shipper.name}</Text>
                    <Text color="gray.600">{order.shipper.phone}</Text>
                    {order.shipper.email && (
                      <Text color="gray.600">{order.shipper.email}</Text>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}

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
    </>
  );
};

export default OrderDetailPage;
