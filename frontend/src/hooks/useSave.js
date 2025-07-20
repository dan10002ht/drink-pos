import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

/**
 * Custom hook để handle save/discard logic
 * @param {Object} options - Configuration options
 * @param {Function} options.onSave - Save function
 * @param {Function} options.onDiscard - Discard function (optional)
 * @param {string} options.successMessage - Success message
 * @param {string} options.errorMessage - Error message
 * @param {string} options.redirectPath - Path to redirect after save
 * @param {boolean} options.showConfirmOnDiscard - Show confirm dialog when discarding
 * @returns {Object} Save state and handlers
 */
const useSave = ({
  onSave,
  onDiscard,
  successMessage = "Đã lưu thành công",
  errorMessage = "Có lỗi xảy ra khi lưu",
  redirectPath,
  showConfirmOnDiscard = true,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave();

      toast({
        title: "Thành công",
        description: successMessage,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsDirty(false);

      // Delay để animation có thể chạy
      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath);
        }
      }, 300);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, successMessage, errorMessage, redirectPath, navigate, toast]);

  const handleDiscard = useCallback(() => {
    if (onDiscard) {
      if (showConfirmOnDiscard && isDirty) {
        if (window.confirm("Bạn có chắc muốn hủy? Các thay đổi sẽ bị mất.")) {
          setIsDirty(false);
          // Delay để animation có thể chạy
          setTimeout(() => {
            onDiscard();
          }, 300);
        }
      } else {
        setIsDirty(false);
        // Delay để animation có thể chạy
        setTimeout(() => {
          onDiscard();
        }, 300);
      }
    } else if (redirectPath) {
      setIsDirty(false);
      // Delay để animation có thể chạy
      setTimeout(() => {
        navigate(redirectPath);
      }, 300);
    } else {
      setIsDirty(false);
      // Delay để animation có thể chạy
      setTimeout(() => {
        navigate(-1);
      }, 300);
    }
  }, [onDiscard, showConfirmOnDiscard, isDirty, redirectPath, navigate]);

  const setDirty = useCallback((dirty) => {
    setIsDirty(dirty);
  }, []);

  const markAsDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const markAsClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  const setInitialDataValue = useCallback((data) => {
    setInitialData(data);
  }, []);

  const checkDirty = useCallback(
    (currentData) => {
      if (!initialData) return false;
      return JSON.stringify(initialData) !== JSON.stringify(currentData);
    },
    [initialData]
  );

  return {
    isSaving,
    isDirty,
    handleSave,
    handleDiscard,
    setDirty,
    markAsDirty,
    markAsClean,
    setInitialData: setInitialDataValue,
    checkDirty,
  };
};

export default useSave;
