import React from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Avatar,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import Page from "../../common/Page";
import { useFetchApi } from "../../../hooks/useFetchApi";

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch user details
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useFetchApi({
    url: `/admin/users/${id}`,
    protected: true,
  });

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
  if (isLoadingUser) {
    return (
      <Page title="Chi tiết người dùng">
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="20px" />
              <Skeleton height="40px" />
              <Skeleton height="100px" />
              <Skeleton height="100px" />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (userError) {
    return (
      <Page title="Chi tiết người dùng">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin người dùng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  if (!user) {
    return (
      <Page title="Chi tiết người dùng">
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Không tìm thấy!</AlertTitle>
          <AlertDescription>
            Người dùng không tồn tại hoặc đã bị xóa.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title={`Người dùng ${user.name}`}
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: () => navigate("/admin/users"),
      }}
      secondaryAction={{
        label: "Chỉnh sửa",
        icon: FiEdit,
        onClick: () => navigate(`/admin/users/${user.id}/edit`),
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* User Info */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={4}>
                  <Avatar size="xl" name={user.name} src={user.avatar} />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      {user.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ID: {user.id}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="end" spacing={2}>
                  <Badge size="lg" colorScheme={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                  <Badge size="lg" colorScheme={getStatusColor(user.is_active)}>
                    {getStatusLabel(user.is_active)}
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Thông tin liên hệ
              </Text>
              <HStack spacing={6} wrap="wrap">
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <FiMail />
                    <Text fontSize="sm" color="gray.600">
                      Email
                    </Text>
                  </HStack>
                  <Text fontWeight="medium">{user.email}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <FiPhone />
                    <Text fontSize="sm" color="gray.600">
                      Số điện thoại
                    </Text>
                  </HStack>
                  <Text fontWeight="medium">{user.phone || "Chưa có"}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <HStack spacing={2}>
                    <FiCalendar />
                    <Text fontSize="sm" color="gray.600">
                      Ngày tạo
                    </Text>
                  </HStack>
                  <Text fontWeight="medium">
                    {format(new Date(user.created_at), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* User Statistics */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Thống kê
              </Text>
              <HStack spacing={6} wrap="wrap">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Tổng đơn hàng
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    {user.total_orders || 0}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Tổng chi tiêu
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="green.600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(user.total_spent || 0)}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Đơn hàng gần nhất
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {user.last_order_date
                      ? format(new Date(user.last_order_date), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "Chưa có"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Orders */}
        {user.recent_orders && user.recent_orders.length > 0 && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Đơn hàng gần đây
                </Text>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Mã đơn hàng</Th>
                        <Th>Trạng thái</Th>
                        <Th>Tổng tiền</Th>
                        <Th>Ngày tạo</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {user.recent_orders.map((order) => (
                        <Tr key={order.id}>
                          <Td>
                            <Text
                              fontWeight="medium"
                              color="blue.600"
                              cursor="pointer"
                              onClick={() =>
                                navigate(`/admin/orders/${order.id}`)
                              }
                            >
                              {order.order_number}
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                order.status === "completed"
                                  ? "green"
                                  : order.status === "cancelled"
                                  ? "red"
                                  : "yellow"
                              }
                              size="sm"
                            >
                              {order.status === "completed"
                                ? "Hoàn thành"
                                : order.status === "cancelled"
                                ? "Đã hủy"
                                : "Đang xử lý"}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="medium">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(order.total_amount)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {format(
                                new Date(order.created_at),
                                "dd/MM/yyyy",
                                {
                                  locale: vi,
                                }
                              )}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Account Information */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Thông tin tài khoản
              </Text>
              <HStack spacing={6} wrap="wrap">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Email xác thực
                  </Text>
                  <Text fontWeight="medium">
                    {user.email_verified ? "Đã xác thực" : "Chưa xác thực"}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Cập nhật lần cuối
                  </Text>
                  <Text fontWeight="medium">
                    {user.updated_at
                      ? format(new Date(user.updated_at), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "Chưa cập nhật"}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Đăng nhập lần cuối
                  </Text>
                  <Text fontWeight="medium">
                    {user.last_login
                      ? format(new Date(user.last_login), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "Chưa đăng nhập"}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default UserDetailPage;
