import React from "react";
import {
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Box,
  Badge,
  IconButton,
  Flex,
  Heading,
  Button,
  useColorModeValue,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { formatCurrency } from "../../utils/formatters";

const IngredientCard = ({ ingredient, onView, onEdit, onDelete }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Card
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <CardBody p={4}>
        {/* Ingredient Header */}
        <Flex justify="space-between" align="start" mb={3}>
          <Box flex="1" minW={0}>
            <Heading size="sm" mb={1} noOfLines={1}>
              {ingredient.name}
            </Heading>
            <Text fontSize="xs" color="gray.500">
              {ingredient.unit}
            </Text>
          </Box>

          {/* Action Buttons - Mobile */}
          <HStack spacing={1} display={{ base: "flex", md: "none" }}>
            <IconButton
              size="sm"
              icon={<Icon as={FiEye} />}
              onClick={() => onView(ingredient.id)}
              variant="ghost"
              colorScheme="blue"
              aria-label="Xem chi tiết"
            />
            <IconButton
              size="sm"
              icon={<Icon as={FiEdit} />}
              onClick={() => onEdit(ingredient.id)}
              variant="ghost"
              colorScheme="teal"
              aria-label="Chỉnh sửa"
            />
            <IconButton
              size="sm"
              icon={<Icon as={FiTrash2} />}
              onClick={() => onDelete(ingredient.id)}
              variant="ghost"
              colorScheme="red"
              aria-label="Xóa"
            />
          </HStack>
        </Flex>

        {/* Ingredient Details */}
        <Box mb={3}>
          <VStack spacing={2} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Đơn giá:
              </Text>
              <Badge colorScheme="green" fontSize="sm">
                {formatCurrency(ingredient.unit_price)}/{ingredient.unit}
              </Badge>
            </Flex>
          </VStack>
        </Box>

        {/* Ingredient Footer */}
        <Divider my={3} />
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="gray.500">
            Tạo: {new Date(ingredient.created_at).toLocaleDateString("vi-VN")}
          </Text>

          {/* Action Buttons - Desktop */}
          <HStack spacing={2} display={{ base: "none", md: "flex" }}>
            <Button
              size="sm"
              leftIcon={<Icon as={FiEye} />}
              onClick={() => onView(ingredient.id)}
              variant="outline"
              colorScheme="blue"
            >
              Xem
            </Button>
            <Button
              size="sm"
              leftIcon={<Icon as={FiEdit} />}
              onClick={() => onEdit(ingredient.id)}
              variant="outline"
              colorScheme="teal"
            >
              Sửa
            </Button>
            <Button
              size="sm"
              leftIcon={<Icon as={FiTrash2} />}
              onClick={() => onDelete(ingredient.id)}
              variant="outline"
              colorScheme="red"
            >
              Xóa
            </Button>
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default IngredientCard;
