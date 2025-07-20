import React from "react";
import {
  VStack,
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
  Box,
  Heading,
  Text,
} from "@chakra-ui/react";

import Page from "../common/Page";
import ActionBar from "../molecules/ActionBar";
import IngredientInfo from "./IngredientInfo";

const IngredientMutationContent = ({
  // Page props
  title,
  pageTitle,
  backAction,

  // Loading states
  isLoadingIngredient = false,

  // Error states
  ingredientError = null,

  // Save hook
  isSaving = false,
  isDirty = false,
  handleSave = () => {},
  handleDiscard = () => {},

  // Mode
  mode = "create",
}) => {
  // Loading state
  if (isLoadingIngredient) {
    return (
      <Page title={pageTitle} backAction={backAction}>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="20px" width="40%" />
              <SkeletonText noOfLines={3} spacing={4} />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (ingredientError) {
    return (
      <Page title={pageTitle} backAction={backAction}>
        <Card>
          <CardBody>
            <Box textAlign="center" py={8}>
              <Heading size="md" color="red.500" mb={4}>
                Không tìm thấy nguyên liệu
              </Heading>
              <Text color="gray.500">
                Nguyên liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </Text>
            </Box>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <Page
        title={title}
        hasActionBar
        isDirty={isDirty}
        backAction={backAction}
      >
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <IngredientInfo />
            </VStack>
          </CardBody>
        </Card>
      </Page>

      <ActionBar
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
        isDirty={isDirty}
        saveText={mode === "create" ? "Tạo nguyên liệu" : "Lưu thay đổi"}
        discardText="Hủy"
      />
    </>
  );
};

export default IngredientMutationContent;
