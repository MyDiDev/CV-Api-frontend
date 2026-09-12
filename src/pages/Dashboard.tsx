import React, { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import { animateEnter, animateStagger } from "../utils/animations";

type LogRow = [number, string, number];

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const statCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const historyCardRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (!token) return;
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const data = await api.getDashboard(token);
        setLogs(data.data || []);
        if (isManualRefresh) {
          showToast("Métricas actualizadas correctamente", "success");
        }
      } catch (err: any) {
        const msg = err.message || "Error al cargar el dashboard";
        setError(msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, showToast],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Entrance animations on mount
  useEffect(() => {
    animateEnter(headerRef.current);
    if (statCardsRef.current.length > 0) {
      animateStagger(statCardsRef.current, 0.08);
    }
    animateEnter(historyCardRef.current, 0.2);
  }, []);

  // Compute metrics
  const totalRequests = logs.length;
  const totalTokens = logs.reduce(
    (acc, r) => acc + (typeof r[0] === "number" ? r[0] : 0),
    0,
  );
  const successCount = logs.filter(
    (r) => r[1] === "done" || r[1] === "success",
  ).length;
  const errorCount = totalRequests - successCount;
  const successPercentage = totalRequests
    ? Math.round((successCount / totalRequests) * 100)
    : 0;
  const avgTime = totalRequests
    ? Math.round(
        logs.reduce(
          (acc, r) => acc + (typeof r[2] === "number" ? r[2] : 0),
          0,
        ) / totalRequests,
      )
    : 0;

  const stats = [
    {
      id: "total-requests",
      label: "Total requests",
      value: totalRequests.toLocaleString(),
      cls: "stat-icon-primary",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--info)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "tokens-used",
      label: "Tokens usados",
      value: totalTokens.toLocaleString(),
      cls: "stat-icon-accent",
      icon: (
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
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      ),
    },
    {
      id: "success-rate",
      label: "Exitosas",
      value: `${successPercentage}%`,
      cls: "stat-icon-success",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: "avg-time",
      label: "Tiempo prom.",
      value: `${avgTime}s`,
      cls: "stat-icon-warning",
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="page-container mobile-bottom-spacing">
        {/* ─── HEADER & REFRESH ACTION ─── */}
        <div
          ref={headerRef}
          className="page-header d-flex align-items-center justify-content-between flex-wrap gap-3"
        >
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-desc">
              Estadísticas de uso de tu API Key y telemetría
            </p>
          </div>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            aria-label="Actualizar métricas"
            title="Actualizar datos del dashboard"
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
              style={{
                animation: refreshing ? "spin 0.7s linear infinite" : "none",
                transformOrigin: "center",
              }}
              aria-hidden="true"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Actualizando…" : "Actualizar"}</span>
          </button>
        </div>

        {/* ─── 4 STAT CARDS ─── */}
        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div className="col-6 col-md-3" key={s.id}>
              <div
                className="stat-card"
                ref={(el) => {
                  statCardsRef.current[i] = el;
                }}
              >
                <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── SUMMARY BADGES ─── */}
        {logs.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "var(--success-dim)",
                color: "var(--success)",
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.25rem 0.75rem",
                borderRadius: 20,
              }}
            >
              {successPercentage}% éxito ({successCount}/{totalRequests})
            </span>
            {errorCount > 0 && (
              <span
                style={{
                  background: "var(--danger-dim)",
                  color: "var(--danger)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.75rem",
                  borderRadius: 20,
                }}
              >
                {errorCount} {errorCount === 1 ? "error" : "errores"}
              </span>
            )}
          </div>
        )}

        {/* ─── TELEMETRY TABLE / CARDS ─── */}
        <div className="cv-card" ref={historyCardRef}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Historial de solicitudes
            </h2>
            {logs.length > 0 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {logs.length} registros
              </span>
            )}
          </div>

          {loading && (
            <div className="empty-state">
              <span
                className="spinner-brand"
                style={{ width: 28, height: 28 }}
              />
              <p className="empty-state-text mt-3">Cargando telemetría…</p>
            </div>
          )}

          {error && !loading && (
            <div className="alert-dark-danger mb-3">{error}</div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--text-muted)", marginBottom: "1rem" }}
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
              <p
                className="empty-state-text"
                style={{
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                Sin solicitudes todavía
              </p>
              <p className="empty-state-text">
                Usa tu API Key para evaluar CVs o generar cuestionarios y ver la
                telemetría aquí.
              </p>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="log-table-wrapper">
                <table className="log-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tokens</th>
                      <th>Estado</th>
                      <th>Tiempo resp.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((row, i) => (
                      <tr key={i}>
                        <td
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          #{logs.length - i}
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {typeof row[0] === "number"
                              ? row[0].toLocaleString()
                              : row[0]}
                          </span>
                        </td>
                        <td>
                          {row[1] === "done" || row[1] === "success" ? (
                            <span className="badge-success">done</span>
                          ) : (
                            <span className="badge-error">{row[1]}</span>
                          )}
                        </td>
                        <td style={{ fontFamily: "var(--font-mono)" }}>
                          {row[2]}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="log-cards-wrapper">
                {logs.map((row, i) => (
                  <div className="log-card" key={i}>
                    <div className="log-card-row">
                      <span className="log-card-label">
                        Solicitud #{logs.length - i}
                      </span>
                      {row[1] === "done" || row[1] === "success" ? (
                        <span className="badge-success">done</span>
                      ) : (
                        <span className="badge-error">{row[1]}</span>
                      )}
                    </div>
                    <div className="log-card-row">
                      <span className="log-card-label">Tokens</span>
                      <span
                        className="log-card-value"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {typeof row[0] === "number"
                          ? row[0].toLocaleString()
                          : row[0]}
                      </span>
                    </div>
                    <div className="log-card-row">
                      <span className="log-card-label">Tiempo de resp.</span>
                      <span
                        className="log-card-value"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {row[2]}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Dashboard;
