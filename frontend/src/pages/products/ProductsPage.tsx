import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { Product } from '../../types';
import { api } from '../../api';
import StatusBanner from '../../components/StatusBanner';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const { data: products, loading, error, refresh } = useApi<Product[]>('/products');
  const [editing, setEditing] = useState<Product | undefined>();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  async function handleDelete(id: number) {
    if (!confirm(`¿Eliminar el producto ${id}?`)) return;
    try {
      await api.delete(`/products/${id}`);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  const filtered = (products ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h1>Productos</h1>
      <StatusBanner loading={loading} error={error} />
      {!loading && !error && (
        <>
          <div className="toolbar">
            <input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 0.7rem', border: '1px solid #cbd5e1', borderRadius: 8 }} />
            <button className="btn" onClick={() => { setCreating(true); setEditing(undefined); }}>
              + Nuevo producto
            </button>
          </div>

          {(creating || editing) && (
            <ProductForm
              product={editing}
              onSaved={() => { setCreating(false); setEditing(undefined); void refresh(); }}
              onCancel={() => { setCreating(false); setEditing(undefined); }}
            />
          )}

          {filtered.length === 0 ? (
            <p className="empty">No hay productos.</p>
          ) : (
            <div className="grid">
              {filtered.map((p) => (
                <div className="card" key={p.id}>
                  <h3>{p.name}</h3>
                  <p className="muted">{p.category}</p>
                  <p className="price">${Number(p.value).toFixed(2)}</p>
                  <p className="muted">Stock: {p.stock}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.7rem' }}>
                    <button className="btn secondary" onClick={() => { setEditing(p); setCreating(false); }}>Editar</button>
                    <button className="btn danger" onClick={() => void handleDelete(p.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
