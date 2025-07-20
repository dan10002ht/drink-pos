import React from "react";
import {
  VStack,
  Card,
  CardBody,
  Divider,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

import Page from "../common/Page";
import ActionBar from "../molecules/ActionBar";

import ProductInfo from "./ProductInfo";
import ProductVariants from "./ProductVariants";
import ProductPreview from "./ProductPreview";

const ProductMutationContent = ({
  // Page props
  title,
  pageTitle,
  backAction,

  // Loading states
  isLoadingProduct = false,

  // Error states
  productError = null,

  // Save hook
  isSaving = false,
  isDirty = false,
  handleSave = () => {},
  handleDiscard = () => {},

  // Mode
  mode = "create",
}) => {
  // Loading state
  if (isLoadingProduct) {
    return (
      <Page title={pageTitle} backAction={backAction}>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="20px" />
              <Skeleton height="40px" />
              <Skeleton height="100px" />
              <Skeleton height="100px" />
            </VStack>
          </CardBody>
        </Card>
      </Page>
    );
  }

  // Error state
  if (productError) {
    return (
      <Page title={pageTitle} backAction={backAction}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Lỗi!</AlertTitle>
          <AlertDescription>
            Không thể tải thông tin sản phẩm. Vui lòng thử lại.
          </AlertDescription>
        </Alert>
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
        <VStack spacing={6} align="stretch">
          {/* Product Preview - chỉ hiển thị trong edit mode */}
          {mode === "edit" && <ProductPreview />}

          {/* Edit Form */}
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <ProductInfo />
                <Divider />
                <ProductVariants />
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Page>

      <ActionBar
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
        isDirty={isDirty}
        saveText={mode === "create" ? "Lưu" : "Lưu thay đổi"}
        discardText="Hủy"
      />
    </>
  );
};

export default ProductMutationContent;
