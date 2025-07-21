import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useFetchApi } from "../../../hooks/useFetchApi";
import OrderStatsCards from "../../molecules/OrderStatsCards";
import OrderList from "../../organisms/OrderList";
import Page from "../../common/Page";

const OrderStatusPage = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // State for pagination
  const [orderPages, setOrderPages] = useState({
    pending: 1,
    processing: 1,
    completed: 1,
  });

  // Fetch order statistics
  const { data: statsData } = useFetchApi({
    url: "/admin/orders/statistics",
    protected: true,
  });

  // Calculate stats from API data
  const calculateStats = () => {
    if (!statsData?.data) return [];

    const stats = statsData.data;
    const statusCounts = stats.status_counts || {};

    return [
      {
        label: "Tổng đơn hàng",
        value: stats.total_orders?.toString() || "0",
        change: "+12%",
        changeType: "increase",
      },
      {
        label: "Chờ xử lý",
        value: (statusCounts.pending || 0).toString(),
        change: "+5%",
        changeType: "increase",
      },
      {
        label: "Đang xử lý",
        value: (statusCounts.processing || 0).toString(),
        change: "-2%",
        changeType: "decrease",
      },
      {
        label: "Đã xử lý",
        value: (statusCounts.completed || 0).toString(),
        change: "+8%",
        changeType: "increase",
      },
    ];
  };

  // Handle load more
  const handleLoadMore = (status) => {
    setOrderPages((prev) => ({
      ...prev,
      [status]: prev[status] + 1,
    }));
  };

  // Status configuration
  const statusConfig = [
    {
      key: "pending",
      label: "Chờ xử lý",
      icon: "⏳",
      color: "yellow",
    },
    {
      key: "processing",
      label: "Đang xử lý",
      icon: "🔄",
      color: "blue",
    },
    {
      key: "completed",
      label: "Đã hoàn thành",
      icon: "✅",
      color: "green",
    },
  ];

  return (
    <Page
      title="Trạng thái đơn hàng"
      subtitle="Quản lý và theo dõi tình trạng xử lý đơn hàng"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        {/* <Box>
          <Text color="gray.600">
            Quản lý và theo dõi tình trạng xử lý đơn hàng
          </Text>
        </Box> */}
        {/* Stats Cards */}
        <OrderStatsCards stats={calculateStats()} />
        {/* Tabs */}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody p={0}>
            <Tabs variant="enclosed" colorScheme="blue">
              <TabList px={{ base: 4, md: 6 }} pt={6} overflowX="auto">
                {statusConfig.map((status) => (
                  <Tab key={status.key} fontWeight="semibold" minW="auto">
                    <HStack spacing={2}>
                      <Text fontSize="lg">{status.icon}</Text>
                      <Text display={{ base: "none", sm: "block" }}>
                        {status.label}
                      </Text>
                      <Badge colorScheme={status.color} variant="subtle">
                        {/* TODO: Get count from API */}0
                      </Badge>
                    </HStack>
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {statusConfig.map((status) => (
                  <TabPanel key={status.key} px={{ base: 4, md: 6 }} py={6}>
                    <OrderList
                      status={status.key}
                      page={orderPages[status.key]}
                      onLoadMore={handleLoadMore}
                    />
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default OrderStatusPage;
