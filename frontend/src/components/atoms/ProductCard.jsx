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

const ProductCard = ({ product, onEdit, onDelete }) => {
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
        {/* Product Header */}
        <Flex justify="space-between" align="start" mb={3}>
          <Box flex="1" minW={0}>
            <Heading size="sm" mb={1} noOfLines={1}>
              {product.name}
            </Heading>
            {product.description && (
              <Text fontSize="xs" color="gray.500" noOfLines={2} mb={1}>
                {product.description}
              </Text>
            )}
            <Text fontSize="xs" color="gray.500">
              {product.variants?.length || 0} biến thể
            </Text>
          </Box>

          {/* Action Buttons - Mobile */}
          <HStack spacing={1} display={{ base: "flex", md: "none" }}>
            <IconButton
              size="sm"
              icon={<Icon as={FiEdit} />}
              onClick={() => onEdit(product.id)}
              variant="ghost"
              colorScheme="teal"
              aria-label="Chỉnh sửa"
            />
            <IconButton
              size="sm"
              icon={<Icon as={FiTrash2} />}
              onClick={() => onDelete(product.id)}
              variant="ghost"
              colorScheme="red"
              aria-label="Xóa"
            />
          </HStack>
        </Flex>

        {/* Variants Preview */}
        {product.variants && product.variants.length > 0 && (
          <Box mb={3}>
            <VStack spacing={1} align="stretch">
              {product.variants.slice(0, 3).map((variant, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Box flex="1" minW={0}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {variant.name}
                    </Text>
                    {variant.description && (
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {variant.description}
                      </Text>
                    )}
                  </Box>
                  <Badge colorScheme="green" fontSize="xs" ml={2}>
                    {formatCurrency(variant.price)}
                  </Badge>
                </Flex>
              ))}
              {product.variants.length > 3 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{product.variants.length - 3} biến thể khác
                </Text>
              )}
            </VStack>
          </Box>
        )}

        <Divider my={3} />

        {/* Action Buttons - Desktop */}
        <HStack
          spacing={2}
          justify="center"
          display={{ base: "none", md: "flex" }}
        >
          <Button
            size="sm"
            leftIcon={<Icon as={FiEdit} />}
            onClick={() => onEdit(product.id)}
            variant="ghost"
            colorScheme="teal"
          >
            Sửa
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FiTrash2} />}
            onClick={() => onDelete(product.id)}
            variant="ghost"
            colorScheme="red"
          >
            Xóa
          </Button>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default ProductCard;
