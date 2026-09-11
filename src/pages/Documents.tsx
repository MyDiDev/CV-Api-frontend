import React, { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { animateEnter, animateStagger } from "../utils/animations";

interface PreviewDocument {
  url: string;
  index: number;
  filename: string;
}

/**
 * Normalizes document URLs (specifically Cloudinary or CDN URLs) by ensuring HTTPS.
 * This prevents mixed content security blocks and false-positive security warnings
 * when rendering documents in iframes on secure sites.
 */
export const ensureSecureUrl = (url: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://")) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }
  return trimmed;
};

const Documents: React.FC = () => {
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const docCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    animateEnter(headerRef.current);
    animateEnter(formCardRef.current, 0.1);
  }, []);

  useEffect(() => {
    if (docs.length > 0) {
      animateStagger(docCardsRef.current, 0.06);
    }
  }, [docs]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      showToast("Por favor ingresa una API Key válida", "warning");
      return;
    }
    setError("");
    setDocs([]);
    setLoading(true);
    setFetched(false);

    try {
      const data = await api.getDocuments(apiKey.trim());
      const rawUrls = (data?.result?.documents || [])
        .map((row: string[]) => row[0])
        .filter(Boolean);
      const secureUrls = rawUrls.map(ensureSecureUrl);
      setDocs(secureUrls);
      setFetched(true);
      if (secureUrls.length > 0) {
        showToast(
          `Se ${secureUrls.length === 1 ? "encontró 1 documento" : `encontraron ${secureUrls.length} documentos`}`,
          "success",
        );
      } else {
        showToast("No se encontraron documentos para esta API Key", "info");
      }
    } catch (err: any) {
      const msg = err.message || "Error al obtener los documentos";
      setError(msg);
      setFetched(true);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (url: string, index?: number) => {
    try {
      const secureUrl = ensureSecureUrl(url);
      await navigator.clipboard.writeText(secureUrl);
      if (typeof index === "number") {
        setCopiedIdx(index);
        setTimeout(() => setCopiedIdx(null), 2000);
      }
      showToast("Enlace del documento copiado al portapapeles", "success");
    } catch {
      showToast("No se pudo copiar el enlace", "error");
    }
  };

  const getFileName = (url: string) => {
    try {
      const secureUrl = ensureSecureUrl(url);
      const parts = new URL(secureUrl).pathname.split("/");
      return decodeURIComponent(parts[parts.length - 1]);
    } catch {
      return url;
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container mobile-bottom-spacing">
        {/* ─── PAGE HEADER ─── */}
        <div ref={headerRef} className="page-header">
          <h1 className="page-title">Documentos generados</h1>
          <p className="page-desc">
            Reportes PDF creados a partir de evaluaciones de CV, respaldados en
            el CDN
          </p>
        </div>

        {/* ─── API KEY INPUT BAR ─── */}
        <div className="cv-card mb-4" ref={formCardRef}>
          <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
            <p className="section-label" style={{ margin: 0 }}>
              Autenticación con API Key
            </p>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              5 consultas / 5 min
            </span>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginBottom: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Ingresa tu API Key para consultar los documentos y evaluaciones
            asociados a ella.
          </p>

          <form
            onSubmit={handleFetch}
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
              <input
                type="text"
                className="form-control"
                placeholder="Pega tu API Key aquí (ej. cv_live_...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  paddingRight: "2rem",
                }}
                aria-label="API Key para consultar documentos"
              />
            </div>
            <button
              type="submit"
              className="btn-brand"
              disabled={loading}
              style={{ whiteSpace: "nowrap" }}
            >
              {loading && <span className="spinner-brand" aria-hidden="true" />}
              <span>{loading ? "Cargando…" : "Ver documentos"}</span>
            </button>
          </form>
        </div>

        {/* ─── ERROR ALERT ─── */}
        {error && (
          <div className="alert-dark-danger mb-4" role="alert">
            <div className="d-flex align-items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ─── FETCHED CONTENT ─── */}
        {fetched && !error && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <p className="section-label" style={{ margin: 0 }}>
                {docs.length} documento{docs.length !== 1 ? "s" : ""} encontrado
                {docs.length !== 1 ? "s" : ""}
              </p>
              {docs.length > 0 && (
                <span
                  style={{
                    background: "var(--success-dim)",
                    color: "var(--success)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.65rem",
                    borderRadius: 20,
                  }}
                >
                  Almacenados en CDN
                </span>
              )}
            </div>

            {docs.length === 0 ? (
              <div className="cv-card">
                <div className="empty-state">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: "0.75rem" }}
                    aria-hidden="true"
                  >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p
                    className="empty-state-text"
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Aún no hay reportes generados con esta API Key
                  </p>
                  <p className="empty-state-text">
                    Evalúa un CV primero para que los reportes PDF se archiven
                    aquí.
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {docs.map((url, i) => {
                  const fileName = getFileName(url);
                  return (
                    <div
                      className="doc-card"
                      key={i}
                      ref={(el) => {
                        docCardsRef.current[i] = el;
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.85rem",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "var(--radius-md)",
                            background: "var(--brand-primary-dim)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--brand-primary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                              margin: "0 0 0.15rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
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

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          flexShrink: 0,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => {
                            setPreviewDoc({
                              url,
                              index: i,
                              filename: fileName,
                            });
                            setIsPreviewOpen(true);
                          }}
                          title="Vista previa del PDF"
                          style={{
                            padding: "0.35rem 0.65rem",
                            fontSize: "0.8rem",
                            gap: "0.35rem",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span>Vista previa</span>
                        </button>

                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => handleCopy(url, i)}
                          title="Copiar URL directa"
                          style={{
                            padding: "0.35rem 0.65rem",
                            fontSize: "0.8rem",
                            gap: "0.35rem",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>{copiedIdx === i ? "Copiado" : "Copiar"}</span>
                        </button>

                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-brand"
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.8rem",
                            textDecoration: "none",
                            gap: "0.35rem",
                          }}
                        >
                          <span>Abrir</span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ─── INITIAL UNFETCHED STATE ─── */}
        {!fetched && !error && (
          <div
            className="cv-card"
            style={{
              borderStyle: "dashed",
              borderColor: "var(--border-strong)",
              background: "var(--bg-elevated)",
            }}
          >
            <div className="empty-state" style={{ padding: "2.5rem 1rem" }}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: "0.85rem", opacity: 0.9 }}
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "0.3rem",
                }}
              >
                Consulta tus reportes archivados
              </p>
              <p className="empty-state-text">
                Ingresa tu API Key en la barra superior para ver los reportes
                PDF
                <br />
                generados en tus evaluaciones de CV.
              </p>
            </div>
          </div>
        )}

        {/* ─── API INFO BAR ─── */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "0.85rem 1.1rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--info)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <strong style={{ color: "var(--text-secondary)" }}>
              GET /api/curriculum/documents
            </strong>{" "}
            — Rate limit: 5 solicitudes cada 5 minutos por API Key.
          </span>
        </div>

        {/* ─── PDF PREVIEW MODAL ─── */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={
            previewDoc
              ? `Vista previa: Reporte #${previewDoc.index + 1}`
              : "Vista previa de documento"
          }
          size="xl"
          footer={
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => previewDoc && handleCopy(previewDoc.url)}
              >
                Copiar enlace
              </button>
              {previewDoc && (
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-brand"
                >
                  Abrir en pestaña ↗
                </a>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsPreviewOpen(false)}
              >
                Cerrar
              </button>
            </>
          }
        >
          {previewDoc && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.8rem",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={previewDoc.filename}
                >
                  {previewDoc.filename}
                </span>
                <a
                  href={previewDoc.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "var(--info)",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Descargar PDF ⤓
                </a>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "65vh",
                  minHeight: "450px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                <iframe
                  src={previewDoc.url}
                  title={`Previsualización de ${previewDoc.filename}`}
                  width="100%"
                  height="100%"
                  style={{ border: "none", display: "block" }}
                />
              </div>

              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                ¿Problemas para visualizar el archivo? Puedes{" "}
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--brand-primary)" }}
                >
                  abrirlo directamente en tu navegador
                </a>
                .
              </p>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
};

export default Documents;
