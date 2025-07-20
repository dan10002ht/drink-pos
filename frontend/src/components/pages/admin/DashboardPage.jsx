import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  Flex,
  Text,
  Badge,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { FiTrendingUp, FiShoppingCart, FiDollarSign } from "react-icons/fi";
import Page from "../../common/Page";

const DashboardPage = () => {
  // Mock data - sau này sẽ fetch từ API
  const stats = {
    totalProducts: 24,
    totalUsers: 156,
    totalSales: 12500000,
    totalOrders: 89,
  };

  const recentProducts = [
    { id: 1, name: "Cà phê đen", price: "25,000", status: "active" },
    { id: 2, name: "Cà phê sữa", price: "30,000", status: "active" },
    { id: 3, name: "Trà sữa", price: "35,000", status: "inactive" },
  ];

  const recentUsers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      role: "user",
    },
    { id: 2, name: "Trần Thị B", email: "tranthib@email.com", role: "admin" },
    { id: 3, name: "Lê Văn C", email: "levanc@email.com", role: "user" },
  ];

  return (
    <Page title="Dashboard">
      {/* Stats Grid */}
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        mb={8}
      >
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Tổng sản phẩm</StatLabel>
                <StatNumber color="teal.500">{stats.totalProducts}</StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} color="green.500" mr={1} />
                  +12% so với tháng trước
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Tổng người dùng</StatLabel>
                <StatNumber color="blue.500">{stats.totalUsers}</StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} color="green.500" mr={1} />
                  +8% so với tháng trước
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Doanh thu</StatLabel>
                <StatNumber color="green.500">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(stats.totalSales)}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiDollarSign} color="green.500" mr={1} />
                  +15% so với tháng trước
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Đơn hàng</StatLabel>
                <StatNumber color="purple.500">{stats.totalOrders}</StatNumber>
                <StatHelpText>
                  <Icon as={FiShoppingCart} color="green.500" mr={1} />
                  +5% so với tháng trước
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Recent Data */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Sản phẩm gần đây
              </Heading>
              <VStack spacing={3} align="stretch">
                {recentProducts.map((product) => (
                  <Flex
                    key={product.id}
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <Box>
                      <Text fontWeight="medium">{product.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {product.price} VNĐ
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={
                        product.status === "active" ? "green" : "red"
                      }
                    >
                      {product.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Badge>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Người dùng gần đây
              </Heading>
              <VStack spacing={3} align="stretch">
                {recentUsers.map((user) => (
                  <Flex
                    key={user.id}
                    justify="space-between"
                    align="center"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <Box>
                      <Text fontWeight="medium">{user.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {user.email}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={user.role === "admin" ? "purple" : "blue"}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </Flex>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Page>
  );
};

export default DashboardPage;
