import { Navigate, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import MainLayout from "../components/layout/MainLayout";

// Public Auth Routes
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ResetPasswordOtp from "../pages/auth/ResetPasswordOtp";
import ActivateAccount from "../pages/auth/ActivateAccount";

// Private Routes
import Dashboard from "../pages/Dashboard";
import Products from "../pages/products/index.jsx";
import Categories from "../pages/categories/index.jsx";
import Orders from "../pages/orders/index.jsx";
import Suppliers from "../pages/suppliers/index.jsx";
import Reports from "../pages/reports/index.jsx";

import UserManagement from "../pages/user-management/index.jsx";

// Not Found Page
import NotFound from "../pages/NotFound";

// Define routes as a configuration array for clarity and reusability
export const routeConfig = {
  publicRoutes: [
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/reset-password-otp", element: <ResetPasswordOtp /> },
    { path: "/activate-account", element: <ActivateAccount /> },
  ],
  privateRoutes: [
    { path: "/", element: <Navigate to="/dashboard" replace />, index: true },
    { path: "dashboard", element: <Dashboard /> },
    { path: "products", element: <Products /> },
    { path: "categories", element: <Categories /> },
    { path: "orders", element: <Orders /> },
    { path: "suppliers", element: <Suppliers /> },
    { path: "reports", element: <Reports /> },
    { path: "user-management", element: <UserManagement /> },

  ],
  notFound: { path: "*", element: <NotFound /> },
};

// Function to render routes in App.jsx
export const renderRoutes = () => {
  return (
    <>
      {/* Public Routes - Protected from authenticated users */}
      {routeConfig.publicRoutes.map((route) => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={
            <PublicRoute>
              {route.element}
            </PublicRoute>
          } 
        />
      ))}
      {/* Private Routes with Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {routeConfig.privateRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
            index={route.index || false}
          />
        ))}
      </Route>
      {/* 404 Page */}
      <Route path={routeConfig.notFound.path} element={routeConfig.notFound.element} />
    </>
  );
};
