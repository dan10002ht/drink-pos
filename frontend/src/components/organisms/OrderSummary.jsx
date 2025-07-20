import React from "react";
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Divider,
} from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderSummary = ({ itemsWithInfo = [], subtotal = 0 }) => {
  const { formatCurrency } = useOrderContext();

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Tóm tắt đơn hàng
          </Text>
          <VStack spacing={2} align="stretch">
            {itemsWithInfo.map((item, index) => (
              <HStack key={index} justify="space-between">
                <Text fontSize="sm">
                  {item.product_name} - {item.variant_name} x {item.quantity}
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(item.total_price)}
                </Text>
              </HStack>
            ))}
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="medium">Tổng cộng:</Text>
              <Text fontWeight="bold" fontSize="lg">
                {formatCurrency(subtotal)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderSummary;
