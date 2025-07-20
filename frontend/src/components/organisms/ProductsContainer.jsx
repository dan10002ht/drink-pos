import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { fetchProtectedApi } from "../../api/fetchPublicApi";
import useDebounce from "../../hooks/useDebounce";
import Page from "../common/Page";
import ProductList from "../molecules/ProductList";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";

const ProductsContainer = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fixed page size
  const pageSize = 20;

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const queryParams = {
    search: debouncedSearchTerm,
    page: currentPage,
    limit: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  // Fetch products with pagination
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products", JSON.stringify(queryParams)],
    queryFn: () =>
      fetchProtectedApi({ url: "/admin/products", params: queryParams }),
    enabled: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnQueryChange: true,
    initialData: {
      data: {
        products: [],
        total: 0,
        page: 1,
        limit: pageSize,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
    },
  });

  // Extract data
  const products = productsData?.data?.products || [];
  const pagination = {
    total: productsData?.data?.total || 0,
    page: productsData?.data?.page || 1,
    limit: productsData?.data?.limit || pageSize,
    totalPages: productsData?.data?.total_pages || 0,
    hasNext: productsData?.data?.has_next || false,
    hasPrev: productsData?.data?.has_prev || false,
  };

  const handleAddProduct = () => {
    navigate("/admin/products/create");
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/${productId}`);
  };

  const handleDeleteProduct = () => {
    // TODO: Implement delete functionality
    toast({
      title: "Xóa sản phẩm",
      description: "Tính năng xóa sản phẩm sẽ được implement sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRetry = () => {
    refetch();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(":");

    // Validate sort field and order
    const validSortFields = ["name", "created_at", "updated_at"];
    const validSortOrders = ["asc", "desc"];

    if (validSortFields.includes(field) && validSortOrders.includes(order)) {
      setSortBy(field);
      setSortOrder(order);
      setCurrentPage(1); // Reset to first page when sorting
    } else {
      console.error("Invalid sort parameters:", field, order);
    }
  };

  return (
    <Page
      title="Quản lý sản phẩm"
      primaryAction={{
        label: "Thêm sản phẩm",
        icon: FiPlus,
        onClick: handleAddProduct,
      }}
    >
      <VStack spacing={4} align="stretch">
        {/* Search and Filter Bar */}
        <Box
          p={4}
          bg="white"
          borderRadius="md"
          border="1px"
          borderColor="gray.200"
        >
          <HStack spacing={4} align="center">
            <Box flex={1}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </Box>

            <Select
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              width="200px"
            >
              <option value="created_at:desc">Mới nhất</option>
              <option value="created_at:asc">Cũ nhất</option>
              <option value="name:asc">Tên A-Z</option>
              <option value="name:desc">Tên Z-A</option>
              <option value="updated_at:desc">Cập nhật gần nhất</option>
            </Select>
          </HStack>

          {/* Results info */}
          <Text fontSize="sm" color="gray.600" mt={2}>
            Hiển thị {products.length} trong tổng số {pagination.total} sản phẩm
            {debouncedSearchTerm && ` cho "${debouncedSearchTerm}"`}
          </Text>
        </Box>

        {/* Product List */}
        <ProductList
          products={products}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onRetry={handleRetry}
          onAddProduct={handleAddProduct}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </VStack>
    </Page>
  );
};

export default ProductsContainer;
