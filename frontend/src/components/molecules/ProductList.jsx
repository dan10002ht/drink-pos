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
  HStack,
  IconButton,
  Select,
  Box,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../atoms/ProductCard";

const ProductList = ({
  products,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRetry,
  onAddProduct,
  pagination,
  onPageChange,
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
          <Text color="red.500">Có lỗi xảy ra khi tải danh sách sản phẩm</Text>
          <Button mt={4} colorScheme="teal" onClick={onRetry}>
            Thử lại
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            Chưa có sản phẩm nào
          </Text>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Bắt đầu bằng cách tạo sản phẩm đầu tiên
          </Text>
          <Button colorScheme="teal" onClick={onAddProduct}>
            Tạo sản phẩm đầu tiên
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Product list
  return (
    <VStack spacing={4} align="stretch">
      {products?.map?.((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody>
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600">
                Trang {pagination.page} của {pagination.totalPages}
              </Text>

              <HStack spacing={2}>
                <IconButton
                  icon={<FiChevronLeft />}
                  onClick={() => onPageChange(pagination.page - 1)}
                  isDisabled={!pagination.hasPrev}
                  size="sm"
                  variant="outline"
                  aria-label="Trang trước"
                />

                {/* Page numbers */}
                <HStack spacing={1}>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={
                            pagination.page === pageNum ? "solid" : "outline"
                          }
                          colorScheme={
                            pagination.page === pageNum ? "blue" : "gray"
                          }
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </HStack>

                <IconButton
                  icon={<FiChevronRight />}
                  onClick={() => onPageChange(pagination.page + 1)}
                  isDisabled={!pagination.hasNext}
                  size="sm"
                  variant="outline"
                  aria-label="Trang sau"
                />
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default ProductList;
