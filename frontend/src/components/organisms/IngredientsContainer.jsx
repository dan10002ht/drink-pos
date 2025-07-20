import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useFetchApi } from "../../hooks/useFetchApi";
import Page from "../common/Page";
import IngredientList from "../molecules/IngredientList";

const IngredientsContainer = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const {
    data: ingredients,
    isLoading,
    error,
    refetch,
  } = useFetchApi({
    url: "/admin/ingredients",
    protected: true,
    defaultData: [],
  });

  const handleAddIngredient = () => {
    navigate("/admin/ingredients/create");
  };

  const handleViewIngredient = (ingredientPublicId) => {
    navigate(`/admin/ingredients/${ingredientPublicId}`);
  };

  const handleEditIngredient = (ingredientPublicId) => {
    navigate(`/admin/ingredients/${ingredientPublicId}/edit`);
  };

  const handleDeleteIngredient = () => {
    // TODO: Implement delete functionality
    toast({
      title: "Xóa nguyên liệu",
      description: "Tính năng xóa nguyên liệu sẽ được implement sau",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <Page
      title="Quản lý nguyên liệu"
      primaryAction={{
        label: "Thêm nguyên liệu",
        icon: FiPlus,
        onClick: handleAddIngredient,
      }}
    >
      <IngredientList
        ingredients={ingredients}
        isLoading={isLoading}
        error={error}
        onView={handleViewIngredient}
        onEdit={handleEditIngredient}
        onDelete={handleDeleteIngredient}
        onRetry={handleRetry}
        onAddIngredient={handleAddIngredient}
      />
    </Page>
  );
};

export default IngredientsContainer;
