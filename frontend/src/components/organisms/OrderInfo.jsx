import React from "react";
import { Card, CardBody, VStack, HStack, Text, Badge } from "@chakra-ui/react";

const OrderInfo = ({ order }) => {
  if (!order) return null;

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Thông tin đơn hàng
            </Text>
            <Badge colorScheme="blue" size="lg">
              {order.order_number}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Tạo lúc: {new Date(order.created_at).toLocaleString("vi-VN")}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderInfo;
