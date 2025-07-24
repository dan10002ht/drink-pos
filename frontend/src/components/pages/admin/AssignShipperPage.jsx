import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Switch,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft, FiTruck, FiPackage } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import Page from "../../common/Page";
import { formatCurrency } from "../../../utils/formatters";
import { getStatusLabel, getStatusColor } from "../../../utils/orderHelpers";

const AssignShipperPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [formData, setFormData] = useState({
    shipper_id: "",
    estimated_delivery_time: "",
    delivery_notes: "",
    split_order: false,
  });

  // Fetch order details
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useFetchApi({
    url: `/admin/orders/${id}`,
    protected: true,
  });

  // Fetch available shippers
  const {
    data: shippers,
    isLoading: isLoadingShippers,
  } = useFetchApi({
    url: "/admin/deliveries/shippers",
    protected: true,
  });

  // Assign shipper mutation
  const { mutate: assignShipper, isLoading: isAssigning } = useEditApi({
    url: `/admin/orders/${id}/assign-shipper`,
    protected: true,
  });

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle submit
  const handleSubmit = () => {
    if (!formData.shipper_id) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn shipper",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      shipper_id: formData.shipper_id,
      split_order: formData.split_order,
    };

    if (formData.estimated_delivery_time) {
      payload.estimated_delivery_time = formData.estimated_delivery_time;
    }

    if (formData.delivery_notes) {
      payload.delivery_notes = formData.delivery_notes;
    }

    assignShipper(payload, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: "Đã assign shipper cho đơn hàng",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/admin/orders/${id}`);
      },
      onError: (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể assign shipper",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  // Loading state
  if (isLoadingOrder || isLoadingShippers) {
    return (
      <Page title="Assign Shipper">
        <Card>
          <CardBody>
            <Text>Đang tải...</Text>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (orderError) {
    return (
      <Page title="Assign Shipper">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin đơn hàng. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  if (!order) {
    return (
      <Page title="Assign Shipper">
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Không tìm thấy!</AlertTitle>
          <AlertDescription>
            Đơn hàng không tồn tại hoặc đã bị xóa.
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  return (
    <Page
      title={`Assign Shipper - ${order.order_number}`}
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: () => navigate(`/admin/orders/${id}`),
      }}
    >
      <VStack spacing={6} align="stretch">
        {/* Order Info */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  Thông tin đơn hàng
                </Text>
                <Badge colorScheme={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </HStack>

              <Box>
                <Text fontWeight="medium">Khách hàng:</Text>
                <Text>{order.customer_name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {order.customer_phone}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium">Tổng tiền:</Text>
                <Text fontSize="lg" color="green.600" fontWeight="bold">
                  {formatCurrency(order.total_amount)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium">Sản phẩm:</Text>
                {order.items && order.items.map((item, index) => (
                  <Text key={index} fontSize="sm">
                    {item.quantity}x {item.product_name} - {item.variant_name}
                  </Text>
                ))}
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Assign Shipper Form */}
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <FiTruck />
                <Text fontSize="lg" fontWeight="bold">
                  Assign Shipper
                </Text>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Chọn Shipper</FormLabel>
                <Select
                  placeholder="Chọn shipper"
                  value={formData.shipper_id}
                  onChange={(e) => handleInputChange("shipper_id", e.target.value)}
                >
                  {shippers && shippers.map((shipper) => (
                    <option key={shipper.public_id} value={shipper.public_id}>
                      {shipper.name} - {shipper.phone}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Thời gian giao hàng dự kiến</FormLabel>
                <Select
                  placeholder="Chọn thời gian"
                  value={formData.estimated_delivery_time}
                  onChange={(e) => handleInputChange("estimated_delivery_time", e.target.value)}
                >
                  <option value="30">30 phút</option>
                  <option value="45">45 phút</option>
                  <option value="60">1 giờ</option>
                  <option value="90">1.5 giờ</option>
                  <option value="120">2 giờ</option>
                </Select>
                <FormHelperText>
                  Thời gian dự kiến từ lúc shipper nhận hàng
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Ghi chú giao hàng</FormLabel>
                <Textarea
                  placeholder="Ghi chú cho shipper..."
                  value={formData.delivery_notes}
                  onChange={(e) => handleInputChange("delivery_notes", e.target.value)}
                  rows={3}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="split-order" mb="0">
                  Chia đơn hàng
                </FormLabel>
                <Switch
                  id="split-order"
                  isChecked={formData.split_order}
                  onChange={(e) => handleInputChange("split_order", e.target.checked)}
                />
                <FormHelperText ml={3}>
                  Chia đơn hàng thành nhiều lần giao nếu cần
                </FormHelperText>
              </FormControl>

              <Divider />

              <HStack justify="flex-end" spacing={3}>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/admin/orders/${id}`)}
                >
                  Hủy
                </Button>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiTruck />}
                  onClick={handleSubmit}
                  isLoading={isAssigning}
                  loadingText="Đang assign..."
                >
                  Assign Shipper
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Page>
  );
};

export default AssignShipperPage; 