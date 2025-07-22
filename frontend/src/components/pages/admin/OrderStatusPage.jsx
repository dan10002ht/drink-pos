import React, { useState, useEffect } from "react";
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
import NewOrderBadge from "../../atoms/NewOrderBadge";
import NewOrderBanner from "../../molecules/NewOrderBanner";
import { useRef } from "react";
import { statusConfig } from "../../../config/orderStatusConfig";
import { calculateStats } from "../../../utils/orderStatusUtils";

const OrderStatusPage = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // State for pagination
  const [orderPages, setOrderPages] = useState({
    pending: 1,
    processing: 1,
    completed: 1,
  });

  const [newOrderTabs, setNewOrderTabs] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
  });
  const [activeTab, setActiveTab] = useState("pending");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerTab, setBannerTab] = useState("");
  const [prependOrder, setPrependOrder] = useState({
    pending: null,
    processing: null,
    completed: null,
  });
  const [refetchList, setRefetchList] = useState({
    pending: false,
    processing: false,
    completed: false,
  });

  const activeTabRef = useRef(activeTab);
  const orderPagesRef = useRef(orderPages);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  useEffect(() => {
    orderPagesRef.current = orderPages;
  }, [orderPages]);

  // Fetch order statistics
  const { data: statsData, refetch: refetchStats } = useFetchApi({
    url: "/admin/orders/statistics",
    protected: true,
  });

  // Handle load more
  const handleLoadMore = (status) => {
    setOrderPages((prev) => ({
      ...prev,
      [status]: prev[status] + 1,
    }));
  };

  // WebSocket realtime logic
  useEffect(() => {
    const ws = new window.WebSocket(
      `${import.meta.env.VITE_WS_URL || "ws://localhost:8080"}/ws?role=admin`
    );
    ws.onopen = () => {
      console.log("[WebSocket] Opened");
    };
    ws.onclose = (e) => {
      console.log("[WebSocket] Closed", e);
    };
    ws.onerror = (e) => {
      console.log("[WebSocket] Error", e);
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "order_update") {
          refetchStats && refetchStats();
          const order = data.payload;
          const currentTab = activeTabRef.current;
          const currentPages = orderPagesRef.current;
          if (order.status === currentTab) {
            if (currentPages[currentTab] === 1) {
              setPrependOrder((prev) => ({ ...prev, [order.status]: order }));
            } else {
              setNewOrderTabs((prev) => ({
                ...prev,
                [order.status]: (prev[order.status] || 0) + 1,
              }));
              setBannerTab(order.status);
              setShowBanner(true);
            }
          } else {
            setNewOrderTabs((prev) => ({
              ...prev,
              [order.status]: (prev[order.status] || 0) + 1,
            }));
          }
        }
      } catch (e) {
        console.error("[WebSocket] Message parse error", e);
      }
    };
    return () => ws.close();
  }, []);

  console.log({ prependOrder });

  // Khi user chuyển tab
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPrependOrder((prev) => ({ ...prev, [tabKey]: null }));
    if (newOrderTabs[tabKey] > 0) {
      setRefetchList((prev) => ({ ...prev, [tabKey]: true }));
      setNewOrderTabs((prev) => ({ ...prev, [tabKey]: 0 }));
    }
    setShowBanner(false);
  };

  return (
    <Page
      title="Trạng thái đơn hàng"
      subtitle="Quản lý và theo dõi tình trạng xử lý đơn hàng"
    >
      <VStack spacing={6} align="stretch">
        <OrderStatsCards stats={calculateStats(statsData)} />
        {showBanner && (
          <NewOrderBanner
            onReload={() => {
              setRefetchList((prev) => ({ ...prev, [bannerTab]: true }));
              setNewOrderTabs((prev) => ({ ...prev, [bannerTab]: 0 }));
              setShowBanner(false);
            }}
            tabLabel={
              statusConfig.find((s) => s.key === bannerTab)?.label || bannerTab
            }
          />
        )}
        <Card bg={bgColor} border="1px" borderColor={borderColor}>
          <CardBody p={0}>
            <Tabs
              variant="enclosed"
              colorScheme="blue"
              onChange={(idx) => handleTabChange(statusConfig[idx].key)}
            >
              <TabList
                px={{ base: 4, md: 6 }}
                pt={6}
                overflowX="auto"
                overflowY="hidden"
              >
                {statusConfig.map((status) => (
                  <Tab
                    outline="none"
                    borderRadius={0}
                    key={status.key}
                    fontWeight="semibold"
                    minW="auto"
                    position="relative"
                  >
                    <HStack spacing={2}>
                      <Text fontSize="lg">{status.icon}</Text>
                      <Text display={{ base: "none", sm: "block" }}>
                        {status.label}
                      </Text>
                      <Badge
                        colorScheme={status.color}
                        variant="subtle"
                        position="relative"
                      >
                        {statsData?.status_counts?.[status.key] ?? 0}
                        <NewOrderBadge count={newOrderTabs[status.key]} />
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
                      prependOrder={prependOrder[status.key]}
                      refetchList={refetchList[status.key]}
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
