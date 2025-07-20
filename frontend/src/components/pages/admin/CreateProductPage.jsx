import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

import {
  ProductProvider,
  useProductContext,
} from "../../../contexts/ProductContext";
import ProductMutationContent from "../../organisms/ProductMutationContent";
import { useCreateApi } from "../../../hooks/useCreateApi";
import useSave from "../../../hooks/useSave";

const CreateProductContent = () => {
  const { validateForm, prepareProductData } = useProductContext();

  // Create product mutation
  const createProductMutation = useCreateApi({
    url: "/admin/products",
    protected: true,
  });

  // Save hook
  const { isSaving, isDirty, handleSave, handleDiscard, markAsDirty } = useSave(
    {
      onSave: async () => {
        if (!validateForm()) {
          throw new Error("Vui lòng kiểm tra lại thông tin");
        }

        const productData = prepareProductData();
        await createProductMutation.mutateAsync(productData);
      },
      successMessage: "Sản phẩm đã được tạo thành công",
      errorMessage: "Có lỗi xảy ra khi tạo sản phẩm",
      redirectPath: "/admin/products",
    }
  );

  // Mark as dirty when form changes
  useEffect(() => {
    markAsDirty();
  }, [markAsDirty]);

  return (
    <ProductMutationContent
      // Page props
      title="Tạo sản phẩm mới"
      pageTitle="Tạo sản phẩm mới"
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: handleDiscard,
      }}
      // Save hook
      isSaving={isSaving}
      isDirty={isDirty}
      handleSave={handleSave}
      handleDiscard={handleDiscard}
      // Mode
      mode="create"
    />
  );
};

const CreateProductPage = () => {
  return (
    <ProductProvider mode="create">
      <CreateProductContent />
    </ProductProvider>
  );
};

export default CreateProductPage;
