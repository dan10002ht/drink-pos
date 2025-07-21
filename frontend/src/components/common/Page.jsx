import React from "react";
import { Box, Flex, Heading, Button, Icon } from "@chakra-ui/react";

const Page = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  backAction,
  actions, // NEW: custom actions node
  children,
  fullWidth,
  hasActionBar,
  isDirty = false,
  ...props
}) => {
  const fullWidthProps = fullWidth
    ? { w: "100%" }
    : { w: "100%", maxW: "1280px", m: "auto" };

  const actionBarPadding =
    hasActionBar && isDirty ? { pb: { base: "100px", md: "60px" } } : {};

  return (
    <Box {...props} {...fullWidthProps} {...actionBarPadding}>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={1}>
          {backAction && (
            <Button
              variant="ghost"
              colorScheme="gray"
              iconSpacing={0}
              leftIcon={backAction.icon && <Icon as={backAction.icon} />}
              onClick={backAction.onClick}
              size={{ base: "sm", md: "md" }}
              paddingInline="0 !important"
              marginInline="0 !important"
              {...backAction.props}
            >
              {!backAction.icon && backAction.label}
            </Button>
          )}
          <Box>
            <Heading size={{ base: "sm", md: "md" }}>{title}</Heading>
            {subtitle && (
              <Box mt={1} color="gray.500" fontSize="sm">
                {subtitle}
              </Box>
            )}
          </Box>
        </Flex>
        {/* Custom actions node if provided, else fallback to old actions */}
        <Flex direction={"row"} align={"center"} gap={2}>
          {/* Custom actions node nếu có */}
          {actions && <Box>{actions}</Box>}
          {/* Secondary action luôn đứng trước primary */}
          {secondaryAction && (
            <Button
              variant="outline"
              colorScheme="blue"
              size={{ base: "xs", md: "md" }}
              leftIcon={
                secondaryAction.icon && <Icon as={secondaryAction.icon} />
              }
              onClick={secondaryAction.onClick}
              {...secondaryAction.props}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              colorScheme="teal"
              size={{ base: "xs", md: "md" }}
              leftIcon={primaryAction.icon && <Icon as={primaryAction.icon} />}
              onClick={primaryAction.onClick}
              {...primaryAction.props}
            >
              {primaryAction.label}
            </Button>
          )}
        </Flex>
      </Flex>
      {children}
    </Box>
  );
};

export default Page;
