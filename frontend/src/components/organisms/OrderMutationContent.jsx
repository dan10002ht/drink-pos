import React from "react";
import {
  VStack,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

import Page from "../common/Page";
import ActionBar from "../molecules/ActionBar";
import { useOrderContext } from "../../contexts/OrderContext";
import OrderCustomerInfo from "./OrderCustomerInfo";
import OrderItems from "./OrderItems";
import OrderDiscount from "./OrderDiscount";
import OrderNotes from "./OrderNotes";
import OrderSummary from "./OrderSummary";
import OrderInfo from "./OrderInfo";

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
  const { calculateTotals } = useOrderContext();
  const { subtotal, itemsWithInfo } = calculateTotals(products);

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
          {/* Order Info - chỉ hiển thị trong edit mode */}
          {mode === "edit" && order && <OrderInfo order={order} />}

          {/* Common components */}
          <OrderCustomerInfo paymentMethods={paymentMethods} />
          <OrderItems products={products} />
          <OrderDiscount subtotal={subtotal} />
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
