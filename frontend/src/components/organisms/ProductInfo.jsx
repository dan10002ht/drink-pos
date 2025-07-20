import React from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Heading,
} from "@chakra-ui/react";
import { useProductContext } from "../../contexts/ProductContext";

const ProductInfo = () => {
  const { formData, errors, handleChangeData, clearFieldError } =
    useProductContext();

  const handleInputChange = (field, value) => {
    handleChangeData(field, value);
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Thông tin sản phẩm
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Tên sản phẩm *</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            maxLength={200}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Mô tả sản phẩm</FormLabel>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Nhập mô tả sản phẩm..."
            maxLength={1000}
            rows={3}
          />
          <FormErrorMessage>{errors.description}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.private_note}>
          <FormLabel>Ghi chú riêng</FormLabel>
          <Textarea
            value={formData.private_note}
            onChange={(e) => handleInputChange("private_note", e.target.value)}
            placeholder="Nhập ghi chú riêng (chỉ admin thấy)..."
            maxLength={1000}
            rows={3}
          />
          <FormErrorMessage>{errors.private_note}</FormErrorMessage>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default ProductInfo;
