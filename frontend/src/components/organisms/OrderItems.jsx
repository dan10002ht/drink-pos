import React from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useOrderContext } from "../../contexts/OrderContext";
import Combobox from "../atoms/Combobox";

const OrderItems = ({ products = [] }) => {
  const {
    formData,
    errors,
    handleItemChange,
    addItem,
    removeItem,
    getVariantInfo,
    getVariantOptions,
    formatCurrency,
  } = useOrderContext();

  const variantOptions = getVariantOptions(products);

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Sản phẩm
            </Text>
            <Button size="sm" leftIcon={<FiPlus />} onClick={addItem}>
              Thêm sản phẩm
            </Button>
          </HStack>

          {formData.items.map((item, index) => (
            <Box
              key={index}
              p={4}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Sản phẩm *
                  </Text>
                  <Combobox
                    value={item.variant_id}
                    onChange={(value) =>
                      handleItemChange(index, "variant_id", value)
                    }
                    placeholder="Tìm kiếm sản phẩm..."
                    options={variantOptions}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.id}
                    isInvalid={!!errors.items?.[index]?.variant_id}
                  />
                  {errors.items?.[index]?.variant_id && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {errors.items[index].variant_id}
                    </Text>
                  )}
                </Box>
                <HStack spacing={4} wrap="wrap">
                  <Box minW="120px">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Số lượng *
                    </Text>
                    <NumberInput
                      value={item.quantity}
                      onChange={(value) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseInt(value) || 0
                        )
                      }
                      min={1}
                      isInvalid={!!errors.items?.[index]?.quantity}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    {errors.items?.[index]?.quantity && (
                      <Text fontSize="sm" color="red.500" mt={1}>
                        {errors.items[index].quantity}
                      </Text>
                    )}
                  </Box>
                  <Box flex={1} minW="200px">
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Ghi chú
                    </Text>
                    <Input
                      value={item.notes}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                      placeholder="Ghi chú cho sản phẩm"
                    />
                  </Box>
                  <IconButton
                    size="sm"
                    icon={<FiTrash2 />}
                    onClick={() => removeItem(index)}
                    isDisabled={formData.items.length === 1}
                    aria-label="Xóa sản phẩm"
                  />
                </HStack>

                {/* Item preview */}
                {item.variant_id && (
                  <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {
                            getVariantInfo(item.variant_id, products)
                              ?.product_name
                          }{" "}
                          -{" "}
                          {
                            getVariantInfo(item.variant_id, products)
                              ?.variant_name
                          }
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatCurrency(
                            getVariantInfo(item.variant_id, products)?.price ||
                              0
                          )}{" "}
                          x {item.quantity}
                        </Text>
                      </VStack>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(
                          (getVariantInfo(item.variant_id, products)?.price ||
                            0) * item.quantity
                        )}
                      </Text>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default OrderItems;
