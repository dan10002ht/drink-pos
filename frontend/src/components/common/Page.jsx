import React from "react";
import { Box, Flex, Heading, Button, Icon } from "@chakra-ui/react";

const Page = ({
  title,
  primaryAction,
  secondaryAction,
  backAction,
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
              leftIcon={backAction.icon && <Icon as={backAction.icon} />}
              onClick={backAction.onClick}
              size={{ base: "sm", md: "md" }}
              paddingInline="0 !important"
              {...backAction.props}
            >
              {!backAction.icon && backAction.label}
            </Button>
          )}
          <Heading size="md">{title}</Heading>
        </Flex>

        <Flex gap={2}>
          {secondaryAction && (
            <Button
              variant="outline"
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
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
              size={{ base: "sm", md: "md" }}
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
