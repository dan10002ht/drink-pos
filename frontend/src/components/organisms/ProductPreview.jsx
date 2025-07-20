import React from "react";
import {
  Card,
  CardBody,
  Flex,
  Heading,
  Text,
  Badge,
  Box,
  VStack,
} from "@chakra-ui/react";
import { useProductContext } from "../../contexts/ProductContext";
import { formatCurrency } from "../../utils/formatters";

const ProductPreview = () => {
  const { formData } = useProductContext();

  return (
    <Card mb={6}>
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Xem trước sản phẩm</Heading>
          <Badge colorScheme="blue" fontSize="sm">
            {formData.variants.length} biến thể
          </Badge>
        </Flex>

        <Box p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="semibold" fontSize="lg" mb={2}>
            {formData.name || "Tên sản phẩm"}
          </Text>
          {formData.description && (
            <Text fontSize="sm" color="gray.600" mb={2}>
              {formData.description}
            </Text>
          )}
          {formData.variants.length > 0 && formData.variants[0].name && (
            <VStack spacing={2} align="stretch">
              {formData.variants.slice(0, 3).map((variant, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Text fontSize="sm">{variant.name || "Tên biến thể"}</Text>
                  <Badge colorScheme="green" fontSize="xs">
                    {variant.price
                      ? formatCurrency(parseFloat(variant.price))
                      : "0 ₫"}
                  </Badge>
                </Flex>
              ))}
              {formData.variants.length > 3 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{formData.variants.length - 3} biến thể khác
                </Text>
              )}
            </VStack>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default ProductPreview;
