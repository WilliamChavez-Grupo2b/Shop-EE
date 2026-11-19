import { useApi } from '../hooks/useApi';

export default function StatusBanner({ loading, error }: { loading: boolean; error: string | null }) {
  const { data } = useApi<{ message?: string }>('/');
  if (loading) return <p className="loading">Cargando…</p>;
  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        {data?.message ? <p className="muted">Backend respondió: {data.message}</p> : null}
      </div>
    );
  }
  return null;
}
