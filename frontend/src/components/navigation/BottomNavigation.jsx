import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  Text,
  useColorModeValue,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  Portal,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ADMIN_MOBILE_NAV_ITEMS } from "../../constants/navigation";
import { isNavItemActive } from "../../utils/navigation";

const BottomNavigation = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Handle tab click
  const handleTabClick = (item) => {
    if (item.children) {
      setIsOpen(!isOpen);
    } else {
      navigate(item.path);
    }
  };

  // Handle child item click
  const handleChildClick = (childPath) => {
    navigate(childPath);
    setIsOpen(false);
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      display={{ base: "block", md: "none" }}
      zIndex={1000}
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
    >
      <Flex justify="space-around" align="center">
        {ADMIN_MOBILE_NAV_ITEMS.map((item, index) => {
          const isActive = isNavItemActive(location.pathname, item.path);
          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            return (
              <Popover
                key={index}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                placement="top"
              >
                <PopoverTrigger>
                  <Button
                    variant="ghost"
                    onClick={() => handleTabClick(item)}
                    flexDirection="column"
                    h="auto"
                    py={4}
                    px={3}
                    minW="auto"
                    _focus={{
                      outline: "none",
                    }}
                    _hover={{
                      bg: "none",
                      borderColor: "transparent",
                    }}
                    _active={{
                      bg: "none",
                      borderColor: "transparent",
                    }}
                    flex={1}
                    position="relative"
                  >
                    <Icon
                      as={item.icon}
                      boxSize={6}
                      mb={1}
                      color={isActive ? "teal.500" : "gray.400"}
                    />
                    <Text
                      fontSize="xs"
                      color={isActive ? "teal.600" : "gray.500"}
                      fontWeight={isActive ? "semibold" : "medium"}
                      lineHeight="1"
                    >
                      {item.label}
                    </Text>
                  </Button>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent
                    bg={bgColor}
                    borderColor={borderColor}
                    boxShadow="lg"
                    w="200px"
                    _focus={{
                      outline: "none",
                    }}
                  >
                    <PopoverBody p={0}>
                      <VStack spacing={0} align="stretch">
                        {item.children.map((child, childIndex) => {
                          const isChildActive = isNavItemActive(
                            location.pathname,
                            child.path
                          );
                          return (
                            <Button
                              key={childIndex}
                              variant="ghost"
                              leftIcon={<Icon as={child.icon} />}
                              onClick={() => handleChildClick(child.path)}
                              justifyContent="flex-start"
                              size="sm"
                              w="full"
                              borderRadius={0}
                              colorScheme={isChildActive ? "teal" : "gray"}
                              _hover={{
                                bg: hoverBgColor,
                              }}
                            >
                              {child.label}
                            </Button>
                          );
                        })}
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            );
          }

          return (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleTabClick(item)}
              flexDirection="column"
              h="auto"
              py={4}
              px={{ base: 2, md: 3 }}
              minW="auto"
              _focus={{
                outline: "none",
              }}
              _hover={{
                bg: "none",
                borderColor: "transparent",
              }}
              _active={{
                bg: "none",
                borderColor: "transparent",
              }}
              flex={1}
              position="relative"
            >
              {isActive && (
                <Box
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  w="100%"
                  h="3px"
                  bg="teal.500"
                  borderRadius="full"
                />
              )}

              <Icon
                as={item.icon}
                boxSize={6}
                mb={1}
                color={isActive ? "teal.500" : "gray.400"}
              />
              <Text
                fontSize="xs"
                color={isActive ? "teal.600" : "gray.500"}
                fontWeight={isActive ? "semibold" : "medium"}
                lineHeight="1"
              >
                {item.label}
              </Text>
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
};

export default BottomNavigation;
