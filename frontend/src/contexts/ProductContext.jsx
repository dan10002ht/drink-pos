import React, { createContext, useContext, useState, useCallback } from "react";

const ProductContext = createContext();

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider = ({
  children,
  initialData = null,
  mode = "create",
}) => {
  // Initial form data
  const getInitialFormData = () => {
    if (initialData && mode === "edit") {
      return {
        name: initialData.name || "",
        description: initialData.description || "",
        private_note: initialData.private_note || "",
        variants:
          initialData.variants?.length > 0
            ? initialData.variants.map((v) => ({
                id: v.id,
                name: v.name || "",
                price: v.price?.toString() || "",
                description: v.description || "",
                private_note: v.private_note || "",
                ingredients:
                  v.ingredients?.map((ing) => ({
                    ingredient_id: ing.ingredient?.id || ing.ingredient_id,
                    quantity: ing.quantity || 0,
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
    }

    return {
      name: "",
      description: "",
      private_note: "",
      variants: [
        {
          name: "",
          price: "",
          description: "",
          private_note: "",
          ingredients: [],
        },
      ],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Handle form data changes
  const handleChangeData = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Add new variant
  const addVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: "",
          price: "",
          description: "",
          private_note: "",
          ingredients: [],
        },
      ],
    }));
  }, []);

  // Remove variant
  const removeVariant = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));

    // Clear variant errors
    setErrors((prev) => {
      if (prev.variants) {
        const newErrors = { ...prev };
        delete newErrors.variants[index];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Update variant
  const updateVariant = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index][field] = value;
      return { ...prev, variants: newVariants };
    });

    // Clear field error
    setErrors((prev) => {
      if (
        prev.variants &&
        prev.variants[index] &&
        prev.variants[index][field]
      ) {
        const newErrors = { ...prev };
        delete newErrors.variants[index][field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Update variant ingredients
  const updateVariantIngredients = useCallback((index, ingredients) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index].ingredients = ingredients;
      return { ...prev, variants: newVariants };
    });
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate product name
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "Tên sản phẩm không được quá 200 ký tự";
    }

    // Validate product description
    if (formData.description.trim().length > 1000) {
      newErrors.description = "Mô tả sản phẩm không được quá 1000 ký tự";
    }

    // Validate product private note
    if (formData.private_note.trim().length > 1000) {
      newErrors.private_note = "Ghi chú riêng không được quá 1000 ký tự";
    }

    // Validate variants
    const variantErrors = [];
    formData.variants.forEach((variant, index) => {
      const variantError = {};

      if (!variant.name.trim()) {
        variantError.name = "Tên variant là bắt buộc";
      } else if (variant.name.trim().length > 100) {
        variantError.name = "Tên variant không được quá 100 ký tự";
      }

      if (!variant.price) {
        variantError.price = "Giá là bắt buộc";
      } else if (isNaN(variant.price) || parseFloat(variant.price) <= 0) {
        variantError.price = "Giá phải là số dương";
      }

      if (variant.description.trim().length > 500) {
        variantError.description = "Mô tả variant không được quá 500 ký tự";
      }

      if (variant.private_note.trim().length > 500) {
        variantError.private_note = "Ghi chú riêng không được quá 500 ký tự";
      }

      if (Object.keys(variantError).length > 0) {
        variantErrors[index] = variantError;
      }
    });

    if (variantErrors.length > 0) {
      newErrors.variants = variantErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Prepare data for API
  const prepareProductData = useCallback(() => {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      private_note: formData.private_note.trim(),
      variants: formData.variants.map((variant) => ({
        ...(variant.id && { id: variant.id }), // Only include id for edit mode
        name: variant.name.trim(),
        price: parseFloat(variant.price),
        description: variant.description.trim(),
        private_note: variant.private_note.trim(),
        ingredients: variant.ingredients || [],
      })),
    };
  }, [formData]);

  // Clear field error
  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const value = {
    // State
    formData,
    errors,
    mode,

    // Actions
    handleChangeData,
    addVariant,
    removeVariant,
    updateVariant,
    updateVariantIngredients,

    // Helpers
    validateForm,
    prepareProductData,
    clearFieldError,

    // Setters
    setFormData,
    setErrors,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
