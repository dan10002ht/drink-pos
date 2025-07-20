import React from "react";
import {
  Box,
  VStack,
  Button,
  useColorModeValue,
  Icon,
  Collapse,
  useDisclosure,
  Text,
  HStack,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_MOBILE_NAV_ITEMS,
} from "../../constants/navigation";
import { isNavItemActive } from "../../utils/navigation";

const Sidebar = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle tab click
  const handleTabClick = (item) => {
    navigate(item.path);
  };

  return (
    <Box
      w="250px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      py={6}
      display={{ base: "none", md: "block" }}
    >
      <VStack spacing={2} align="stretch" px={4}>
        {ADMIN_NAV_ITEMS.map((item, index) => {
          const isActive = isNavItemActive(location.pathname, item.path);
          return (
            <Button
              key={index}
              variant={isActive ? "solid" : "ghost"}
              colorScheme={isActive ? "teal" : "gray"}
              leftIcon={<Icon as={item.icon} />}
              onClick={() => handleTabClick(item)}
              justifyContent="flex-start"
              size="md"
            >
              {item.label}
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
};

// Mobile Navigation Component
export const MobileNavigation = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  // Handle tab click
  const handleTabClick = (item) => {
    if (item.children) {
      onToggle();
    } else {
      navigate(item.path);
    }
  };

  // Handle child item click
  const handleChildClick = (childPath) => {
    navigate(childPath);
    onToggle();
  };

  return (
    <Box
      w="full"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      py={2}
      display={{ base: "block", md: "none" }}
    >
      <VStack spacing={1} align="stretch" px={2}>
        {ADMIN_MOBILE_NAV_ITEMS.map((item, index) => {
          const isActive = isNavItemActive(location.pathname, item.path);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <Box key={index}>
              <Button
                variant={isActive ? "solid" : "ghost"}
                colorScheme={isActive ? "teal" : "gray"}
                leftIcon={<Icon as={item.icon} />}
                onClick={() => handleTabClick(item)}
                justifyContent="flex-start"
                size="sm"
                w="full"
                borderRadius="md"
              >
                <HStack justify="space-between" w="full">
                  <Text>{item.label}</Text>
                  {hasChildren && (
                    <Icon
                      as={isOpen ? "chevron-up" : "chevron-down"}
                      boxSize={4}
                    />
                  )}
                </HStack>
              </Button>

              {hasChildren && (
                <Collapse in={isOpen} animateOpacity>
                  <VStack spacing={1} align="stretch" pl={6} mt={1}>
                    {item.children.map((child, childIndex) => {
                      const isChildActive = isNavItemActive(
                        location.pathname,
                        child.path
                      );
                      return (
                        <Button
                          key={childIndex}
                          variant={isChildActive ? "solid" : "ghost"}
                          colorScheme={isChildActive ? "teal" : "gray"}
                          leftIcon={<Icon as={child.icon} />}
                          onClick={() => handleChildClick(child.path)}
                          justifyContent="flex-start"
                          size="sm"
                          w="full"
                          borderRadius="md"
                        >
                          {child.label}
                        </Button>
                      );
                    })}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Sidebar;
