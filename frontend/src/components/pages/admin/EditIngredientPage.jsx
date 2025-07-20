import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";

import {
  IngredientProvider,
  useIngredientContext,
} from "../../../contexts/IngredientContext";
import IngredientMutationContent from "../../organisms/IngredientMutationContent";
import { useFetchApi } from "../../../hooks/useFetchApi";
import { useEditApi } from "../../../hooks/useEditApi";
import useSave from "../../../hooks/useSave";

const EditIngredientContent = () => {
  const { publicId } = useParams();
  const { setFormData, validateForm, prepareIngredientData } =
    useIngredientContext();

  // Fetch ingredient data
  const {
    data: ingredient,
    isLoading: isLoadingIngredient,
    error: ingredientError,
  } = useFetchApi({
    url: `/admin/ingredients/${publicId}`,
    protected: true,
  });

  // Update API mutation
  const updateIngredientMutation = useEditApi({
    url: `/admin/ingredients/${publicId}`,
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

      const ingredientData = prepareIngredientData();
      await updateIngredientMutation.mutateAsync(ingredientData);
    },
    successMessage: "Nguyên liệu đã được cập nhật thành công",
    errorMessage: "Có lỗi xảy ra khi cập nhật nguyên liệu",
    redirectPath: "/admin/ingredients",
  });

  // Load ingredient data when fetched
  useEffect(() => {
    if (ingredient) {
      const ingredientData = {
        name: ingredient.name || "",
        unit_price: ingredient.unit_price?.toString() || "",
        unit: ingredient.unit || "",
      };
      setFormData(ingredientData);
      setInitialData(ingredientData);
    }
  }, [ingredient, setFormData, setInitialData]);

  // Check dirty state when form changes
  useEffect(() => {
    if (ingredient) {
      const isDirtyState = checkDirty(formData);
      if (isDirtyState !== isDirty) {
        if (isDirtyState) {
          markAsDirty();
        } else {
          markAsClean();
        }
      }
    }
  }, [formData, ingredient, checkDirty, isDirty, markAsDirty, markAsClean]);

  return (
    <IngredientMutationContent
      // Page props
      title="Chỉnh sửa nguyên liệu"
      pageTitle="Chỉnh sửa nguyên liệu"
      backAction={{
        label: "Quay lại",
        icon: FiArrowLeft,
        onClick: handleDiscard,
      }}
      // Loading states
      isLoadingIngredient={isLoadingIngredient}
      // Error states
      ingredientError={ingredientError}
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

const EditIngredientPage = () => {
  return (
    <IngredientProvider mode="edit">
      <EditIngredientContent />
    </IngredientProvider>
  );
};

export default EditIngredientPage;
