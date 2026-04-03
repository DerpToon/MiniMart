import { createBrowserRouter } from 'react-router-dom'
import App from '../App'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import CatalogPage from '../pages/CatalogPage'
import OrdersPage from '../pages/OrdersPage'
import CartPage from '../pages/CartPage'
import NotFoundPage from '../pages/NotFoundPage'

import AdminProductsPage from '../pages/AdminProductsPage'
import AdminOrdersPage from '../pages/AdminOrdersPage'

import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },

      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      { path: 'catalog', element: <CatalogPage /> },

      // 🔐 USER PROTECTED
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        ),
      },

      // 🔐 ADMIN ONLY
      {
        path: 'admin/products',
        element: (
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        ),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])