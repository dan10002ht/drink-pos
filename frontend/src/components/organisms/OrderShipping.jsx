import React from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderShipping = () => {
  const { formData, handleChangeData } = useOrderContext();

  // Handle shipping fee change
  const handleShippingFeeChange = (value) => {
    const fee = parseFloat(value) || 0;
    handleChangeData("shipping_fee", fee);
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Phí vận chuyển
          </Text>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">
              Phí ship thủ công
            </FormLabel>
            <NumberInput
              value={formData.shipping_fee || ""}
              onChange={handleShippingFeeChange}
              min={0}
              precision={0}
            >
              <NumberInputField placeholder="Nhập phí vận chuyển" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          {/* Shipping Fee Summary */}
          {formData.shipping_fee > 0 && (
            <Box>
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Phí vận chuyển:
                </Text>
                <Badge colorScheme="orange" fontSize="md">
                  +
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(formData.shipping_fee)}
                </Badge>
              </HStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderShipping;
