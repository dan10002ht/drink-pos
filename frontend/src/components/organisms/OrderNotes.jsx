import React from "react";
import { Card, CardBody, VStack, Text, Textarea } from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderNotes = () => {
  const { formData, handleChangeData } = useOrderContext();

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Ghi chú đơn hàng
          </Text>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChangeData("notes", e.target.value)}
            placeholder="Ghi chú cho đơn hàng (tùy chọn)"
            rows={3}
          />
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderNotes;
