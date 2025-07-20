import React from "react";
import { Box, Button, HStack, useColorModeValue } from "@chakra-ui/react";
import { FiSave, FiX } from "react-icons/fi";

const ActionBar = ({
  onSave,
  onDiscard,
  isSaving = false,
  isDirty = false,
  saveText = "Lưu",
  discardText = "Hủy",
  showDiscard = true,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      position="fixed"
      bottom={
        isDirty
          ? { base: "90px", md: "20px" }
          : { base: "-120px", md: "-120px" }
      }
      left="50%"
      transform={
        isDirty ? "translateX(-50%)" : "translateX(-50%) translateY(20px)"
      }
      zIndex={1000}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      px={6}
      py={2}
      boxShadow="xl"
      display="flex"
      justifyContent="center"
      minW={{ base: "280px", md: "320px" }}
      maxW="400px"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      opacity={isDirty ? 1 : 0}
      pointerEvents={isDirty ? "auto" : "none"}
    >
      <HStack spacing={4} justify="center" w="full">
        {showDiscard && (
          <Button
            variant="outline"
            onClick={onDiscard}
            isDisabled={isSaving}
            size="sm"
            flex={1}
          >
            {discardText}
          </Button>
        )}
        <Button
          colorScheme="blue"
          onClick={onSave}
          isLoading={isSaving}
          loadingText="Đang lưu..."
          isDisabled={!isDirty}
          size="sm"
          flex={1}
        >
          {saveText}
        </Button>
      </HStack>
    </Box>
  );
};

export default ActionBar;
