import React from "react";
import { Alert, AlertIcon, Button, HStack, Text } from "@chakra-ui/react";

const NewOrderBanner = ({ onReload, tabLabel }) => (
  <Alert status="info" borderRadius="md" mb={4} alignItems="center">
    <HStack w="100%" justify="space-between">
      <HStack>
        <AlertIcon />
        <Text>Có đơn hàng mới ở tab {tabLabel}. </Text>
      </HStack>
      <Button size="sm" colorScheme="blue" onClick={onReload}>
        Tải lại
      </Button>
    </HStack>
  </Alert>
);

export default NewOrderBanner;
