import React from "react";
import { Card, CardBody, Text } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import Page from "../../common/Page";

const UsersPage = () => {
  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log("Add user clicked");
  };

  return (
    <Page
      title="Quản lý người dùng"
      primaryAction={{
        label: "Thêm người dùng",
        icon: FiPlus,
        onClick: handleAddUser,
      }}
    >
      <Card>
        <CardBody>
          <Text>Danh sách người dùng sẽ hiển thị ở đây</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Bao gồm: Tên, email, role, trạng thái, thao tác
          </Text>
        </CardBody>
      </Card>
    </Page>
  );
};

export default UsersPage;
