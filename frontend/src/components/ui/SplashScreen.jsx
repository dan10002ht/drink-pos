import { Box, Spinner, Text } from "@chakra-ui/react";

const SplashScreen = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    height="100vh"
    width="100vw"
    bg="white"
  >
    <Spinner size="xl" color="teal.500" thickness="4px" speed="0.7s" />
    <Text mt={4} fontSize="xl" color="teal.700">
      Đang xác thực tài khoản...
    </Text>
  </Box>
);

export default SplashScreen;
