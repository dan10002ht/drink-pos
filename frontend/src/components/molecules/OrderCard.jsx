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
} from "@chakra-ui/react";
import { FiEye, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { formatCurrency, formatTimeAgo } from "../../utils/formatters";

const OrderCard = ({ order, status }) => {
  const navigate = useNavigate();
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const itemBgColor = useColorModeValue("gray.50", "gray.700");

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Đã xử lý";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "yellow";
      case "processing":
        return "blue";
      case "completed":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Box
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
            <Badge colorScheme={getStatusColor(status)}>
              {getStatusLabel(status)}
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
  );
};

export default OrderCard;
