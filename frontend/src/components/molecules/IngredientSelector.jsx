import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Button,
  Text,
  IconButton,
  Badge,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import { FiPlus, FiX } from "react-icons/fi";
import { useFetchApi } from "../../hooks/useFetchApi";
import { formatCurrency } from "../../utils/formatters";

const IngredientSelector = ({
  selectedIngredients = [],
  onIngredientsChange,
  errors = {},
}) => {
  const toast = useToast();

  // Fetch all ingredients
  const { data: ingredients = [], error: ingredientsError } = useFetchApi({
    url: "/admin/ingredients",
    protected: true,
    defaultData: [],
  });

  // Local state for adding new ingredient
  const [newIngredient, setNewIngredient] = useState({
    ingredient_id: "",
    quantity: "",
  });

  // Calculate total cost
  const calculateTotalCost = () => {
    return selectedIngredients.reduce((total, item) => {
      const ingredient = ingredients.find(
        (ing) => ing.id === item.ingredient_id
      );
      if (ingredient) {
        return total + ingredient.unit_price * item.quantity;
      }
      return total;
    }, 0);
  };

  // Add ingredient to variant
  const addIngredient = () => {
    if (!newIngredient.ingredient_id || !newIngredient.quantity) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nguyên liệu và nhập số lượng",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const quantity = parseFloat(newIngredient.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Lỗi",
        description: "Số lượng phải là số dương",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if ingredient already exists
    const exists = selectedIngredients.find(
      (item) => item.ingredient_id === newIngredient.ingredient_id
    );
    if (exists) {
      toast({
        title: "Lỗi",
        description: "Nguyên liệu này đã được thêm",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const updatedIngredients = [
      ...selectedIngredients,
      {
        ingredient_id: newIngredient.ingredient_id,
        quantity: quantity,
      },
    ];

    onIngredientsChange(updatedIngredients);
    setNewIngredient({ ingredient_id: "", quantity: "" });
  };

  // Remove ingredient from variant
  const removeIngredient = (ingredientId) => {
    const updatedIngredients = selectedIngredients.filter(
      (item) => item.ingredient_id !== ingredientId
    );
    onIngredientsChange(updatedIngredients);
  };

  // Update ingredient quantity
  const updateIngredientQuantity = (ingredientId, newQuantity) => {
    const quantity = parseFloat(newQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      return;
    }

    const updatedIngredients = selectedIngredients.map((item) =>
      item.ingredient_id === ingredientId
        ? { ...item, quantity: quantity }
        : item
    );
    onIngredientsChange(updatedIngredients);
  };

  // Get ingredient details
  const getIngredientDetails = (ingredientId) => {
    return ingredients.find((ing) => ing.id === ingredientId);
  };

  // Get available ingredients (not yet selected)
  const getAvailableIngredients = () => {
    const selectedIds = selectedIngredients.map((item) => item.ingredient_id);
    return ingredients.filter((ing) => !selectedIds.includes(ing.id));
  };

  if (ingredientsError) {
    return (
      <Box>
        <Text color="red.500">Lỗi tải danh sách nguyên liệu</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Add Ingredient Section */}
        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="semibold" mb={3}>
            Thêm nguyên liệu
          </Text>
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            gap={3}
            align="end"
          >
            <FormControl flex={2}>
              <FormLabel fontSize="sm">Chọn nguyên liệu</FormLabel>
              <Select
                value={newIngredient.ingredient_id}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    ingredient_id: e.target.value,
                  })
                }
                placeholder="Chọn nguyên liệu..."
                size="sm"
              >
                {getAvailableIngredients().map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} - {formatCurrency(ingredient.unit_price)}/
                    {ingredient.unit}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl flex={1}>
              <FormLabel fontSize="sm">Số lượng</FormLabel>
              <Input
                type="number"
                value={newIngredient.quantity}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    quantity: e.target.value,
                  })
                }
                placeholder="0.0"
                min="0"
                step="0.001"
                size="sm"
              />
            </FormControl>

            <Button
              leftIcon={<FiPlus />}
              onClick={addIngredient}
              size="sm"
              colorScheme="blue"
              isDisabled={
                !newIngredient.ingredient_id || !newIngredient.quantity
              }
            >
              Thêm
            </Button>
          </Flex>
        </Box>

        {/* Selected Ingredients Table */}
        {selectedIngredients.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={3}>
              Nguyên liệu đã chọn ({selectedIngredients.length})
            </Text>
            <Box
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
            >
              <Box>
                <Table size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Nguyên liệu</Th>
                      <Th>Đơn giá</Th>
                      <Th>Số lượng</Th>
                      <Th>Thành tiền</Th>
                      <Th width="50px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedIngredients.map((item) => {
                      const ingredient = getIngredientDetails(
                        item.ingredient_id
                      );
                      if (!ingredient) return null;

                      const totalPrice = ingredient.unit_price * item.quantity;

                      return (
                        <Tr key={item.ingredient_id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{ingredient.name}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {ingredient.unit}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {formatCurrency(ingredient.unit_price)}
                            </Text>
                          </Td>
                          <Td>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateIngredientQuantity(
                                  item.ingredient_id,
                                  e.target.value
                                )
                              }
                              size="sm"
                              width="80px"
                              min="0"
                              step="0.001"
                            />
                          </Td>
                          <Td>
                            <Text fontWeight="semibold" color="blue.600">
                              {formatCurrency(totalPrice)}
                            </Text>
                          </Td>
                          <Td>
                            <IconButton
                              icon={<FiX />}
                              onClick={() =>
                                removeIngredient(item.ingredient_id)
                              }
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              aria-label="Xóa nguyên liệu"
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Total Cost */}
            <Box mt={3} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="semibold" color="blue.700" textAlign="center">
                Tổng chi phí: {formatCurrency(calculateTotalCost())}
              </Text>
            </Box>
          </Box>
        )}

        {/* Error Message */}
        {errors.ingredients && (
          <Text color="red.500" fontSize="sm">
            {errors.ingredients}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default IngredientSelector;
