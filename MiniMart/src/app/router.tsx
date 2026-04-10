import { createBrowserRouter } from 'react-router-dom'
import App from '../App'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import CatalogPage from '../pages/CatalogPage'
import ProductDetailsPage from '../pages/ProductDetailsPage.tsx'
import OrdersPage from '../pages/OrdersPage'
import CartPage from '../pages/CartPage'
import ProfilePage from '../pages/ProfilePage'
import NotFoundPage from '../pages/NotFoundPage'

import AdminProductsPage from '../pages/AdminProductsPage'
import AdminOrdersPage from '../pages/AdminOrdersPage'
import AdminUsersPage from '../pages/AdminUsersPage'

import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'
import GuestOnlyRoute from '../components/GuestOnlyRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },

      {
        path: 'login',
        element: (
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        )
      },
      {
        path: 'register',
        element: (
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        )
      },

      { path: 'catalog', element: <CatalogPage /> },
      { path: 'products/:productId', element: <ProductDetailsPage /> },

      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        )
      },

      {
        path: 'admin/products',
        element: (
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        )
      },
      {
        path: 'admin/orders',
        element: (
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        )
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        )
      },

      { path: '*', element: <NotFoundPage /> }
    ]
  }
])