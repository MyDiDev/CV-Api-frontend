import React, { useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';

const Documents: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDocs([]);
    setLoading(true);
    setFetched(false);
    try {
      const data = await api.getDocuments(apiKey.trim());
      const urls = (data.result.documents || []).map((row: string[]) => row[0]).filter(Boolean);
      setDocs(urls);
      setFetched(true);
    } catch (err: any) {
      setError(err.message);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url: string, i: number) => {
    await navigator.clipboard.writeText(url);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getFileName = (url: string) => {
    try {
      const parts = new URL(url).pathname.split('/');
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return url;
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Documentos generados</h1>
          <p className="page-desc">
            Reportes PDF creados a partir de evaluaciones de CV, almacenados en el CDN
          </p>
        </div>

        <div className="cv-card mb-4">
          <p className="section-label" style={{ marginBottom: '0.6rem' }}>
            Autenticación
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.1rem' }}>
            Ingresa tu API Key para consultar los documentos asociados a ella. Límite: 5 consultas cada 5 minutos.
          </p>
          <form onSubmit={handleFetch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Pega tu API Key aquí…"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                required
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn-brand"
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading && <span className="spinner-brand" />}
              {loading ? 'Cargando…' : 'Ver documentos'}
            </button>
          </form>
        </div>

        {error && (
          <div className="alert-dark-danger mb-3">{error}</div>
        )}

        {fetched && !error && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <p className="section-label" style={{ margin: 0 }}>
                {docs.length} documento{docs.length !== 1 ? 's' : ''} encontrado{docs.length !== 1 ? 's' : ''}
              </p>
              {docs.length > 0 && (
                <span style={{
                  background: 'var(--success-dim)',
                  color: 'var(--success)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: 20,
                }}>
                Archivos en el CDN
                </span>
              )}
            </div>

            {docs.length === 0 ? (
              <div className="cv-card">
                <div className="empty-state">
                  <div className="empty-state-icon">📂</div>
                  <p className="empty-state-text">
                    Aún no hay reportes generados con esta API Key.<br />
                    Evalúa un CV primero para ver sus documentos aquí.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {docs.map((url, i) => {
                  const fileName = getFileName(url);
                  return (
                    <div className="doc-card" key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
                        {/* <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: 'var(--accent-dim)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}>
                        </div> */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            Reporte #{i + 1}
                          </p>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="doc-url"
                            title={url}
                          >
                            {fileName}
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          className="btn-ghost"
                          onClick={() => handleCopy(url, i)}
                          title="Copiar URL"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          {copiedIdx === i ? 'Copiado' : 'Copiar'}
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-brand"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', textDecoration: 'none' }}
                        >
                          Abrir
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!fetched && (
          <div className="cv-card" style={{ borderStyle: 'dashed', opacity: 0.6 }}>
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">🗂️</div>
              <p className="empty-state-text">
                Ingresa tu API Key arriba para ver los reportes PDF<br />
                generados en tus evaluaciones de CV.
              </p>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <span>
            <strong style={{ color: 'var(--text-secondary)' }}>GET /api/curriculum/documents</strong>
            {' '}— Rate limit: 5 solicitudes cada 5 minutos por API Key.
          </span>
        </div>
      </div>
    </>
  );
};

export default Documents;
