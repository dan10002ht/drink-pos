import React from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Input,
  Select,
} from "@chakra-ui/react";
import { useOrderContext } from "../../contexts/OrderContext";

const OrderCustomerInfo = ({ paymentMethods = [] }) => {
  const { formData, errors, handleChangeData } = useOrderContext();

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Thông tin khách hàng
          </Text>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Tên khách hàng *
              </Text>
              <Input
                value={formData.customer_name}
                onChange={(e) =>
                  handleChangeData("customer_name", e.target.value)
                }
                placeholder="Nhập tên khách hàng"
                isInvalid={!!errors.customer_name}
              />
              {errors.customer_name && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {errors.customer_name}
                </Text>
              )}
            </Box>
            <HStack spacing={4} wrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Số điện thoại *
                </Text>
                <Input
                  value={formData.customer_phone}
                  onChange={(e) =>
                    handleChangeData("customer_phone", e.target.value)
                  }
                  placeholder="Nhập số điện thoại"
                  isInvalid={!!errors.customer_phone}
                />
                {errors.customer_phone && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {errors.customer_phone}
                  </Text>
                )}
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Email
                </Text>
                <Input
                  value={formData.customer_email}
                  onChange={(e) =>
                    handleChangeData("customer_email", e.target.value)
                  }
                  placeholder="Nhập email (tùy chọn)"
                  type="email"
                />
              </Box>
            </HStack>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Phương thức thanh toán
              </Text>
              <Select
                value={formData.payment_method}
                onChange={(e) =>
                  handleChangeData("payment_method", e.target.value)
                }
                placeholder="Chọn phương thức thanh toán"
                isInvalid={!!errors.payment_method}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
              {errors.payment_method && (
                <Text fontSize="sm" color="red.500" mt={1}>
                  {errors.payment_method}
                </Text>
              )}
            </Box>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderCustomerInfo;
