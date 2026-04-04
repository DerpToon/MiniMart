import { Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer'; // Make sure this path matches where you saved Footer.tsx!

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <Navbar />
      
      <main style={{ flexGrow: 1, padding: '0' }}> 
        <Outlet />
      </main>

      <Footer />
      
    </div>
  );
}