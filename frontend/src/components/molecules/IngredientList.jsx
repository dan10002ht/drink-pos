import React from "react";
import {
  VStack,
  Card,
  CardBody,
  Text,
  Button,
  Skeleton,
  SkeletonText,
  useColorModeValue,
} from "@chakra-ui/react";
import IngredientCard from "../atoms/IngredientCard";

const IngredientList = ({
  ingredients,
  isLoading,
  error,
  onView,
  onEdit,
  onDelete,
  onRetry,
  onAddIngredient,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Loading skeleton
  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        {[1, 2, 3].map((i) => (
          <Card key={i} bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Skeleton height="20px" width="60%" mb={2} />
              <SkeletonText noOfLines={2} spacing={2} />
            </CardBody>
          </Card>
        ))}
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <Text color="red.500">
            Có lỗi xảy ra khi tải danh sách nguyên liệu
          </Text>
          <Button mt={4} colorScheme="teal" onClick={onRetry}>
            Thử lại
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Empty state
  if (!ingredients || ingredients.length === 0) {
    return (
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            Chưa có nguyên liệu nào
          </Text>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Bắt đầu bằng cách tạo nguyên liệu đầu tiên
          </Text>
          <Button colorScheme="teal" onClick={onAddIngredient}>
            Tạo nguyên liệu đầu tiên
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Ingredient list
  return (
    <VStack spacing={4} align="stretch">
      {ingredients?.map?.((ingredient) => (
        <IngredientCard
          key={ingredient.id}
          ingredient={ingredient}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </VStack>
  );
};

export default IngredientList;
