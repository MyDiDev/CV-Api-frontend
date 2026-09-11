import React, { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { animateEnter, animateStagger } from "../utils/animations";

interface DecodedToken {
  id?: number;
  username?: string;
  password?: string;
}

const ApiKeyPage: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [mode, setMode] = useState<"get" | "create">("get");
  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const keyCardRef = useRef<HTMLDivElement>(null);
  const rateCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    animateEnter(headerRef.current);
    animateEnter(mainCardRef.current, 0.1);
    animateEnter(keyCardRef.current, 0.15);
    if (rateCardsRef.current.length > 0) {
      animateStagger(rateCardsRef.current, 0.08);
    }
  }, []);

  const masked = (key: string) => {
    if (!key) return "";
    if (key.length <= 12) return "••••••••••••••••";
    return key.slice(0, 8) + "••••••••••••••••••••••••••••••••" + key.slice(-4);
  };

  const getCredentialsFromToken = (): { username: string; password: string } => {
    const rawToken = token || localStorage.getItem("cv_api_token") || "";
    if (!rawToken) {
      throw new Error("No hay una sesión activa. Por favor, inicia sesión nuevamente.");
    }
    const decoded = jwtDecode<DecodedToken>(rawToken);
    if (!decoded.username || !decoded.password) {
      throw new Error(
        "No se encontraron credenciales en el token. Por favor, inicia sesión nuevamente."
      );
    }
    return { username: decoded.username, password: decoded.password };
  };

  const handleFetchKey = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { username, password } = getCredentialsFromToken();
      const data = await api.getApiKey(username, password);
      setApiKey(data.api_key);
      setRevealed(false);
      setSuccessMsg("API Key recuperada correctamente");
      showToast("API Key recuperada con éxito", "success");
    } catch (err: any) {
      const msg = err.message || "No se pudo obtener la API Key";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    setShowConfirmModal(false);
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      const { username, password } = getCredentialsFromToken();
      const data = await api.createApiKey(username, password);
      setApiKey(data.api_key);
      setRevealed(false);
      setSuccessMsg("API Key creada exitosamente");
      showToast("¡Nueva API Key generada con éxito!", "success");
    } catch (err: any) {
      const msg = err.message || "No se pudo crear la API Key";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "get") {
      handleFetchKey();
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleCopyKey = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      showToast("API Key copiada al portapapeles", "success");
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      showToast("No se pudo copiar la API Key", "error");
    }
  };

  const curlSnippet = `curl -X POST https://cv-api-uleg.onrender.com/api/curriculum \\
  -H "Authorization: Bearer ${apiKey || "<TU_API_KEY>"}" \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Ingeniero de Software con 5 años de experiencia..."}'`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlSnippet);
      setCopiedCurl(true);
      showToast("Comando cURL copiado al portapapeles", "success");
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch {
      showToast("No se pudo copiar el comando cURL", "error");
    }
  };

  const rateLimits = [
    {
      endpoint: "POST /api/curriculum",
      limit: "20 requests",
      window: "cada 15 minutos",
      desc: "Evaluación completa de CV con reporte PDF y guardado en CDN",
      badge: "Evaluación",
    },
    {
      endpoint: "POST /api/curriculum/quiz",
      limit: "5 requests",
      window: "cada 2 minutos",
      desc: "Generación de cuestionario técnico adaptativo según perfil",
      badge: "Quiz",
    },
    {
      endpoint: "GET /api/curriculum/documents",
      limit: "5 requests",
      window: "cada 5 minutos",
      desc: "Consulta de documentos y reportes generados con tu API Key",
      badge: "Documentos",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="page-container mobile-bottom-spacing">
        {/* ─── PAGE HEADER ─── */}
        <div ref={headerRef} className="page-header">
          <h1 className="page-title">API Key</h1>
          <p className="page-desc">
            Gestiona tu clave de acceso para autenticar solicitudes a la API de evaluación
          </p>
        </div>

        <div className="row g-4">
          {/* ─── ACTION PANEL (GET / CREATE) ─── */}
          <div className="col-12 col-lg-5">
            <div className="cv-card h-100" ref={mainCardRef}>
              <p className="section-label mb-2">Modo de operación</p>
              
              {/* Segmented Mode Toggle Pill */}
              <div className="mode-toggle mb-3" role="tablist" aria-label="Modo de API Key">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "get"}
                  className={`mode-toggle-btn ${mode === "get" ? "active" : ""}`}
                  onClick={() => {
                    setMode("get");
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  Ver mi Key
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "create"}
                  className={`mode-toggle-btn ${mode === "create" ? "active" : ""}`}
                  onClick={() => {
                    setMode("create");
                    setError("");
                    setSuccessMsg("");
                  }}
                >
                  Crear nueva Key
                </button>
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                }}
              >
                {mode === "get"
                  ? "Recupera tu API Key activa vinculada a tu cuenta de usuario actual."
                  : "Genera una nueva API Key. Ten en cuenta que reemplazarás la clave anterior si ya tenías una activa."}
              </p>

              {error && (
                <div className="alert-dark-danger mb-3" role="alert">
                  {error}
                </div>
              )}

              {successMsg && !error && (
                <div className="alert-dark-success mb-3" role="status">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleActionClick}>
                <button
                  type="submit"
                  className="btn-brand w-100"
                  disabled={loading}
                >
                  {loading && <span className="spinner-brand" aria-hidden="true" />}
                  <span>
                    {loading
                      ? "Procesando…"
                      : mode === "get"
                        ? "Obtener mi API Key"
                        : "Crear nueva API Key"}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* ─── KEY DISPLAY & INTEGRATION DETAILS ─── */}
          <div className="col-12 col-lg-7">
            <div className="cv-card h-100" ref={keyCardRef}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h2
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  Tu API Key
                </h2>
                {apiKey && (
                  <span
                    style={{
                      background: "var(--success-dim)",
                      color: "var(--success)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    Activa
                  </span>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginBottom: "1.25rem",
                }}
              >
                Usa esta clave como Bearer token en el header{" "}
                <code style={{ color: "var(--brand-primary)" }}>Authorization</code> de tus peticiones.
              </p>

              {apiKey ? (
                <>
                  {/* Key Display Box */}
                  <div className="apikey-display mb-3">
                    <span
                      className={`apikey-value ${revealed ? "revealed" : ""}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: revealed ? "0.03em" : "0.08em",
                      }}
                    >
                      {revealed ? apiKey : masked(apiKey)}
                    </span>
                  </div>

                  {/* Actions for API Key */}
                  <div className="d-flex gap-2 flex-wrap mb-4">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setRevealed((r) => !r)}
                      aria-label={revealed ? "Ocultar API Key" : "Mostrar API Key"}
                    >
                      {revealed ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
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
                          <span>Mostrar</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn-brand"
                      onClick={handleCopyKey}
                      aria-label="Copiar API Key"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>{copiedKey ? "¡Copiado!" : "Copiar Key"}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className="empty-state mb-4"
                  style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    padding: "2.5rem 1.5rem",
                    border: "1px dashed var(--border-strong)",
                  }}
                >
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--brand-primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: "0.75rem", opacity: 0.85 }}
                    aria-hidden="true"
                  >
                    <path d="M21 2l-2 2m-1.5 1.5L16 7m-1.5 1.5L13 10m-3-3l-7 7v4h4l7-7m-4-4l4 4" />
                    <circle cx="7.5" cy="16.5" r="1.5" />
                  </svg>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Ninguna API Key mostrada
                  </p>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    Haz clic en <strong>Ver mi Key</strong> o <strong>Crear nueva Key</strong> para
                    obtener tu token.
                  </p>
                </div>
              )}

              {/* ─── INTERACTIVE CURL SNIPPET BOX ─── */}
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="section-label" style={{ margin: 0 }}>
                    Ejemplo de solicitud cURL
                  </span>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={handleCopyCurl}
                    style={{
                      padding: "0.3rem 0.65rem",
                      fontSize: "0.75rem",
                      gap: "0.35rem",
                    }}
                    aria-label="Copiar comando cURL"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{copiedCurl ? "¡Copiado!" : "Copiar cURL"}</span>
                  </button>
                </div>

                <pre className="code-block" tabIndex={0} aria-label="Código de ejemplo cURL">
                  <code>{curlSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RATE LIMITS SECTION ─── */}
        <div className="cv-card mt-4">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "0.2rem",
                }}
              >
                Límites de uso y Rate Limits
              </h2>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Restricciones de consumo por API Key para garantizar estabilidad
              </p>
            </div>
            <a
              href="https://github.com/MyDiDev/CV-Api"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}
            >
              Documentación completa ↗
            </a>
          </div>

          <div className="row g-3">
            {rateLimits.map((item, idx) => (
              <div className="col-12 col-md-4" key={item.endpoint}>
                <div
                  ref={(el) => {
                    rateCardsRef.current[idx] = el;
                  }}
                  style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    padding: "1.1rem",
                    border: "1px solid var(--border)",
                    borderLeft: "3px solid var(--brand-primary)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--brand-primary)",
                        }}
                      >
                        {item.badge}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.window}
                      </span>
                    </div>

                    <code
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.endpoint}
                    </code>

                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "0.85rem",
                      paddingTop: "0.6rem",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Máximo:
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: "var(--success)",
                      }}
                    >
                      {item.limit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CONFIRMATION MODAL BEFORE CREATING NEW API KEY ─── */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirmar creación de API Key"
          size="md"
          footer={
            <>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-brand"
                onClick={handleCreateKey}
              >
                Sí, crear nueva Key
              </button>
            </>
          }
        >
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-start gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--warning-dim)",
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
                  stroke="var(--warning)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <div>
                <p
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    marginBottom: "0.35rem",
                  }}
                >
                  ¿Deseas generar una nueva API Key?
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Al generar una nueva API Key, cualquier clave previamente asignada a tu
                  cuenta será invalidada. Todas tus aplicaciones o llamadas que utilicen la clave
                  anterior deberán actualizarse con la nueva clave.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </main>
    </>
  );
};

export default ApiKeyPage;

