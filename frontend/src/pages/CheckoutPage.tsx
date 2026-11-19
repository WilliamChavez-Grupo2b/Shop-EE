import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { api } from '../api';
import { Order, Payment, Shipment } from '../types';

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nickname: '', address: '', method: 'cash' });
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setProcessing(true);
    setError(null);
    try {
      // 1. Pedidos (uno por producto del carrito)
      const orders: Order[] = [];
      for (const item of items) {
        orders.push(await api.post<Order>('/orders', {
          productId: item.product.id,
          quantity: item.quantity,
          totalValue: Number(item.product.value) * item.quantity,
          status: 'pending',
        }));
      }
      // 2. Pago del pedido principal
      const payment = await api.post<Payment>('/payment', {
        amount: total,
        method: form.method,
        status: 'pending',
      });
      // 3. Envío
      await api.post<Shipment>('/shipment', {
        orderId: orders[0].id,
        tracking: `TRK-${Date.now()}`,
        address: form.address,
        status: 'pending',
      });
      clear();
      navigate(`/orders/${orders[0].id}?payment=${payment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) return <p className="empty">Tu carrito está vacío.</p>;

  return (
    <>
      <h1>Checkout</h1>
      <div className="card" style={{ marginBottom: '1rem' }}>
        {items.map((i) => (
          <p key={i.product.id}>
            {i.quantity} × {i.product.name} — ${(Number(i.product.value) * i.quantity).toFixed(2)}
          </p>
        ))}
        <p className="price">Total: ${total.toFixed(2)}</p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Dirección de envío
          <input required maxLength={255} value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </label>
        <label>
          Método de pago
          <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </select>
        </label>
        <button className="btn" type="submit" disabled={processing}>
          {processing ? 'Procesando…' : `Confirmar pedido ($${total.toFixed(2)})`}
        </button>
      </form>
    </>
  );
}
