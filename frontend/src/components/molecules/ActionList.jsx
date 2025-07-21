import React from "react";
import { VStack, HStack, Text, Icon, Button } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

/**
 * ActionList - Hiển thị danh sách action (ví dụ: trạng thái đơn hàng)
 * @param {Array} actions - [{ value, label, color }]
 * @param {string} current - value của action hiện tại
 * @param {function} onAction - callback(value) khi chọn action mới
 */
const ActionList = ({ actions = [], current, onAction }) => {
  return (
    <VStack spacing={1} align="stretch" minW="160px">
      {actions.map((action) => (
        <Button
          key={action.value}
          w="100%"
          size="sm"
          variant="ghost"
          justifyContent="space-between"
          color={
            action.value === current
              ? `${action.color || "teal"}.600`
              : "inherit"
          }
          fontWeight={action.value === current ? "bold" : "normal"}
          onClick={() =>
            action.value !== current && onAction && onAction(action.value)
          }
          leftIcon={null}
        >
          <HStack justify="space-between" w="100%">
            <Text>{action.label}</Text>
            {action.value === current && (
              <Icon as={FiCheck} color="teal.500" boxSize={4} />
            )}
          </HStack>
        </Button>
      ))}
    </VStack>
  );
};

export default ActionList;
