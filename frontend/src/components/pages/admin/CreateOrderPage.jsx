import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

import { OrderProvider, useOrderContext } from "../../../contexts/OrderContext";
import OrderMutationContent from "../../organisms/OrderMutationContent";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useCreateApi } from "../../../hooks/useCreateApi";
import useSave from "../../../hooks/useSave";

const CreateOrderContent = () => {
  const { formData, validateForm } = useOrderContext();

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

  // Create order mutation
  const { mutate: createOrder } = useCreateApi({
    url: "/admin/orders",
    protected: true,
  });

  // Save hook
  const { isSaving, handleSave, handleDiscard, markAsDirty } = useSave({
    onSave: async () => {
      if (!validateForm()) {
        throw new Error("Vui lòng kiểm tra lại thông tin");
      }

      try {
        await createOrder(formData);
        return true;
      } catch {
        return false;
      }
    },
    successMessage: "Đơn hàng đã được tạo thành công",
    errorMessage: "Có lỗi xảy ra khi tạo đơn hàng",
    redirectPath: "/admin/orders",
  });

  // Mark as dirty when form changes
  useEffect(() => {
    markAsDirty();
  }, [markAsDirty]);

  const products = productsData?.products || [];
  const paymentMethods = paymentMethodsData || [];

  return (
    <OrderMutationContent
      // Page props
      title="Tạo đơn hàng mới"
      pageTitle="Tạo đơn hàng mới"
      backAction={{
        label: "Quay lại",
        icon: FiX,
        onClick: handleDiscard,
      }}
      // Data
      products={products}
      paymentMethods={paymentMethods}
      // Loading states
      isLoadingProducts={isLoadingProducts}
      // Error states
      productsError={productsError}
      // Save hook
      isSaving={isSaving}
      isDirty={true}
      handleSave={handleSave}
      handleDiscard={handleDiscard}
      // Mode
      mode="create"
    />
  );
};

const CreateOrderPage = () => {
  return (
    <OrderProvider mode="create">
      <CreateOrderContent />
    </OrderProvider>
  );
};

export default CreateOrderPage;
