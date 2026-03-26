import {  Outlet } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import { AuthProvider } from "./contexts/AuthContext"

export default function App() {
  return (
    <AuthProvider>
    <div>
      <Navbar/>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
    </AuthProvider>
  )
}