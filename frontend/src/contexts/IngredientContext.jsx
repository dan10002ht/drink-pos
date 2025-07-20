import React, { createContext, useContext, useState, useCallback } from "react";

const IngredientContext = createContext();

export const useIngredientContext = () => {
  const context = useContext(IngredientContext);
  if (!context) {
    throw new Error(
      "useIngredientContext must be used within an IngredientProvider"
    );
  }
  return context;
};

export const IngredientProvider = ({
  children,
  initialData = null,
  mode = "create",
}) => {
  // Initial form data
  const getInitialFormData = () => {
    if (initialData && mode === "edit") {
      return {
        name: initialData.name || "",
        unit_price: initialData.unit_price?.toString() || "",
        unit: initialData.unit || "",
      };
    }

    return {
      name: "",
      unit_price: "",
      unit: "",
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Handle form data changes
  const handleChangeData = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle input change with error clearing
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field error
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Tên nguyên liệu là bắt buộc";
    } else if (formData.name.trim().length > 200) {
      newErrors.name = "Tên nguyên liệu không được quá 200 ký tự";
    }

    // Validate unit price
    if (!formData.unit_price) {
      newErrors.unit_price = "Đơn giá là bắt buộc";
    } else if (
      isNaN(formData.unit_price) ||
      parseFloat(formData.unit_price) <= 0
    ) {
      newErrors.unit_price = "Đơn giá phải là số dương";
    }

    // Validate unit
    if (!formData.unit.trim()) {
      newErrors.unit = "Đơn vị là bắt buộc";
    } else if (formData.unit.trim().length > 50) {
      newErrors.unit = "Đơn vị không được quá 50 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Prepare data for API
  const prepareIngredientData = useCallback(() => {
    return {
      name: formData.name.trim(),
      unit_price: parseFloat(formData.unit_price),
      unit: formData.unit.trim(),
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
    handleInputChange,

    // Helpers
    validateForm,
    prepareIngredientData,
    clearFieldError,

    // Setters
    setFormData,
    setErrors,
  };

  return (
    <IngredientContext.Provider value={value}>
      {children}
    </IngredientContext.Provider>
  );
};
