import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Button,
  Icon,
} from "@chakra-ui/react";
import { FiTruck, FiUsers, FiCoffee } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MorePage = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const navigate = useNavigate();

  const moreOptions = [
    {
      title: "Nguyên liệu",
      description: "Quản lý nguyên liệu và thành phần",
      icon: FiCoffee,
      path: "/admin/ingredients",
      color: "orange",
    },
    {
      title: "Shipper",
      description: "Quản lý shipper và phân công giao hàng",
      icon: FiTruck,
      path: "/admin/shippers",
      color: "green",
    },
    {
      title: "Người dùng",
      description: "Quản lý tài khoản người dùng",
      icon: FiUsers,
      path: "/admin/users",
      color: "purple",
    },
  ];

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Xem thêm
      </Heading>

      <Text color="gray.500" mb={6}>
        Các tùy chọn bổ sung và công cụ quản lý
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {moreOptions.map((option, index) => (
          <Card
            key={index}
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            cursor="pointer"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            transition="all 0.2s"
            onClick={() => handleOptionClick(option.path)}
          >
            <CardBody>
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="lg"
                    bg={`${option.color}.100`}
                    color={`${option.color}.600`}
                  >
                    <Icon as={option.icon} boxSize={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold" fontSize="lg">
                      {option.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {option.description}
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  colorScheme={option.color}
                  variant="outline"
                  w="full"
                >
                  Truy cập
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MorePage;
