import React from "react";
import { Button } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";

const ScrollToTopButton = ({ onClick, show }) => {
  if (!show) return null;
  return (
    <Button
      position="fixed"
      bottom="80px"
      right="40px"
      colorScheme="blue"
      onClick={onClick}
      zIndex={10}
      leftIcon={<ArrowUpIcon />}
      shadow="md"
      borderRadius="full"
      size="md"
    >
      Lên đầu trang
    </Button>
  );
};

export default ScrollToTopButton;
