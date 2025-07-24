import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";

import { OrderProvider, useOrderContext } from "../../../contexts/OrderContext";
import OrderMutationContent from "../../organisms/OrderMutationContent";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import useSave from "../../../hooks/useSave";

const EditOrderContent = () => {
  const { id } = useParams();
  const { formData, setFormData, validateForm } = useOrderContext();

  // Fetch order details
  const {
    data: orderData,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useFetchApi({
    url: `/admin/orders/${id}`,
    protected: true,
  });

  // Fetch products with variants
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useFetchApi({
    url: "/admin/products",
    protected: true,
  });

  // Fetch payment methods
  const { data: paymentMethodsData } = useFetchApi({
    url: "/admin/orders/payment-methods",
    protected: true,
  });

  // Update order mutation
  const { mutate: updateOrder } = useEditApi({
    url: `/admin/orders/${id}`,
    protected: true,
  });

  // Save hook
  const {
    isSaving,
    isDirty,
    handleSave,
    handleDiscard,
    markAsDirty,
    markAsClean,
    setInitialData,
    checkDirty,
  } = useSave({
    onSave: async () => {
      if (!validateForm()) {
        throw new Error("Vui lòng kiểm tra lại thông tin");
      }

      try {
        await updateOrder({
          ...formData,
          items: formData.items.map((item) => ({
            ...item,
            unit_price: item.unit_price || 0,
            total_price: item.unit_price * item.quantity || 0,
          })),
        });
        return true;
      } catch {
        return false;
      }
    },
    successMessage: "Đơn hàng đã được cập nhật thành công",
    errorMessage: "Có lỗi xảy ra khi cập nhật đơn hàng",
    redirectPath: "/admin/orders",
  });

  // Load order data when fetched
  useEffect(() => {
    if (orderData) {
      setFormData(orderData);
      setInitialData(orderData);
    }
  }, [orderData, setFormData, setInitialData]);

  // Check dirty state when form changes
  useEffect(() => {
    if (orderData) {
      const isDirtyState = checkDirty(formData);
      if (isDirtyState !== isDirty) {
        if (isDirtyState) {
          markAsDirty();
        } else {
          markAsClean();
        }
      }
    }
  }, [formData, orderData, checkDirty, isDirty, markAsDirty, markAsClean]);

  const products = productsData?.products || [];
  const paymentMethods = paymentMethodsData || [];

  return (
    <OrderMutationContent
      // Page props
      title={`Chỉnh sửa đơn hàng ${orderData?.order_number || ""}`}
      pageTitle="Chỉnh sửa đơn hàng"
      backAction={{
        label: "Quay lại",
        icon: FiX,
        onClick: handleDiscard,
      }}
      // Data
      products={products}
      paymentMethods={paymentMethods}
      order={orderData}
      // Loading states
      isLoadingProducts={isLoadingProducts}
      isLoadingOrder={isLoadingOrder}
      // Error states
      productsError={productsError}
      orderError={orderError}
      // Save hook
      isSaving={isSaving}
      isDirty={isDirty}
      handleSave={handleSave}
      handleDiscard={handleDiscard}
      // Mode
      mode="edit"
    />
  );
};

const EditOrderPage = () => {
  return (
    <OrderProvider mode="edit">
      <EditOrderContent />
    </OrderProvider>
  );
};

export default EditOrderPage;
