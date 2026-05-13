import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

type LogRow = [number, string, number];

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDashboard(token!);
        setLogs(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const totalTokens = logs.reduce((acc, r) => acc + r[0], 0);
  const successCount = logs.filter((r) => r[1] === "done").length;
  const errorCount = logs.length - successCount;
  const avgTime = logs.length
    ? Math.round(logs.reduce((acc, r) => acc + r[2], 0) / logs.length)
    : 0;

  const stats = [
    {
      icon: '',
      value: logs.length,
      label: "Total requests",
      cls: "stat-icon-blue",
    },
    {
      icon: "",
      value: totalTokens.toLocaleString(),
      label: "Tokens usados",
      cls: "stat-icon-accent",
    },
    {
      icon: "",
      value: successCount,
      label: "Exitosas",
      cls: "stat-icon-success",
    },
    {
      icon: "",
      value: `${avgTime} s`,
      label: "Tiempo prom.",
      cls: "stat-icon-warning",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">Estadísticas de uso de tu API Key</p>
        </div>

        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-card">
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
              {Math.round((successCount / logs.length) * 100)}% éxito
            </span>
            {errorCount > 0 && (
              <span
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "0.25rem 0.75rem",
                  borderRadius: 20,
                }}
              >
                {errorCount} error{errorCount > 1 ? "es" : ""}
              </span>
            )}
          </div>
        )}

        <div className="cv-card">
          <h2
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              marginBottom: "1.1rem",
              color: "var(--text-primary)",
            }}
          >
            Historial de solicitudes
          </h2>

          {loading && (
            <div className="empty-state">
              <span
                className="spinner-brand"
                style={{ width: 28, height: 28 }}
              />
            </div>
          )}

          {error && !loading && (
            <div className="alert-dark-danger">{error}</div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="empty-state">
              <p className="empty-state-text">
                Sin solicitudes todavía.
                <br />
                Usa tu API Key para ver el historial aquí.
              </p>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <>
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
                          }}
                        >
                          {logs.length - i}
                        </td>
                        <td>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {row[0].toLocaleString()}
                          </span>
                        </td>
                        <td>
                          {row[1] === "done" ? (
                            <span className="badge-success">success</span>
                          ) : (
                            <span className="badge-error">{row[1]}</span>
                          )}
                        </td>
                        <td style={{ fontFamily: "monospace" }}>{row[2]} s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="log-cards-wrapper">
                {logs.map((row, i) => (
                  <div className="log-card" key={i}>
                    <div className="log-card-row">
                      <span className="log-card-label">
                        Request #{logs.length - i}
                      </span>
                      {row[1] === "success" ? (
                        <span className="badge-success">success</span>
                      ) : (
                        <span className="badge-error">{row[1]}</span>
                      )}
                    </div>
                    <div className="log-card-row">
                      <span className="log-card-label">Tokens</span>
                      <span
                        className="log-card-value"
                        style={{ fontFamily: "monospace" }}
                      >
                        {row[0].toLocaleString()}
                      </span>
                    </div>
                    <div className="log-card-row">
                      <span className="log-card-label">Tiempo</span>
                      <span
                        className="log-card-value"
                        style={{ fontFamily: "monospace" }}
                      >
                        {row[2]} ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
