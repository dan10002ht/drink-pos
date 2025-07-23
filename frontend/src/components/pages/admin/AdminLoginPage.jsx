import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  FormErrorMessage,
  Text,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateApi } from "../../../hooks/useCreateApi";
import { useInput } from "../../../hooks/useInput";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { setToken } from "../../../utils/auth";
import { useDispatch } from "react-redux";
import { setAuth } from "../../../store/authSlice";

export default function AdminLoginPage() {
  const { value, handleChangeInput } = useInput({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Lấy return URL từ state hoặc default về dashboard
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const validate = () => {
    const errs = {};
    if (!value.username) errs.username = "Vui lòng nhập username";
    if (!value.password) errs.password = "Vui lòng nhập password";
    return errs;
  };

  const loginMutation = useCreateApi({
    url: "/admin/login",
    protected: false,
    onSuccess: (data) => {
      toast({
        title: "Đăng nhập thành công",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
      // Lưu token và redirect
      const token = data.data?.token || data.token;
      setToken(token);
      dispatch(setAuth({ user: data.data?.user || {}, token }));
      navigate(from, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Sai thông tin đăng nhập",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    loginMutation.mutate({
      username: value.username,
      password: value.password,
    });
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header */}
      <Box
        bg="white"
        shadow="sm"
        py={{ base: 3, sm: 4 }}
        px={{ base: 3, sm: 4 }}
      >
        <Flex align="center" justify="center">
          <Heading
            size={{ base: "sm", sm: "md" }}
            color="gray.700"
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
          >
            🍽️ 3 O'CLOCK Admin
          </Heading>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={{ base: 4, sm: 6, md: 8 }}
        px={{ base: 2, sm: 4 }}
      >
        <Box
          bg="white"
          rounded={{ base: "none", sm: "xl" }}
          shadow="lg"
          p={{ base: 4, sm: 6, md: 8 }}
          w="full"
          maxW={{ base: "100%", sm: "sm" }}
          mx="auto"
        >
          {/* Login Header */}
          <VStack spacing={{ base: 4, sm: 6 }} mb={{ base: 6, sm: 8 }}>
            <Box textAlign="center">
              <Heading
                size="lg"
                color="gray.800"
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                mb={{ base: 1, sm: 2 }}
                lineHeight="shorter"
              >
                Đăng nhập
              </Heading>
              <Text
                color="gray.600"
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                lineHeight="tall"
              >
                Vui lòng đăng nhập để tiếp tục
              </Text>
            </Box>
          </VStack>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={{ base: 4, sm: 5 }} align="stretch">
              {/* Username Field */}
              <FormControl isRequired isInvalid={!!errors.username}>
                <FormLabel
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  color="gray.700"
                  mb={{ base: 1, sm: 2 }}
                  fontWeight="medium"
                >
                  Tên đăng nhập
                </FormLabel>
                <Input
                  value={value.username}
                  onChange={(e) =>
                    handleChangeInput("username", e.target.value)
                  }
                  placeholder="Nhập tên đăng nhập"
                  size={{ base: "md", sm: "md", md: "lg" }}
                  fontSize={{ base: "sm", sm: "sm", md: "md" }}
                  bg="gray.50"
                  border="1px"
                  borderColor="gray.200"
                  h={{ base: "40px", sm: "44px", md: "48px" }}
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                  }}
                  _hover={{
                    borderColor: "gray.300",
                  }}
                />
                <FormErrorMessage fontSize={{ base: "xs", sm: "sm" }}>
                  {errors.username}
                </FormErrorMessage>
              </FormControl>

              {/* Password Field */}
              <FormControl isRequired isInvalid={!!errors.password}>
                <FormLabel
                  fontSize={{ base: "xs", sm: "sm", md: "md" }}
                  color="gray.700"
                  mb={{ base: 1, sm: 2 }}
                  fontWeight="medium"
                >
                  Mật khẩu
                </FormLabel>
                <InputGroup size={{ base: "md", sm: "md", md: "lg" }}>
                  <Input
                    value={value.password}
                    onChange={(e) =>
                      handleChangeInput("password", e.target.value)
                    }
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    fontSize={{ base: "sm", sm: "sm", md: "md" }}
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.200"
                    h={{ base: "40px", sm: "44px", md: "48px" }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                    }}
                    _hover={{
                      borderColor: "gray.300",
                    }}
                  />
                  <InputRightElement
                    h={{ base: "40px", sm: "44px", md: "48px" }}
                  >
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size={{ base: "sm", sm: "md" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      color="gray.500"
                      _hover={{ color: "gray.700" }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage fontSize={{ base: "xs", sm: "sm" }}>
                  {errors.password}
                </FormErrorMessage>
              </FormControl>

              {/* Login Button */}
              <Button
                type="submit"
                colorScheme="teal"
                size={{ base: "md", sm: "md", md: "lg" }}
                fontSize={{ base: "sm", sm: "md", md: "lg" }}
                py={{ base: 5, sm: 6, md: 7 }}
                h={{ base: "44px", sm: "48px", md: "52px" }}
                mt={{ base: 2, sm: 4 }}
                isLoading={loginMutation.isLoading}
                loadingText="Đang đăng nhập..."
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "lg",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
                Đăng nhập
              </Button>
            </VStack>
          </form>

          {/* Footer */}
          <Box mt={{ base: 6, sm: 8 }} textAlign="center">
            <Text fontSize={{ base: "2xs", sm: "xs" }} color="gray.500">
              © 2024 3 O'CLOCK System. All rights reserved.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
