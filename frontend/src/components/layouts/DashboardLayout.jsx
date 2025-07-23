import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { logout } from "../../utils/auth";
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import BottomNavigation from "../navigation/BottomNavigation";

const DashboardLayout = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleLogout = () => {
    logout();
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        px={6}
        py={4}
      >
        <Flex justify="space-between" align="center">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
          >
            🍽️ 3 O'CLOCK Admin
          </Text>
          <Button
            leftIcon={<Icon as={FiLogOut} />}
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
            size={{ base: "sm", md: "md" }}
          >
            Đăng xuất
          </Button>
        </Flex>
      </Box>

      <Box display="flex" flex="1" minH="0">
        {/* Sidebar */}
        <Sidebar />
        {/* Main content scrollable */}
        <Box
          flex="1"
          p={6}
          overflowY="auto"
          pb={{ base: "80px", md: "6" }}
          w="100%"
          minH="0"
          maxH={{ base: "calc(100vh - 80px)", md: "100vh" }}
        >
          <Outlet />
        </Box>
      </Box>

      <BottomNavigation />
    </Box>
  );
};

export default DashboardLayout;
