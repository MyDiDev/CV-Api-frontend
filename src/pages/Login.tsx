import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { animateEnter } from "../utils/animations";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateEnter(cardRef.current);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      const msg = "Por favor ingresa tu usuario y contraseña";
      setError(msg);
      showToast(msg, "warning");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      login(data.access_token);
      showToast("¡Inicio de sesión exitoso!", "success");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Error al iniciar sesión";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* ─── BRAND SHOWCASE (DESKTOP) ─── */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          CV<span>.</span>Api
        </div>
        <p className="auth-brand-tagline">
          Bienvenido de vuelta. Accede a tu panel para gestionar evaluaciones de
          CV y tu API Key.
        </p>
        <ul className="auth-brand-features">
          <li>Análisis inteligente de CVs con IA</li>
          <li>Generación automática de cuestionarios técnicos</li>
          <li>Gestión segura de API Keys para desarrolladores</li>
        </ul>
      </div>

      {/* ─── FORM AREA (RESPONSIVE) ─── */}
      <div className="auth-form-area">
        <div className="auth-form-inner" ref={cardRef}>
          {/* Mobile brand logo header */}
          <div className="d-md-none text-center mb-4">
            <div className="auth-brand-logo" style={{ fontSize: "1.85rem" }}>
              CV<span>.</span>Api
            </div>
            <p className="text-muted small mt-1 mb-0">
              Evaluación de CVs con Inteligencia Artificial
            </p>
          </div>

          <h1 className="auth-title">Iniciar sesión</h1>
          <p className="auth-subtitle">
            Ingresa tus credenciales para continuar
          </p>

          {error && (
            <div className="alert alert-danger alert-custom mb-3" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="login-username" className="form-label">
                Usuario
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                className="form-control"
                placeholder="tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label">
                Contraseña
              </label>
              <div className="position-relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn border-0 p-0 position-absolute"
                  style={{
                    right: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 4,
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  title={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
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
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-brand w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading && <span className="spinner-brand" aria-hidden="true" />}
              {loading ? (
                "Iniciando sesión…"
              ) : (
                <>
                  <span>Iniciar sesión</span>
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
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p
            className="text-center mt-4 mb-0"
            style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
          >
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              style={{ color: "var(--brand-primary)", fontWeight: 600 }}
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
