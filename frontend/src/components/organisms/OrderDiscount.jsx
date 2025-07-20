import React from "react";
import { Box, Card, CardBody, VStack, Text, Input } from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";
import DiscountCodeValidator from "../molecules/DiscountCodeValidator";

const OrderDiscount = ({ subtotal = 0 }) => {
  const { formData, handleChangeData } = useOrderContext();

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Giảm giá
          </Text>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Mã giảm giá
            </Text>
            <DiscountCodeValidator
              discountCode={formData.discount_code}
              onDiscountCodeChange={(value) =>
                handleChangeData("discount_code", value)
              }
              orderAmount={subtotal}
              onDiscountApplied={(discountInfo) => {
                // Store discount info for backend processing
                handleChangeData(
                  "discount_note",
                  `Áp dụng mã ${formData.discount_code}: ${discountInfo.discount_amount} VNĐ`
                );
              }}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Ghi chú giảm giá thủ công
            </Text>
            <Input
              value={formData.discount_note}
              onChange={(e) =>
                handleChangeData("discount_note", e.target.value)
              }
              placeholder="Ghi chú cho giảm giá thủ công (nếu có)"
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderDiscount;
