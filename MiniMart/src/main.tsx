import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { debugOrderDatabase } from './Services/OrderService'
import './index.css'

// Expose debug functions globally for console access
declare global {
  interface Window {
    debugOrderDatabase: typeof debugOrderDatabase
  }
}

if (import.meta.env.DEV) {
  window.debugOrderDatabase = debugOrderDatabase
  console.log('🐛 Debug functions available. Run: debugOrderDatabase()')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)