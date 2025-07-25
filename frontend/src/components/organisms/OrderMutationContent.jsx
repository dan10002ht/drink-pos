import React from "react";
import {
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  HStack,
  Text,
  Spinner,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

import Page from "../common/Page";
import ActionBar from "../molecules/ActionBar";
import { useOrderContext } from "../../contexts/OrderContext";
import OrderCustomerInfo from "./OrderCustomerInfo";
import OrderItems from "./OrderItems";
import OrderDiscount from "./OrderDiscount";
import OrderShipping from "./OrderShipping";
import OrderNotes from "./OrderNotes";
import OrderSummary from "./OrderSummary";
import OrderInfo from "./OrderInfo";
import { useFetchApi } from "../../hooks/useFetchApi";
import { FormControl, FormLabel } from "@chakra-ui/react";

const OrderMutationContent = ({
  // Page props
  title,
  pageTitle,
  backAction,

  // Data
  products = [],
  paymentMethods = [],
  order = null,

  // Loading states
  isLoadingProducts = false,
  isLoadingOrder = false,

  // Error states
  productsError = null,
  orderError = null,

  // Save hook
  isSaving = false,
  isDirty = false,
  handleSave = () => {},
  handleDiscard = () => {},

  // Mode
  mode = "create",
}) => {
  const { calculateTotals, formData, setFormData } = useOrderContext();
  const { subtotal, itemsWithInfo } = calculateTotals(products);

  // Fetch order statuses (chỉ dùng cho edit)
  const { data: statusesData, isLoading: isLoadingStatuses } = useFetchApi({
    url: "/admin/orders/statuses",
    protected: true,
  });
  const statuses = statusesData || [];

  // Fetch shippers
  const { data: shippers, isLoading: isLoadingShippers } = useFetchApi({
    url: "/admin/shippers/active",
    protected: true,
  });

  // Handler đổi trạng thái
  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.value }));
  };

  // Handler chọn shipper
  const handleShipperChange = (e) => {
    setFormData((prev) => ({ ...prev, shipper_id: e.target.value }));
  };

  // Loading state
  if (isLoadingProducts || isLoadingOrder) {
    return (
      <Page title={pageTitle}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="20px" />
          <Skeleton height="40px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </VStack>
      </Page>
    );
  }

  // Error state
  if (productsError || orderError) {
    return (
      <Page title={pageTitle}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            {mode === "create"
              ? "Không thể tải danh sách sản phẩm. Vui lòng thử lại."
              : "Không thể tải thông tin đơn hàng hoặc sản phẩm. Vui lòng thử lại."}
          </AlertDescription>
        </Alert>
      </Page>
    );
  }

  // Order not found (only for edit mode)
  if (mode === "edit" && !order) {
    return (
      <Page title={pageTitle}>
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
    <>
      <Page
        title={title}
        hasActionBar
        isDirty={isDirty}
        backAction={backAction}
      >
        <VStack spacing={6} align="stretch">
          {/* Trạng thái & Shipper */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Trạng thái đơn hàng</FormLabel>
                  {isLoadingStatuses ? (
                    <Spinner size="sm" />
                  ) : (
                    <Select
                      value={
                        formData.status ||
                        (mode === "create" ? "pending" : order?.status) ||
                        ""
                      }
                      onChange={handleStatusChange}
                      size="md"
                    >
                      {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label || s.value}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormControl>
                <FormControl>
                  <FormLabel>Shipper</FormLabel>
                  {isLoadingShippers ? (
                    <Spinner size="sm" />
                  ) : (
                    <Select
                      placeholder="Chọn shipper (không bắt buộc)"
                      value={formData.shipper_id || ""}
                      onChange={handleShipperChange}
                      size="md"
                    >
                      <option value="">-- Không gán shipper --</option>
                      {shippers &&
                        shippers.length > 0 &&
                        shippers.map((shipper) => (
                          <option key={shipper.id} value={shipper.id}>
                            {shipper.name} - {shipper.phone}
                          </option>
                        ))}
                    </Select>
                  )}
                </FormControl>
              </VStack>
            </CardBody>
          </Card>
          {/* Order Info - chỉ hiển thị trong edit mode */}
          <OrderInfo order={order} />
          {/* Common components */}
          <OrderCustomerInfo paymentMethods={paymentMethods} />
          <OrderItems products={products} />
          <OrderDiscount subtotal={subtotal} />
          <OrderShipping />
          <OrderNotes />
          <OrderSummary itemsWithInfo={itemsWithInfo} subtotal={subtotal} />
        </VStack>
      </Page>

      <ActionBar
        isDirty={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />
    </>
  );
};

export default OrderMutationContent;
