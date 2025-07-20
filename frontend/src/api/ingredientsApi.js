import { fetchProtectedApi } from "./fetchProtectedApi";

// Get all ingredients
export const getIngredients = async () => {
  return fetchProtectedApi({
    url: "/admin/ingredients",
    method: "get",
  });
};

// Get ingredient by ID
export const getIngredient = async (publicId) => {
  return fetchProtectedApi({
    url: `/admin/ingredients/${publicId}`,
    method: "get",
  });
};

// Create new ingredient
export const createIngredient = async (ingredientData) => {
  return fetchProtectedApi({
    url: "/admin/ingredients",
    method: "post",
    data: ingredientData,
  });
};

// Update ingredient
export const updateIngredient = async (publicId, ingredientData) => {
  return fetchProtectedApi({
    url: `/admin/ingredients/${publicId}`,
    method: "put",
    data: ingredientData,
  });
};

// Delete ingredient
export const deleteIngredient = async (publicId) => {
  return fetchProtectedApi({
    url: `/admin/ingredients/${publicId}`,
    method: "delete",
  });
};

// Get ingredients for a variant
export const getVariantIngredients = async (variantPublicId) => {
  return fetchProtectedApi({
    url: `/admin/variants/${variantPublicId}/ingredients`,
    method: "get",
  });
};

// Add ingredient to variant
export const addIngredientToVariant = async (
  variantPublicId,
  ingredientData
) => {
  return fetchProtectedApi({
    url: `/admin/variants/${variantPublicId}/ingredients`,
    method: "post",
    data: ingredientData,
  });
};

// Remove ingredient from variant
export const removeIngredientFromVariant = async (
  variantPublicId,
  ingredientPublicId
) => {
  return fetchProtectedApi({
    url: `/admin/variants/${variantPublicId}/ingredients/${ingredientPublicId}`,
    method: "delete",
  });
};

// Calculate variant cost
export const calculateVariantCost = async (variantPublicId) => {
  return fetchProtectedApi({
    url: `/admin/variants/${variantPublicId}/cost`,
    method: "get",
  });
};
