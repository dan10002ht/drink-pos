import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
} from "@chakra-ui/react";
import { FiCheck, FiX } from "react-icons/fi";

import { useCreateApi } from "../../hooks/useCreateApi";

const DiscountCodeValidator = ({
  discountCode,
  onDiscountCodeChange,
  orderAmount,
  onDiscountApplied,
  isDisabled = false,
}) => {
  const toast = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Validate discount code mutation
  const { mutate: validateDiscountCode } = useCreateApi({
    url: "/admin/orders/validate-discount",
    protected: true,
  });

  // Handle validate discount code
  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã giảm giá",
        status: "error",
      });
      return;
    }

    if (!orderAmount || orderAmount <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng thêm sản phẩm vào đơn hàng trước",
        status: "error",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateDiscountCode({
        code: discountCode,
        order_amount: orderAmount,
      });

      if (result.data.is_valid) {
        setValidationResult(result.data);
        onDiscountApplied?.(result.data);
        toast({
          title: "Thành công",
          description: result.data.message,
          status: "success",
        });
      } else {
        setValidationResult(result.data);
        toast({
          title: "Lỗi",
          description: result.data.message,
          status: "error",
        });
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra mã giảm giá",
        status: "error",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get discount type label
  const getDiscountTypeLabel = (type) => {
    return type === "percentage" ? "Phần trăm" : "Số tiền cố định";
  };

  return (
    <VStack spacing={3} align="stretch">
      <HStack spacing={2}>
        <Input
          value={discountCode}
          onChange={(e) => onDiscountCodeChange(e.target.value)}
          placeholder="Nhập mã giảm giá"
          isDisabled={isDisabled}
        />
        <Button
          onClick={handleValidateDiscount}
          isLoading={isValidating}
          isDisabled={!discountCode.trim() || isDisabled}
          colorScheme="blue"
          size="md"
        >
          Kiểm tra
        </Button>
      </HStack>

      {/* Validation Result */}
      {validationResult && (
        <Alert
          status={validationResult.is_valid ? "success" : "error"}
          borderRadius="md"
        >
          <AlertIcon />
          <Box flex={1}>
            <AlertTitle>
              {validationResult.is_valid
                ? "Mã giảm giá hợp lệ"
                : "Mã giảm giá không hợp lệ"}
            </AlertTitle>
            <AlertDescription>
              {validationResult.message}
              {validationResult.is_valid && (
                <VStack align="start" spacing={1} mt={2}>
                  <HStack spacing={2}>
                    <Text fontSize="sm">Loại giảm giá:</Text>
                    <Badge colorScheme="blue">
                      {getDiscountTypeLabel(validationResult.discount_type)}
                    </Badge>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm">Giá trị giảm:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {validationResult.discount_type === "percentage"
                        ? `${validationResult.discount_value}%`
                        : formatCurrency(validationResult.discount_value)}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm">Số tiền giảm:</Text>
                    <Text fontSize="sm" fontWeight="medium" color="green.600">
                      {formatCurrency(validationResult.discount_amount)}
                    </Text>
                  </HStack>
                </VStack>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </VStack>
  );
};

export default DiscountCodeValidator;
