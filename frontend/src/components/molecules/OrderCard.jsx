import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  IconButton,
  useColorModeValue,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { FiEye, FiEdit, FiTruck, FiPackage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatTimeAgo } from "../../utils/formatters";
import {
  validTransitions,
  getStatusLabel,
  getStatusColor,
  canAssignShipper,
  getDeliveryStatusLabel,
  getDeliveryStatusColor,
} from "../../utils/orderHelpers";
import { useEditApi } from "../../hooks/useEditApi";

const OrderCard = ({ order, refetch }) => {
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const itemBgColor = useColorModeValue("gray.50", "gray.700");

  // API đổi trạng thái
  const { mutate: updateOrderStatus, isLoading: isUpdatingStatus } = useEditApi(
    {
      url: `/admin/orders/${order.id}/status`,
      protected: true,
    }
  );

  // Các trạng thái hợp lệ tiếp theo
  const allowedStatuses = validTransitions[order.status] || [];

  // Handler đổi trạng thái
  const handleChangeStatus = (newStatus) => {
    updateOrderStatus({ status: newStatus }, { onSuccess: refetch });
  };

  // Check if can assign shipper
  const canAssign = canAssignShipper(order.status);

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      bg={useColorModeValue("white", "gray.800")}
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="lg">
              {order.order_number}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {formatTimeAgo(order.created_at)}
            </Text>
          </VStack>
          <HStack spacing={2}>
            <Badge colorScheme={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
            {order.delivery_status && (
              <Badge colorScheme={getDeliveryStatusColor(order.delivery_status)}>
                {getDeliveryStatusLabel(order.delivery_status)}
              </Badge>
            )}
          </HStack>
        </Flex>

        {/* Customer Info */}
        <Box>
          <Text fontWeight="medium">{order.customer_name}</Text>
          <Text fontSize="sm" color="gray.600">
            {order.customer_phone}
          </Text>
        </Box>

        {/* Items Summary */}
        <Box bg={itemBgColor} p={3} borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            {order.items_count} sản phẩm
            </Text>
          {order.items && order.items.slice(0, 2).map((item, index) => (
            <Text key={index} fontSize="sm" color="gray.600">
              {item.quantity}x {item.product_name} - {item.variant_name}
            </Text>
          ))}
          {order.items && order.items.length > 2 && (
            <Text fontSize="sm" color="gray.500">
              +{order.items.length - 2} sản phẩm khác
            </Text>
          )}
        </Box>

        {/* Total */}
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="lg">
            {formatCurrency(order.total_amount)}
          </Text>
          <HStack spacing={2}>
            {canAssign && (
              <Tooltip label="Assign shipper">
            <IconButton
              size="sm"
              colorScheme="blue"
                  icon={<FiTruck />}
                  onClick={() => navigate(`/admin/orders/${order.id}/assign-shipper`)}
                  aria-label="Assign shipper"
                />
              </Tooltip>
            )}
            <Tooltip label="Xem chi tiết">
              <IconButton
                size="sm"
                colorScheme="teal"
                icon={<FiEye />}
              onClick={() => navigate(`/admin/orders/${order.id}`)}
                aria-label="View order"
            />
            </Tooltip>
            <Tooltip label="Chỉnh sửa">
            <IconButton
              size="sm"
              colorScheme="orange"
                icon={<FiEdit />}
              onClick={() => navigate(`/admin/orders/${order.id}/edit`)}
                aria-label="Edit order"
            />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Status Actions */}
        {allowedStatuses.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Chuyển trạng thái:
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {allowedStatuses.map((status) => (
                <Button
                  key={status}
                  size="xs"
                  colorScheme={getStatusColor(status)}
                  variant="outline"
                  onClick={() => handleChangeStatus(status)}
                  isLoading={isUpdatingStatus}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </HStack>
          </Box>
        )}

        {/* Delivery Info */}
        {order.shipper && (
          <Box bg="blue.50" p={3} borderRadius="md">
            <HStack spacing={2}>
              <FiTruck />
              <Text fontSize="sm">
                Shipper: {order.shipper.name} ({order.shipper.phone})
              </Text>
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default OrderCard;
