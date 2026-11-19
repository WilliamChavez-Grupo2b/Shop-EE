
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { Order } from '../types';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders, loading, error } = useApi<Order[]>('/orders');

  return (
    <>
      <h1>Pedidos</h1>
      {loading && <p className="loading">Cargando…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr><th>ID</th><th>Producto</th><th>Cantidad</th><th>Total</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.productId}</td>
                <td>{o.quantity}</td>
                <td>${Number(o.totalValue).toFixed(2)}</td>
                <td><span className={`badge ${o.status}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: '1rem' }}>
        <button className="btn secondary" onClick={() => navigate('/')}>Volver a la tienda</button>
      </p>
    </>
  );
}
