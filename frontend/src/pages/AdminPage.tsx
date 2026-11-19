import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Category, Order, Payment, Profile, Product, Shipment } from '../types';
import { api } from '../api';
import StatusBanner from '../components/StatusBanner';

type Section = 'products' | 'categories' | 'orders' | 'payments' | 'shipments' | 'users';

const badges = ['pending', 'completed', 'cancelled', 'paid', 'delivered'];

export default function AdminPage() {
  const [section, setSection] = useState<Section>('products');
  const products = useApi<Product[]>('/products');
  const categories = useApi<Category[]>('/categories');
  const orders = useApi<Order[]>('/orders');
  const payments = useApi<Payment[]>('/payment');
  const shipments = useApi<Shipment[]>('/shipment');
  const users = useApi<Profile[]>('/users');

  const current = { products, categories, orders, payments, shipments, users }[section];
  const loading = current.loading;
  const error = current.error;
  const refresh = current.refresh;

  async function handleDelete(path: string, id: number) {
    if (!confirm(`¿Eliminar el registro ${id}?`)) return;
    try {
      await api.delete(`${path}/${id}`);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  async function updateStatus(path: string, id: number, status: string) {
    try {
      await api.put(`${path}/${id}`, { status });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al actualizar');
    }
  }

  const tabs: Section[] = ['products', 'categories', 'orders', 'payments', 'shipments', 'users'];

  return (
    <>
      <h1>Administración</h1>
      <div className="toolbar" style={{ gap: '0.5rem' }}>
        {tabs.map((t) => (
          <button
            key={t}
            className={t === section ? 'btn' : 'btn secondary'}
            onClick={() => setSection(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <StatusBanner loading={loading} error={error} />
      {!loading && !error && renderTable()}
    </>
  );

  function renderTable() {
    switch (section) {
      case 'products':
        return table(['ID', 'Nombre', 'Categoría', 'Precio', 'Stock'], (products.data ?? []).map((p) => [
          p.id, p.name, p.category, `$${Number(p.value).toFixed(2)}`, p.stock,
          <button key="d" className="btn danger" onClick={() => void handleDelete('/products', p.id)}>Eliminar</button>,
        ]));
      case 'categories':
        return table(['ID', 'Nombre', 'Descripción'], (categories.data ?? []).map((c) => [
          c.id, c.name, c.description ?? '—',
          <button key="d" className="btn danger" onClick={() => void handleDelete('/categories', c.id)}>Eliminar</button>,
        ]));
      case 'orders':
        return table(['ID', 'Producto', 'Cantidad', 'Total', 'Estado'], (orders.data ?? []).map((o) => [
          o.id, o.productId, o.quantity, `$${Number(o.totalValue).toFixed(2)}`,
          <StatusSelect key="s" value={o.status} onChange={(s) => void updateStatus('/orders', o.id, s)} />,
          <button key="d" className="btn danger" onClick={() => void handleDelete('/orders', o.id)}>Eliminar</button>,
        ]));
      case 'payments':
        return table(['ID', 'Usuario', 'Pedido', 'Monto', 'Método', 'Estado'], (payments.data ?? []).map((p) => [
          p.id, p.userId ?? '—', p.orderId ?? '—', `$${Number(p.amount).toFixed(2)}`, p.method,
          <span key="b" className={`badge ${p.status}`}>{p.status}</span>,
          <button key="d" className="btn danger" onClick={() => void handleDelete('/payment', p.id)}>Eliminar</button>,
        ]));
      case 'shipments':
        return table(['ID', 'Pedido', 'Tracking', 'Dirección', 'Estado'], (shipments.data ?? []).map((s) => [
          s.id, s.orderId, s.tracking, s.address,
          <StatusSelect key="s" value={s.status} onChange={(st) => void updateStatus('/shipment', s.id, st)} />,
          <button key="d" className="btn danger" onClick={() => void handleDelete('/shipment', s.id)}>Eliminar</button>,
        ]));
      case 'users':
        return table(['ID', 'Nombre', 'Email', 'Nickname', 'Rol'], (users.data ?? []).map((u) => [
          u.id, `${u.firstName} ${u.lastName}`, u.email, u.nickname, <span key="b" className="badge">{u.role}</span>,
          <button key="d" className="btn danger" onClick={() => void handleDelete('/users', u.id)}>Eliminar</button>,
        ]));
    }
  }

  function table(headers: string[], rows: React.ReactNode[][]) {
    const allRows = rows.length > 0
      ? rows
      : [[<p key="empty" className="empty">No hay registros.</p>]];
    return (
      <table>
        <thead>
          <tr>{headers.map((h) => <th key={h}>{h}</th>)}<th>Acciones</th></tr>
        </thead>
        <tbody>
          {allRows.map((cells, i) => (
            <tr key={i}>{cells.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }
}

function StatusSelect({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ padding: '0.3rem', borderRadius: 6, border: '1px solid #cbd5e1' }}>
      {[...new Set([...badges, value])].map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
