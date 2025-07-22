import React from "react";
import { Badge } from "@chakra-ui/react";

const NewOrderBadge = ({ count }) => {
  if (!count || count <= 0) return null;
  return (
    <Badge
      colorScheme="red"
      variant="solid"
      fontSize="xs"
      ml={1}
      borderRadius="full"
      position="absolute"
      top="-6px"
      right="-6px"
      zIndex={1}
    >
      {count > 3 ? "3+" : count}
    </Badge>
  );
};

export default NewOrderBadge;
