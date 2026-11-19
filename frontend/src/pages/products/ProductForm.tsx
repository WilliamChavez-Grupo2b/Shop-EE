import { useState } from 'react';
import { Product } from '../../types';
import { api } from '../../api';

interface Props {
  product?: Product;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    value: product?.value ?? 0,
    stock: product?.stock ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (product) await api.put(`/products/${product.id}`, form);
      else await api.post('/products', form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
      {error && <p className="error">{error}</p>}
      <label>
        Nombre
        <input required maxLength={50} value={form.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        Categoría
        <input required maxLength={50} value={form.category} onChange={(e) => set('category', e.target.value)} />
      </label>
      <label>
        Precio
        <input required type="number" min="0" step="0.01" value={form.value}
          onChange={(e) => set('value', Number(e.target.value))} />
      </label>
      <label>
        Stock
        <input required type="number" min="0" value={form.stock}
          onChange={(e) => set('stock', Number(e.target.value))} />
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn" disabled={saving} type="submit">{saving ? 'Guardando…' : 'Guardar'}</button>
        <button className="btn secondary" type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
