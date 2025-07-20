import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";

import {
  IngredientProvider,
  useIngredientContext,
} from "../../../contexts/IngredientContext";
import IngredientMutationContent from "../../organisms/IngredientMutationContent";
import { useCreateApi } from "../../../hooks/useCreateApi";
import useSave from "../../../hooks/useSave";

const CreateIngredientContent = () => {
  const { validateForm, prepareIngredientData } = useIngredientContext();

  // Create ingredient mutation
  const createIngredientMutation = useCreateApi({
    url: "/admin/ingredients",
    protected: true,
  });

  // Save hook
  const { isSaving, isDirty, handleSave, handleDiscard, markAsDirty } = useSave(
    {
      onSave: async () => {
        if (!validateForm()) {
          throw new Error("Vui lòng kiểm tra lại thông tin");
        }

        const ingredientData = prepareIngredientData();
        await createIngredientMutation.mutateAsync(ingredientData);
      },
      successMessage: "Nguyên liệu đã được tạo thành công",
      errorMessage: "Có lỗi xảy ra khi tạo nguyên liệu",
      redirectPath: "/admin/ingredients",
    }
  );

  // Mark as dirty when form changes
  useEffect(() => {
    markAsDirty();
  }, [markAsDirty]);

  return (
    <IngredientMutationContent
      // Page props
      title="Tạo nguyên liệu mới"
      pageTitle="Tạo nguyên liệu mới"
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

const CreateIngredientPage = () => {
  return (
    <IngredientProvider mode="create">
      <CreateIngredientContent />
    </IngredientProvider>
  );
};

export default CreateIngredientPage;
