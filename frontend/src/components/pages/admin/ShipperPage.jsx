import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  IconButton,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { FiPlus, FiSearch, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Page from "../../common/Page";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { formatDateOnly } from "../../../utils/formatters";

const ShipperPage = () => {
  const navigate = useNavigate();

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch shippers
  const {
    data: shipperData,
    isLoading,
    error,
    refetch,
  } = useFetchApi({
    url: "/admin/shippers",
    params: {
      page,
      limit,
      search: search || undefined,
    },
    protected: true,
  });

  // Handle search
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const shippers = shipperData?.shippers || [];
  const total = shipperData?.total || 0;
  const pages = shipperData?.pages || 0;

  return (
    <Page
      title="Quản lý Shipper"
      actionButton={{
        label: "Thêm Shipper",
        icon: FiPlus,
        onClick: () => navigate("/admin/shippers/create"),
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* Search and Filters */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Box flex={1}>
                <Input
                  placeholder="Tìm kiếm shipper..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  leftIcon={<FiSearch />}
                />
              </Box>
            </HStack>
          </CardBody>
        </Card>

        {/* Shippers List */}
        <Card>
          <CardBody>
            {isLoading ? (
              <VStack spacing={4} align="stretch">
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </VStack>
            ) : error ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Lỗi!</AlertTitle>
                <AlertDescription>
                  Không thể tải danh sách shipper. Vui lòng thử lại.
                </AlertDescription>
              </Alert>
            ) : shippers.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Text fontSize="lg" color="gray.500" mb={4}>
                  Chưa có shipper nào
                </Text>
                <Button
                  leftIcon={<FiPlus />}
                  onClick={() => navigate("/admin/shippers/create")}
                  colorScheme="blue"
                >
                  Thêm shipper đầu tiên
                </Button>
              </Box>
            ) : (
              <>
                {/* Desktop Table */}
                <Box display={{ base: "none", md: "block" }}>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Tên</Th>
                          <Th>Số điện thoại</Th>
                          <Th>Email</Th>
                          <Th>Trạng thái</Th>
                          <Th>Ngày tạo</Th>
                          <Th>Thao tác</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {shippers.map((shipper) => (
                          <Tr key={shipper.id}>
                            <Td>
                              <Text fontSize="sm" fontFamily="mono">
                                {shipper.id.slice(0, 8).toUpperCase()}
                              </Text>
                            </Td>
                            <Td>
                              <Text fontWeight="medium">{shipper.name}</Text>
                            </Td>
                            <Td>{shipper.phone}</Td>
                            <Td>{shipper.email || "N/A"}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  shipper.is_active ? "green" : "red"
                                }
                                fontSize="xs"
                              >
                                {shipper.is_active
                                  ? "Hoạt động"
                                  : "Không hoạt động"}
                              </Badge>
                            </Td>
                            <Td>{formatDateOnly(shipper.created_at)}</Td>
                            <Td>
                              <HStack spacing={2}>
                                <IconButton
                                  icon={<FiEye />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    navigate(`/admin/shippers/${shipper.id}`)
                                  }
                                  aria-label="Xem chi tiết"
                                />
                                <IconButton
                                  icon={<FiEdit />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    navigate(
                                      `/admin/shippers/${shipper.id}/edit`
                                    )
                                  }
                                  aria-label="Chỉnh sửa"
                                />
                                <IconButton
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  aria-label="Xóa"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Mobile Cards */}
                <Box display={{ base: "block", md: "none" }}>
                  <VStack spacing={4} align="stretch">
                    {shippers.map((shipper) => (
                      <Card key={shipper.id} variant="outline">
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack justify="space-between">
                              <Text fontSize="sm" fontFamily="mono">
                                {shipper.id.slice(0, 8).toUpperCase()}
                              </Text>
                              <Badge
                                colorScheme={
                                  shipper.is_active ? "green" : "red"
                                }
                                fontSize="xs"
                              >
                                {shipper.is_active
                                  ? "Hoạt động"
                                  : "Không hoạt động"}
                              </Badge>
                            </HStack>

                            <Text fontWeight="semibold" fontSize="lg">
                              {shipper.name}
                            </Text>

                            <VStack spacing={1} align="stretch">
                              <Text fontSize="sm" color="gray.600">
                                📞 {shipper.phone}
                              </Text>
                              {shipper.email && (
                                <Text fontSize="sm" color="gray.600">
                                  📧 {shipper.email}
                                </Text>
                              )}
                              <Text fontSize="sm" color="gray.600">
                                📅 {formatDateOnly(shipper.created_at)}
                              </Text>
                            </VStack>

                            <HStack spacing={2} justify="flex-end">
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  navigate(`/admin/shippers/${shipper.id}`)
                                }
                                aria-label="Xem chi tiết"
                              />
                              <IconButton
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  navigate(`/admin/shippers/${shipper.id}/edit`)
                                }
                                aria-label="Chỉnh sửa"
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Xóa"
                              />
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default ShipperPage;
