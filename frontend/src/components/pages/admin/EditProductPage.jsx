import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";

import {
  ProductProvider,
  useProductContext,
} from "../../../contexts/ProductContext";
import ProductMutationContent from "../../organisms/ProductMutationContent";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import useSave from "../../../hooks/useSave";

const EditProductContent = () => {
  const { productId } = useParams();
  const { formData, setFormData, validateForm, prepareProductData } =
    useProductContext();

  // Fetch product data
  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useFetchApi({
    queryKey: "product",
    url: `/admin/products/${productId}`,
    protected: true,
  });

  // Update API mutation
  const updateProductMutation = useEditApi({
    url: `/admin/products/${productId}`,
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

      const productData = prepareProductData();
      await updateProductMutation.mutateAsync(productData);
    },
    successMessage: "Sản phẩm đã được cập nhật thành công",
    errorMessage: "Có lỗi xảy ra khi cập nhật sản phẩm",
    redirectPath: "/admin/products",
  });

  // Load product data when fetched
  useEffect(() => {
    if (product) {
      const productData = {
        name: product.name,
        description: product.description || "",
        private_note: product.private_note || "",
        variants:
          product.variants?.length > 0
            ? product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price.toString(),
                description: v.description || "",
                private_note: v.private_note || "",
                ingredients:
                  v.ingredients?.map((ing) => ({
                    ingredient_id: ing.ingredient.id,
                    quantity: ing.quantity,
                  })) || [],
              }))
            : [
                {
                  name: "",
                  price: "",
                  description: "",
                  private_note: "",
                  ingredients: [],
                },
              ],
      };
      setFormData(productData);
      setInitialData(productData);
    }
  }, [product, setFormData, setInitialData]);

  // Check dirty state when form changes
  useEffect(() => {
    if (product) {
      const isDirtyState = checkDirty(formData);
      if (isDirtyState !== isDirty) {
        if (isDirtyState) {
          markAsDirty();
        } else {
          markAsClean();
        }
      }
    }
  }, [formData, product, checkDirty, isDirty, markAsDirty, markAsClean]);

  return (
    <ProductMutationContent
      // Page props
      title="Chỉnh sửa sản phẩm"
      pageTitle="Chỉnh sửa sản phẩm"
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: handleDiscard,
      }}
      // Loading states
      isLoadingProduct={isLoadingProduct}
      // Error states
      productError={productError}
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

const EditProductPage = () => {
  return (
    <ProductProvider mode="edit">
      <EditProductContent />
    </ProductProvider>
  );
};

export default EditProductPage;
