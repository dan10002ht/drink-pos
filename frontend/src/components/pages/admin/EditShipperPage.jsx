import React, { useEffect, useState } from "react";
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
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import Page from "../../common/Page";

const EditShipperPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    is_active: true,
  });

  // Fetch shipper data
  const {
    data: shipper,
    isLoading,
    error,
  } = useFetchApi({
    url: `/admin/shippers/${id}`,
    protected: true,
  });

  // Update API mutation
  const { mutate: updateShipper, isLoading: isSaving } = useEditApi({
    url: `/admin/shippers/${id}`,
    protected: true,
  });

  useEffect(() => {
    if (shipper && shipper.shipper) {
      setFormData({
        name: shipper.shipper.name || "",
        phone: shipper.shipper.phone || "",
        email: shipper.shipper.email || "",
        is_active: shipper.shipper.is_active,
      });
    }
  }, [shipper]);

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
    updateShipper(formData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã cập nhật shipper",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/admin/shippers");
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể cập nhật shipper",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Page title="Chỉnh sửa Shipper">
        <Card maxW="md" mx="auto">
          <CardBody>
            <Skeleton height="40px" mb={4} />
            <Skeleton height="40px" mb={4} />
            <Skeleton height="40px" mb={4} />
            <Skeleton height="40px" mb={4} />
            <Skeleton height="40px" />
          </CardBody>
        </Card>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Chỉnh sửa Shipper">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin shipper. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title="Chỉnh sửa Shipper"
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
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={isSaving}>
                Lưu
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};

export default EditShipperPage; 