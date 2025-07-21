import React, { createContext, useContext, useState, useCallback } from "react";

const OrderContext = createContext();

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({
  children,
  initialData = null,
  mode = "create",
}) => {
  // Initial form data
  const getInitialFormData = () => {
    if (initialData && mode === "edit") {
      return {
        customer_name: initialData.customer_name || "",
        customer_phone: initialData.customer_phone || "",
        customer_email: initialData.customer_email || "",
        payment_method: initialData.payment_method || "cash",
        discount_code: initialData.discount_code || "",
        discount_note: initialData.discount_note || "",
        notes: initialData.notes || "",
        items: initialData.items?.map((item) => ({
          variant_id: item.variant_id || "",
          quantity: item.quantity || 1,
          notes: item.notes || "",
        })) || [
          {
            variant_id: "",
            quantity: 1,
            notes: "",
          },
        ],
      };
    }

    return {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      payment_method: "cash",
      discount_code: "",
      discount_note: "",
      notes: "",
      items: [
        {
          variant_id: "",
          quantity: 1,
          notes: "",
        },
      ],
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Handle form data changes
  const handleChangeData = useCallback((key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Handle item changes
  const handleItemChange = useCallback((index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  }, []);

  // Add new item
  const addItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          variant_id: "",
          quantity: 1,
          notes: "",
        },
      ],
    }));
  }, []);

  // Remove item
  const removeItem = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  // Get variant info helper
  const getVariantInfo = useCallback((variantId, products) => {
    if (!products) return null;

    for (const product of products) {
      const variant = product.variants?.find((v) => v.id === variantId);
      if (variant) {
        return {
          product_name: product.name,
          variant_name: variant.name,
          price: variant.price,
        };
      }
    }
    return null;
  }, []);

  // Calculate totals
  const calculateTotals = useCallback(
    (products) => {
      let subtotal = 0;
      const itemsWithInfo = [];

      formData.items.forEach((item) => {
        if (
          item.id &&
          typeof item.unit_price === "number" &&
          typeof item.quantity === "number"
        ) {
          // Item đã lưu ở BE, tự tính lại total_price
          const itemTotal = item.unit_price * item.quantity;
          subtotal += itemTotal;
          itemsWithInfo.push({
            ...item,
            total_price: itemTotal,
          });
        } else if (item.variant_id && item.quantity > 0) {
          // Item mới, lookup từ products
          const variantInfo = getVariantInfo(item.variant_id, products);
          if (variantInfo) {
            const itemTotal = variantInfo.price * item.quantity;
            subtotal += itemTotal;
            itemsWithInfo.push({
              ...item,
              ...variantInfo,
              total_price: itemTotal,
            });
          }
        }
      });

      return { subtotal, itemsWithInfo };
    },
    [formData.items, getVariantInfo]
  );

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate customer info
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Tên khách hàng là bắt buộc";
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Số điện thoại là bắt buộc";
    }

    // Validate items
    const itemErrors = [];
    formData.items.forEach((item, index) => {
      const itemError = {};

      if (!item.variant_id) {
        itemError.variant_id = "Vui lòng chọn sản phẩm";
      }

      if (!item.quantity || item.quantity <= 0) {
        itemError.quantity = "Số lượng phải lớn hơn 0";
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (itemErrors.length > 0) {
      newErrors.items = itemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Format currency helper
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }, []);

  // Prepare variant options for Combobox
  const getVariantOptions = useCallback(
    (products) => {
      return products.flatMap(
        (product) =>
          product.variants?.map((variant) => ({
            ...variant,
            product_name: product.name,
            label: `${product.name} - ${variant.name} - ${formatCurrency(
              variant.price
            )}`,
          })) || []
      );
    },
    [formatCurrency]
  );

  const value = {
    // State
    formData,
    errors,
    mode,

    // Actions
    handleChangeData,
    handleItemChange,
    addItem,
    removeItem,

    // Helpers
    getVariantInfo,
    calculateTotals,
    validateForm,
    formatCurrency,
    getVariantOptions,

    // Setters
    setFormData,
    setErrors,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
