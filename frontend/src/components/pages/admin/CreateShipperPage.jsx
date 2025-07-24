import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCreateApi } from "../../../hooks/useCreateApi";
import Page from "../../common/Page";

const CreateShipperPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    is_active: true,
  });

  const { mutate: createShipper, isLoading } = useCreateApi({
    url: "/admin/shippers",
    protected: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Thiếu thông tin",
        description: "Tên và số điện thoại là bắt buộc",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createShipper(formData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã tạo shipper mới",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/admin/shippers");
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tạo shipper",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <Page
      title="Tạo Shipper mới"
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: () => navigate("/admin/shippers"),
      }}
    >
      <Card maxW="md" mx="auto">
        <CardBody>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Tên shipper</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nhập tên shipper"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Số điện thoại</FormLabel>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Nhập email (không bắt buộc)"
              />
            </FormControl>
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Hoạt động</FormLabel>
              <Switch
                isChecked={formData.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
              />
            </FormControl>
            <HStack justify="flex-end" spacing={3}>
              <Button variant="outline" onClick={() => navigate("/admin/shippers")}>Hủy</Button>
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
                Tạo mới
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};

export default CreateShipperPage; 