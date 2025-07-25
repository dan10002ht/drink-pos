import React from "react";
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderSummary = ({ itemsWithInfo = [], subtotal = 0 }) => {
  const { formatCurrency, formData } = useOrderContext();

  // Calculate discount - for discount code, discount_amount is the actual amount
  // for manual discount, discount_amount is the value (percentage or fixed), manual_discount_amount is the calculated amount
  const discountCodeAmount = formData.discount_code
    ? formData.discount_amount || 0
    : 0;
  const manualDiscountAmount = formData.manual_discount_amount || 0;
  const totalDiscount = discountCodeAmount + manualDiscountAmount;
  const shippingFee = formData.shipping_fee || 0;
  const finalTotal = Math.max(0, subtotal - totalDiscount + shippingFee);
  console.log(itemsWithInfo);
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
                  {item.product_name} - {item.variant_name} x {item.quantity} (
                  {item.notes})
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(item.total_price)}
                </Text>
              </HStack>
            ))}
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="medium">Tổng cộng:</Text>
              <Text fontWeight="medium">{formatCurrency(subtotal)}</Text>
            </HStack>

            {/* Discount Section */}
            {totalDiscount > 0 && (
              <>
                <Divider />
                <VStack spacing={2} align="stretch">
                  {discountCodeAmount > 0 && (
                    <HStack justify="space-between">
                      <Text fontSize="sm">Mã giảm giá:</Text>
                      <Badge colorScheme="blue" fontSize="sm">
                        -{formatCurrency(discountCodeAmount)}
                      </Badge>
                    </HStack>
                  )}
                  {manualDiscountAmount > 0 && (
                    <HStack justify="space-between">
                      <Text fontSize="sm">Giảm giá thủ công:</Text>
                      <Badge colorScheme="green" fontSize="sm">
                        -{formatCurrency(manualDiscountAmount)}
                      </Badge>
                    </HStack>
                  )}
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="medium">
                      Tổng giảm giá:
                    </Text>
                    <Badge colorScheme="red" fontSize="sm">
                      -{formatCurrency(totalDiscount)}
                    </Badge>
                  </HStack>
                </VStack>
              </>
            )}

            {/* Shipping Fee Section */}
            {shippingFee > 0 && (
              <>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="sm">Phí vận chuyển:</Text>
                  <Badge colorScheme="orange" fontSize="sm">
                    +{formatCurrency(shippingFee)}
                  </Badge>
                </HStack>
              </>
            )}

            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="lg">
                Tổng thanh toán:
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="blue.600">
                {formatCurrency(finalTotal)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderSummary;
