import React from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Heading,
} from "@chakra-ui/react";
import { useIngredientContext } from "../../contexts/IngredientContext";

const IngredientInfo = () => {
  const { formData, errors, handleInputChange } = useIngredientContext();

  return (
    <Box>
      <Heading size="md" mb={4}>
        Thông tin nguyên liệu
      </Heading>

      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Tên nguyên liệu *</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Nhập tên nguyên liệu..."
            maxLength={200}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.unit_price}>
          <FormLabel>Đơn giá *</FormLabel>
          <Input
            type="number"
            value={formData.unit_price}
            onChange={(e) => handleInputChange("unit_price", e.target.value)}
            placeholder="Nhập đơn giá..."
            min="0"
            step="0.01"
          />
          <FormErrorMessage>{errors.unit_price}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.unit}>
          <FormLabel>Đơn vị *</FormLabel>
          <Input
            value={formData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            placeholder="Nhập đơn vị (kg, lít, quả, etc.)..."
            maxLength={50}
          />
          <FormErrorMessage>{errors.unit}</FormErrorMessage>
        </FormControl>
      </VStack>
    </Box>
  );
};

export default IngredientInfo;
