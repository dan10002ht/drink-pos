import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  Text,
  Input,
  Button,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Divider,
  Select,
  Collapse,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useOrderContext } from "../../contexts/OrderContext";
import DiscountCodeValidator from "../molecules/DiscountCodeValidator";

const OrderDiscount = ({ subtotal = 0 }) => {
  const { formData, handleChangeData } = useOrderContext();
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [discountMode, setDiscountMode] = useState(
    formData.discount_code
      ? "code"
      : formData.manual_discount_amount > 0
      ? "manual"
      : "none"
  );

  // Handle discount mode change
  const handleDiscountModeChange = (mode) => {
    setDiscountMode(mode);

    // Clear other discount fields when switching modes
    if (mode === "code") {
      handleChangeData("manual_discount_amount", 0);
      handleChangeData("discount_note", "");
    } else if (mode === "manual") {
      handleChangeData("discount_code", "");
      handleChangeData("discount_type", null);
      handleChangeData("discount_amount", 0);
    } else {
      // Clear all discount fields
      handleChangeData("discount_code", "");
      handleChangeData("discount_type", null);
      handleChangeData("discount_amount", 0);
      handleChangeData("manual_discount_amount", 0);
      handleChangeData("discount_note", "");
    }
  };

  // Handle manual discount type change
  const handleManualDiscountTypeChange = (type) => {
    handleChangeData("discount_type", type);
    // Reset discount amount when changing type
    handleChangeData("discount_amount", 0);
    handleChangeData("manual_discount_amount", 0);
  };

  // Handle manual discount value change
  const handleManualDiscountValueChange = (value) => {
    const discountValue = parseFloat(value) || 0;
    handleChangeData("discount_amount", discountValue);

    // Calculate actual discount amount based on type
    let actualDiscount = 0;
    if (formData.discount_type === "percentage") {
      actualDiscount = (subtotal * discountValue) / 100;
    } else if (formData.discount_type === "fixed_amount") {
      actualDiscount = discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    actualDiscount = Math.min(actualDiscount, subtotal);
    handleChangeData("manual_discount_amount", actualDiscount);
  };

  // Handle discount code applied
  const handleDiscountCodeApplied = (discountInfo) => {
    handleChangeData("discount_type", discountInfo.discount_type);
    handleChangeData("discount_amount", discountInfo.discount_amount);
    handleChangeData("manual_discount_amount", 0); // Clear manual discount
    handleChangeData(
      "discount_note",
      `Áp dụng mã ${formData.discount_code}: ${discountInfo.discount_amount} VNĐ`
    );
  };

  // Calculate total discount
  const totalDiscount =
    formData.discount_amount + formData.manual_discount_amount;

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="semibold">
            Giảm giá
          </Text>

          {/* Discount Mode Selection */}
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={discountMode === "code" ? "solid" : "outline"}
              colorScheme="blue"
              onClick={() => handleDiscountModeChange("code")}
            >
              Mã giảm giá
            </Button>
            <Button
              size="sm"
              variant={discountMode === "manual" ? "solid" : "outline"}
              colorScheme="green"
              onClick={() => handleDiscountModeChange("manual")}
            >
              Giảm giá thủ công
            </Button>
            <Button
              size="sm"
              variant={discountMode === "none" ? "solid" : "outline"}
              colorScheme="gray"
              onClick={() => handleDiscountModeChange("none")}
            >
              Không giảm giá
            </Button>
          </HStack>

          {/* Discount Code Section */}
          {discountMode === "code" && (
            <Box>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Mã giảm giá
                </FormLabel>
                <DiscountCodeValidator
                  discountCode={formData.discount_code}
                  onDiscountCodeChange={(value) =>
                    handleChangeData("discount_code", value)
                  }
                  orderAmount={subtotal}
                  onDiscountApplied={handleDiscountCodeApplied}
                />
              </FormControl>
            </Box>
          )}

          {/* Manual Discount Section */}
          {discountMode === "manual" && (
            <Box>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Loại giảm giá
                </FormLabel>
                <Select
                  value={formData.discount_type || ""}
                  onChange={(e) =>
                    handleManualDiscountTypeChange(e.target.value)
                  }
                  placeholder="Chọn loại giảm giá"
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                </Select>
              </FormControl>

              {formData.discount_type && (
                <FormControl mt={3}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Giá trị giảm giá
                  </FormLabel>
                  <NumberInput
                    value={formData.discount_amount || ""}
                    onChange={handleManualDiscountValueChange}
                    min={0}
                    max={
                      formData.discount_type === "percentage" ? 100 : subtotal
                    }
                    precision={formData.discount_type === "percentage" ? 1 : 0}
                  >
                    <NumberInputField
                      placeholder={
                        formData.discount_type === "percentage"
                          ? "Nhập phần trăm giảm giá (0-100)"
                          : "Nhập số tiền giảm giá"
                      }
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {formData.discount_type === "percentage"
                      ? `Tối đa: ${Math.min(
                          100,
                          subtotal > 0 ? (subtotal * 100) / subtotal : 0
                        )}%`
                      : `Tối đa: ${new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(subtotal)}`}
                  </Text>
                </FormControl>
              )}

              <FormControl mt={3}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Ghi chú giảm giá thủ công
                </FormLabel>
                <Input
                  value={formData.discount_note}
                  onChange={(e) =>
                    handleChangeData("discount_note", e.target.value)
                  }
                  placeholder="Ghi chú cho giảm giá thủ công (nếu có)"
                />
              </FormControl>
            </Box>
          )}

          {/* Discount Summary - Expandable */}
          {totalDiscount > 0 && (
            <Box>
              {/* Summary Header */}
              <Flex
                justify="space-between"
                align="center"
                p={3}
                bg="blue.50"
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Tổng giảm giá:
                  </Text>
                  <Badge colorScheme="red" fontSize="md">
                    -
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalDiscount)}
                  </Badge>
                </HStack>
                <IconButton
                  size="sm"
                  icon={
                    isSummaryExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />
                  }
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                  variant="ghost"
                  aria-label={isSummaryExpanded ? "Thu gọn" : "Xem chi tiết"}
                />
              </Flex>

              {/* Expandable Details */}
              <Collapse in={isSummaryExpanded} animateOpacity>
                <Alert status="info" borderRadius="md" mt={2}>
                  <AlertIcon />
                  <Box flex={1}>
                    <AlertTitle>Chi tiết giảm giá</AlertTitle>
                    <AlertDescription>
                      <VStack align="start" spacing={1}>
                        {formData.discount_amount > 0 &&
                          formData.discount_code && (
                            <HStack spacing={2}>
                              <Text fontSize="sm">Mã giảm giá:</Text>
                              <Badge colorScheme="blue">
                                -
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(formData.discount_amount)}
                              </Badge>
                            </HStack>
                          )}
                        {formData.manual_discount_amount > 0 && (
                          <HStack spacing={2}>
                            <Text fontSize="sm">Giảm giá thủ công:</Text>
                            <Badge colorScheme="green">
                              -
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(formData.manual_discount_amount)}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              (
                              {formData.discount_type === "percentage"
                                ? `${formData.discount_amount}%`
                                : `${new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(formData.discount_amount)}`}
                              )
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              </Collapse>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderDiscount;
