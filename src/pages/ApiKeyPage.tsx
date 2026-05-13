import React, { useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";

interface UserData {
  id: number;
  username: string;
  password: string;
}

const ApiKeyPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"get" | "create">("get");
  const [successMsg, setSuccessMsg] = useState("");

  const masked = (key: string) =>
    key.slice(0, 8) + "••••••••••••••••••••••••••••••••" + key.slice(-4);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setApiKey("");
    setLoading(true);
    const userData: UserData = jwtDecode(
      localStorage.getItem("cv_api_token") || "",
    );
    try {
      if (mode === "get") {
        const data = await api.getApiKey(userData.username, userData.password);
        setApiKey(data.api_key);
        setSuccessMsg("API Key recuperada correctamente");
      } else {
        const data = await api.createApiKey(
          userData.username,
          userData.password,
        );
        setApiKey(data.api_key);
        setSuccessMsg("API Key creada exitosamente");
      }
      setRevealed(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">API Key</h1>
          <p className="page-desc">
            Gestiona tu clave de acceso para los endpoints de la API
          </p>
        </div>

        <div className="d-grid gap-3">
          <div className="col-12">
            <div className="cv-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "#0d0f14",
                  borderRadius: 8,
                  padding: 3,
                  marginBottom: "1.5rem",
                }}
              >
                {(["get", "create"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setError("");
                      setSuccessMsg("");
                      setApiKey("");
                    }}
                    style={{
                      flex: 1,
                      border: "none",
                      borderRadius: 6,
                      padding: "0.45rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: mode === m ? "#20243280" : "transparent",
                      color: mode === m ? "var(--brand-primary)" : "#6b7280",
                      boxShadow:
                        mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    }}
                  >
                    {m === "get" ? "Ver mi Key" : "Crear nueva Key"}
                  </button>
                ))}
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginBottom: "1.25rem",
                }}
              >
                {mode === "get"
                  ? "Ingresa tus credenciales para recuperar tu API Key existente."
                  : "Crea una nueva API Key. Nota: solo puedes tener una Key activa por usuario."}
              </p>

              {error && (
                <div className="alert alert-danger alert-custom mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  className="btn-brand w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading && <span className="spinner-brand" />}
                  {loading
                    ? "Procesando…"
                    : mode === "get"
                      ? "Obtener API Key"
                      : "Crear API Key"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-12">
            <div className="cv-card h-100">
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Tu API Key
              </h2>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6b7280",
                  marginBottom: "1.25rem",
                }}
              >
                Usa esta clave como Bearer token en el header{" "}
                <code>Authorization</code> de tus requests.
              </p>

              {successMsg && !error && (
                <div className="alert alert-success alert-custom mb-3">
                  {successMsg}
                </div>
              )}

              {apiKey ? (
                <>
                  <div className="apikey-display mb-3">
                    <span
                      className={`apikey-value ${revealed ? "revealed" : ""}`}
                    >
                      {revealed ? apiKey : masked(apiKey)}
                    </span>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn-brand"
                      onClick={() => setRevealed((r) => !r)}
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                    >
                      {revealed ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      className="btn-brand"
                      onClick={handleCopy}
                      style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                    >
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background: "#20243280",
                    borderRadius: 10,
                    padding: "2rem",
                    textAlign: "center",
                    color: "#9ca3af",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    🔑
                  </div>
                  <p style={{ fontSize: "0.875rem", margin: 0 }}>
                    Completa el formulario para ver tu API Key aquí
                  </p>
                </div>
              )}

              {apiKey && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    background: "#20243280",
                    borderRadius: 8,
                    padding: "1rem",
                    fontSize: "0.8rem",
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#fff",
                    }}
                  >
                    Ejemplo de uso
                  </p>
                  <code
                    style={{
                      color: "#6b7280",
                      lineHeight: 1.7,
                      display: "block",
                    }}
                  >
                    curl -X POST https://cv-api-uleg.onrender.com/api/curriculum
                    \<br />
                    &nbsp;&nbsp;-H "Authorization: Bearer {"<"}API_KEY{">"}" \
                    <br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                    &nbsp;&nbsp;-d '&#123;"content": "..."&#125;'
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cv-card mt-4">
          <h2
            style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}
          >
            Límites de uso
          </h2>
          <div className="row g-3">
            {[
              {
                endpoint: "POST /api/curriculum",
                limit: "20 requests",
                window: "cada 15 minutos",
                desc: "Evaluación completa de CV con reporte PDF",
              },
              {
                endpoint: "POST /api/curriculum/quiz",
                limit: "5 requests",
                window: "cada 2 minutos",
                desc: "Quiz de perfil profesional adaptativo",
              },
            ].map((item) => (
              <div className="col-12 col-md-6" key={item.endpoint}>
                <div
                  style={{
                    background: "#20243280",
                    borderRadius: 10,
                    padding: "1rem 1.25rem",
                    borderLeft: "3px solid var(--brand-accent)",
                  }}
                >
                  <code
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--brand-primary)",
                    }}
                  >
                    {item.endpoint}
                  </code>
                  <p
                    style={{
                      margin: "0.4rem 0 0.2rem",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.limit}{" "}
                    <span style={{ color: "#6b7280", fontWeight: 400 }}>
                      {item.window}
                    </span>
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p
            className="mt-3 text-center"
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
            }}
          >
            Para ver documentacion de la API,{" "}
            <a href="https://github.com/MyDiDev/CV-Api">click aqui</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default ApiKeyPage;
