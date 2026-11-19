import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './cart/CartContext';
import Layout from './components/Layout';
import ProductsPage from './pages/products/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<p className="empty">Página no encontrada. <Link to="/">Volver</Link></p>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>
);
