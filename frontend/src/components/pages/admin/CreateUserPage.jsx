import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Avatar,
  IconButton,
} from "@chakra-ui/react";
import { FiX, FiUpload, FiUser } from "react-icons/fi";

import Page from "../../common/Page";
import { useCreateApi } from "../../../hooks/useCreateApi";
import useSave from "../../../hooks/useSave";

const CreateUserPage = () => {
  // State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "customer",
    is_active: true,
    avatar: null,
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Create user mutation
  const { mutate: createUser } = useCreateApi({
    url: "/admin/users",
    protected: true,
  });

  // Save hook
  const { isSaving, handleSave, handleDiscard, markAsDirty } = useSave({
    onSave: async () => {
      if (!validateForm()) {
        throw new Error("Vui lòng kiểm tra lại thông tin");
      }

      try {
        await createUser(formData);
        return true;
      } catch {
        return false;
      }
    },
    successMessage: "Người dùng đã được tạo thành công",
    errorMessage: "Có lỗi xảy ra khi tạo người dùng",
    redirectPath: "/admin/users",
  });

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    markAsDirty();
  };

  // Handle avatar upload
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: "File quá lớn (tối đa 5MB)" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setFormData((prev) => ({ ...prev, avatar: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatar: null }));
    setErrors((prev) => ({ ...prev, avatar: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Mật khẩu xác nhận không khớp";
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Page
      title="Tạo người dùng mới"
      backAction={{
        label: "Quay lại",
        icon: FiX,
        onClick: handleDiscard,
      }}
    >
      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Avatar Upload */}
              <FormControl>
                <FormLabel>Ảnh đại diện</FormLabel>
                <HStack spacing={4}>
                  <Avatar
                    size="xl"
                    name={formData.name || "User"}
                    src={avatarPreview}
                    icon={<FiUser />}
                  />
                  <VStack align="start" spacing={2}>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<FiUpload />}
                        onClick={() =>
                          document.getElementById("avatar-input").click()
                        }
                      >
                        Tải ảnh
                      </Button>
                      {avatarPreview && (
                        <IconButton
                          size="sm"
                          icon={<FiX />}
                          onClick={handleRemoveAvatar}
                          aria-label="Xóa ảnh"
                        />
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      JPG, PNG hoặc GIF (tối đa 5MB)
                    </Text>
                  </VStack>
                </HStack>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
                {errors.avatar && (
                  <FormErrorMessage>{errors.avatar}</FormErrorMessage>
                )}
              </FormControl>

              {/* Basic Information */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Thông tin cơ bản
                </Text>

                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Tên đầy đủ *</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Nhập tên đầy đủ"
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email *</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Nhập email"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel>Số điện thoại</FormLabel>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                  <FormErrorMessage>{errors.phone}</FormErrorMessage>
                </FormControl>
              </VStack>

              {/* Account Information */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Thông tin tài khoản
                </Text>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Mật khẩu *</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Nhập mật khẩu"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.confirm_password}>
                  <FormLabel>Xác nhận mật khẩu *</FormLabel>
                  <Input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleChange("confirm_password", e.target.value)
                    }
                    placeholder="Nhập lại mật khẩu"
                  />
                  <FormErrorMessage>{errors.confirm_password}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Vai trò</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị viên</option>
                  </Select>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Tài khoản hoạt động</FormLabel>
                  <Switch
                    isChecked={formData.is_active}
                    onChange={(e) =>
                      handleChange("is_active", e.target.checked)
                    }
                  />
                </FormControl>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end">
          <Button onClick={handleDiscard} variant="outline">
            Hủy
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Đang tạo..."
          >
            Tạo người dùng
          </Button>
        </HStack>
      </VStack>
    </Page>
  );
};

export default CreateUserPage;
