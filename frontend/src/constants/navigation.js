import {
  FiHome,
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTruck,
  FiClipboard,
  FiMoreHorizontal,
  FiCoffee,
} from "react-icons/fi";

export const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: FiHome,
    path: "/admin/dashboard",
  },
  {
    label: "Sản phẩm",
    icon: FiPackage,
    path: "/admin/products",
  },
  {
    label: "Nguyên liệu",
    icon: FiCoffee,
    path: "/admin/ingredients",
  },
  {
    label: "Đơn hàng",
    icon: FiShoppingCart,
    path: "/admin/orders",
  },
  {
    label: "Trạng thái đơn hàng",
    icon: FiClipboard,
    path: "/admin/order-status",
  },
  {
    label: "Shipper",
    icon: FiTruck,
    path: "/admin/shippers",
  },
  {
    label: "Người dùng",
    icon: FiUsers,
    path: "/admin/users",
  },
];

// Mobile navigation - gộp các tab phức tạp vào "Xem thêm"
export const ADMIN_MOBILE_NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: FiHome,
    path: "/admin/dashboard",
  },
  {
    label: "Sản phẩm",
    icon: FiPackage,
    path: "/admin/products",
  },
  {
    label: "Đơn hàng",
    icon: FiShoppingCart,
    path: "/admin/orders",
  },
  {
    label: "Trạng thái",
    icon: FiClipboard,
    path: "/admin/order-status",
  },
  {
    label: "Xem thêm",
    icon: FiMoreHorizontal,
    path: "/admin/more",
    children: [
      {
        label: "Nguyên liệu",
        icon: FiCoffee,
        path: "/admin/ingredients",
      },
      {
        label: "Shipper",
        icon: FiTruck,
        path: "/admin/shippers",
      },
      {
        label: "Người dùng",
        icon: FiUsers,
        path: "/admin/users",
      },
    ],
  },
];
