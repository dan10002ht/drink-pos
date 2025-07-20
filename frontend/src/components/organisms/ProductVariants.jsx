import React from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  Text,
  IconButton,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useProductContext } from "../../contexts/ProductContext";
import IngredientSelector from "../molecules/IngredientSelector";

const ProductVariants = () => {
  const {
    formData,
    errors,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantIngredients,
  } = useProductContext();

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          Biến thể sản phẩm
        </Text>
        <Button
          leftIcon={<Icon as={FiPlus} />}
          onClick={addVariant}
          size="sm"
          colorScheme="blue"
        >
          Thêm biến thể
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {formData.variants.map((variant, index) => (
          <Card key={index} variant="outline">
            <CardBody>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold">Biến thể {index + 1}</Text>
                {formData.variants.length > 1 && (
                  <IconButton
                    icon={<Icon as={FiX} />}
                    onClick={() => removeVariant(index)}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Xóa biến thể"
                  />
                )}
              </Flex>

              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <FormControl
                    isInvalid={
                      errors.variants &&
                      errors.variants[index] &&
                      errors.variants[index].name
                    }
                    flex={2}
                  >
                    <FormLabel>Tên biến thể *</FormLabel>
                    <Input
                      value={variant.name}
                      onChange={(e) =>
                        updateVariant(index, "name", e.target.value)
                      }
                      placeholder="VD: Size M, Màu đỏ..."
                      maxLength={100}
                    />
                    <FormErrorMessage>
                      {errors.variants &&
                        errors.variants[index] &&
                        errors.variants[index].name}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={
                      errors.variants &&
                      errors.variants[index] &&
                      errors.variants[index].price
                    }
                    flex={1}
                  >
                    <FormLabel>Giá (VNĐ) *</FormLabel>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      placeholder="25000"
                      min="0"
                      step="1000"
                    />
                    <FormErrorMessage>
                      {errors.variants &&
                        errors.variants[index] &&
                        errors.variants[index].price}
                    </FormErrorMessage>
                  </FormControl>
                </HStack>

                <FormControl
                  isInvalid={
                    errors.variants &&
                    errors.variants[index] &&
                    errors.variants[index].description
                  }
                >
                  <FormLabel>Mô tả biến thể</FormLabel>
                  <Textarea
                    value={variant.description}
                    onChange={(e) =>
                      updateVariant(index, "description", e.target.value)
                    }
                    placeholder="Nhập mô tả biến thể..."
                    maxLength={500}
                    rows={2}
                  />
                  <FormErrorMessage>
                    {errors.variants &&
                      errors.variants[index] &&
                      errors.variants[index].description}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={
                    errors.variants &&
                    errors.variants[index] &&
                    errors.variants[index].private_note
                  }
                >
                  <FormLabel>Ghi chú riêng</FormLabel>
                  <Textarea
                    value={variant.private_note}
                    onChange={(e) =>
                      updateVariant(index, "private_note", e.target.value)
                    }
                    placeholder="Nhập ghi chú riêng (chỉ admin thấy)..."
                    maxLength={500}
                    rows={2}
                  />
                  <FormErrorMessage>
                    {errors.variants &&
                      errors.variants[index] &&
                      errors.variants[index].private_note}
                  </FormErrorMessage>
                </FormControl>

                {/* Ingredients Section */}
                <Box>
                  <FormLabel>Nguyên liệu</FormLabel>
                  <IngredientSelector
                    selectedIngredients={variant.ingredients || []}
                    onIngredientsChange={(ingredients) =>
                      updateVariantIngredients(index, ingredients)
                    }
                    errors={
                      errors.variants &&
                      errors.variants[index] &&
                      errors.variants[index].ingredients
                        ? {
                            ingredients: errors.variants[index].ingredients,
                          }
                        : {}
                    }
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
};

export default ProductVariants;
