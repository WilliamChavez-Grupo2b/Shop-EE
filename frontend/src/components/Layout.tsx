import { NavLink } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="brand">🛒 Shop-EE</NavLink>
        <NavLink to="/">Productos</NavLink>
        <NavLink to="/checkout">Checkout</NavLink>
        <NavLink to="/orders">Pedidos</NavLink>
        <NavLink to="/admin">Administración</NavLink>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}
