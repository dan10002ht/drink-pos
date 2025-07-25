import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLoginPage from "../components/pages/admin/AdminLoginPage";
import DashboardLayout from "../components/layouts/DashboardLayout";
import DashboardPage from "../components/pages/admin/DashboardPage";
import ProductsPage from "../components/pages/admin/ProductsPage";
import CreateProductPage from "../components/pages/admin/CreateProductPage";
import UsersPage from "../components/pages/admin/UsersPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import EditProductPage from "../components/pages/admin/EditProductPage";
import IngredientsPage from "../components/pages/admin/IngredientsPage";
import CreateIngredientPage from "../components/pages/admin/CreateIngredientPage";
import EditIngredientPage from "../components/pages/admin/EditIngredientPage";
import OrdersPage from "../components/pages/admin/OrdersPage";
import CreateOrderPage from "../components/pages/admin/CreateOrderPage";
import OrderDetailPage from "../components/pages/admin/OrderDetailPage";
import EditOrderPage from "../components/pages/admin/EditOrderPage";
import ShipperPage from "../components/pages/admin/ShipperPage";

import OrderStatusPage from "../components/pages/admin/OrderStatusPage";
import AssignShipperPage from "../components/pages/admin/AssignShipperPage";
import MorePage from "../components/pages/admin/MorePage";
import CreateShipperPage from "../components/pages/admin/CreateShipperPage";
import EditShipperPage from "../components/pages/admin/EditShipperPage";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public admin routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected admin routes with layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/create" element={<CreateProductPage />} />
        <Route path="products/:productId" element={<EditProductPage />} />
        <Route path="ingredients" element={<IngredientsPage />} />
        <Route path="ingredients/create" element={<CreateIngredientPage />} />
        <Route path="ingredients/:id" element={<EditIngredientPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/create" element={<CreateOrderPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="orders/:id/edit" element={<EditOrderPage />} />
        <Route
          path="orders/:id/assign-shipper"
          element={<AssignShipperPage />}
        />
        <Route path="order-status" element={<OrderStatusPage />} />
        <Route path="shippers" element={<ShipperPage />} />
        <Route path="shippers/create" element={<CreateShipperPage />} />
        <Route path="shippers/:id" element={<EditShipperPage />} />
        <Route path="users" element={<UsersPage />} />

        <Route path="more" element={<MorePage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
