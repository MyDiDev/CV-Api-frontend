import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { animateEnter } from "../utils/animations";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    animateEnter(cardRef.current);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      const msg = "Las contraseñas no coinciden";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    setLoading(true);
    try {
      await api.register(username, password);
      setSuccess(true);
      showToast("¡Cuenta creada con éxito! Redirigiendo al inicio de sesión…", "success");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      const msg = err.message || "Error al registrar la cuenta";
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
          Evalúa currículums con inteligencia artificial. Obtén diagnósticos
          precisos y reportes detallados en segundos.
        </p>
        <ul className="auth-brand-features">
          <li>Evaluación automatizada y benchmarking de candidatos</li>
          <li>Generación de preguntas técnicas personalizadas</li>
          <li>Acceso completo a la API para tus flujos y sistemas</li>
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
              Crea tu cuenta gratuita para comenzar
            </p>
          </div>

          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">
            Comienza a evaluar CVs con IA hoy mismo
          </p>

          {error && (
            <div className="alert alert-danger alert-custom mb-3" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-custom mb-3" role="alert">
              Cuenta creada con éxito. Redirigiendo al login…
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="reg-username" className="form-label">
                Usuario
              </label>
              <input
                id="reg-username"
                name="username"
                type="text"
                className="form-control"
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                disabled={loading || success}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="reg-password" className="form-label">
                Contraseña
              </label>
              <div className="position-relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading || success}
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
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
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

            <div className="mb-4">
              <label htmlFor="reg-confirm" className="form-label">
                Confirmar contraseña
              </label>
              <div className="position-relative">
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  className="form-control pe-5"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={loading || success}
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
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  title={showConfirm ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  tabIndex={-1}
                >
                  {showConfirm ? (
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
              disabled={loading || success}
            >
              {loading && <span className="spinner-brand" aria-hidden="true" />}
              {loading ? (
                "Creando cuenta…"
              ) : (
                <>
                  <span>Crear cuenta</span>
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p
            className="text-center mt-4 mb-0"
            style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
          >
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              style={{ color: "var(--brand-primary)", fontWeight: 600 }}
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
