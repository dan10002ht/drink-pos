import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Flex,
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
  Collapse,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import Page from "../../common/Page";
import { useFetchApi } from "../../../hooks/useFetchApi";

const UsersPage = () => {
  const navigate = useNavigate();
  const { isOpen: isFilterOpen, onToggle: onFilterToggle } = useDisclosure();

  // State
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    role: "",
    search: "",
    is_active: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  // Fetch users
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useFetchApi({
    url: "/admin/users",
    params: filters,
    protected: true,
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Get role color
  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      staff: "blue",
      customer: "green",
    };
    return colors[role] || "gray";
  };

  // Get role label
  const getRoleLabel = (role) => {
    const labels = {
      admin: "Quản trị viên",
      staff: "Nhân viên",
      customer: "Khách hàng",
    };
    return labels[role] || role;
  };

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? "green" : "red";
  };

  // Get status label
  const getStatusLabel = (isActive) => {
    return isActive ? "Hoạt động" : "Không hoạt động";
  };

  // Loading state
  if (isLoadingUsers && !usersData) {
    return (
      <Page title="Quản lý người dùng">
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="40px" />
              <Skeleton height="400px" />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (usersError) {
    return (
      <Page title="Quản lý người dùng">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách người dùng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  const users = usersData?.users || [];
  const total = usersData?.total || 0;
  const pages = usersData?.pages || 1;

  return (
    <Page
      title="Quản lý người dùng"
      primaryAction={{
        label: "Thêm người dùng",
        icon: FiPlus,
        onClick: () => navigate("/admin/users/create"),
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* Filters */}
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Filter Header */}
              <HStack justify="space-between" align="center">
                <HStack spacing={2}>
                  <FiFilter />
                  <Text fontSize="lg" fontWeight="semibold">
                    Bộ lọc
                  </Text>
                  {(filters.role || filters.is_active || filters.search) && (
                    <Badge colorScheme="blue" size="sm">
                      Đang lọc
                    </Badge>
                  )}
                </HStack>
                <Button
                  _focus={{ outline: "none !important" }}
                  _hover={{ borderColor: "none !important" }}
                  size="sm"
                  variant="ghost"
                  onClick={onFilterToggle}
                >
                  {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
                </Button>
              </HStack>

              {/* Search - Always visible */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Tìm kiếm
                </Text>
                <Input
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  leftIcon={<FiSearch />}
                />
              </Box>

              {/* Collapsible Filters */}
              <Collapse in={isFilterOpen} animateOpacity>
                <VStack spacing={4} align="stretch">
                  {/* Filters Row */}
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={3} wrap="wrap">
                      <Box flex={1} minW="200px">
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Vai trò
                        </Text>
                        <Select
                          value={filters.role}
                          onChange={(e) =>
                            handleFilterChange("role", e.target.value)
                          }
                          placeholder="Tất cả vai trò"
                        >
                          <option value="admin">Quản trị viên</option>
                          <option value="staff">Nhân viên</option>
                          <option value="customer">Khách hàng</option>
                        </Select>
                      </Box>
                      <Box flex={1} minW="150px">
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Trạng thái
                        </Text>
                        <Select
                          value={filters.is_active}
                          onChange={(e) =>
                            handleFilterChange("is_active", e.target.value)
                          }
                          placeholder="Tất cả trạng thái"
                        >
                          <option value="true">Hoạt động</option>
                          <option value="false">Không hoạt động</option>
                        </Select>
                      </Box>
                    </HStack>
                  </VStack>

                  {/* Summary and Sort */}
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" color="gray.600">
                      Tổng cộng: {total} người dùng
                    </Text>
                    <HStack spacing={2} wrap="wrap">
                      <Text fontSize="sm" color="gray.600">
                        Sắp xếp theo:
                      </Text>
                      <Select
                        size="sm"
                        value={filters.sort_by}
                        onChange={(e) =>
                          handleFilterChange("sort_by", e.target.value)
                        }
                        w={{ base: "full", sm: "150px" }}
                      >
                        <option value="created_at">Ngày tạo</option>
                        <option value="name">Tên</option>
                        <option value="email">Email</option>
                        <option value="role">Vai trò</option>
                      </Select>
                      <Select
                        size="sm"
                        value={filters.sort_order}
                        onChange={(e) =>
                          handleFilterChange("sort_order", e.target.value)
                        }
                        w={{ base: "full", sm: "100px" }}
                      >
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                      </Select>
                    </HStack>
                  </VStack>
                </VStack>
              </Collapse>
            </VStack>
          </CardBody>
        </Card>

        {/* Users Table - Desktop */}
        <Card display={{ base: "none", lg: "block" }}>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Người dùng</Th>
                    <Th>Email</Th>
                    <Th>Số điện thoại</Th>
                    <Th>Vai trò</Th>
                    <Th>Trạng thái</Th>
                    <Th>Ngày tạo</Th>
                    <Th>Thao tác</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={user.name}
                            src={user.avatar}
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{user.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              ID: {user.id}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{user.email}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{user.phone || "Chưa có"}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(user.is_active)}>
                          {getStatusLabel(user.is_active)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {format(
                            new Date(user.created_at),
                            "dd/MM/yyyy HH:mm",
                            {
                              locale: vi,
                            }
                          )}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            size="sm"
                            icon={<FiEye />}
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            aria-label="Xem chi tiết"
                          />
                          <IconButton
                            size="sm"
                            icon={<FiEdit />}
                            onClick={() =>
                              navigate(`/admin/users/${user.id}/edit`)
                            }
                            aria-label="Chỉnh sửa"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Users Cards - Mobile */}
        <VStack
          spacing={4}
          align="stretch"
          display={{ base: "flex", lg: "none" }}
        >
          {users.map((user) => (
            <Card key={user.id}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <HStack spacing={3}>
                      <Avatar size="md" name={user.name} src={user.avatar} />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {user.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ID: {user.id}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                      <Badge colorScheme={getRoleColor(user.role)} size="sm">
                        {getRoleLabel(user.role)}
                      </Badge>
                      <Badge
                        colorScheme={getStatusColor(user.is_active)}
                        size="sm"
                      >
                        {getStatusLabel(user.is_active)}
                      </Badge>
                    </VStack>
                  </HStack>

                  {/* Contact Info */}
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color="gray.600">
                      Email: {user.email}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      SĐT: {user.phone || "Chưa có"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Tạo lúc:{" "}
                      {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </Text>
                  </VStack>

                  {/* Actions */}
                  <HStack spacing={2} justify="center">
                    <Button
                      size="sm"
                      leftIcon={<FiEye />}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      variant="outline"
                      colorScheme="blue"
                      flex={1}
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiEdit />}
                      onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      variant="outline"
                      colorScheme="teal"
                      flex={1}
                    >
                      Chỉnh sửa
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Pagination */}
        {pages > 1 && (
          <Flex justify="center" mt={6}>
            <HStack spacing={2} wrap="wrap" justify="center">
              <Button
                size="sm"
                onClick={() => handlePageChange(filters.page - 1)}
                isDisabled={filters.page <= 1}
              >
                Trước
              </Button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={filters.page === page ? "solid" : "outline"}
                    onClick={() => handlePageChange(page)}
                    display={{ base: "none", sm: "inline-flex" }}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                size="sm"
                onClick={() => handlePageChange(filters.page + 1)}
                isDisabled={filters.page >= pages}
              >
                Sau
              </Button>
            </HStack>
          </Flex>
        )}

        {/* Empty state */}
        {users.length === 0 && !isLoadingUsers && (
          <Box textAlign="center" py={8}>
            <Text color="gray.500">Không có người dùng nào</Text>
          </Box>
        )}
      </VStack>
    </Page>
  );
};

export default UsersPage;
