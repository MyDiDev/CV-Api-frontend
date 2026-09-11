import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* ─── DESKTOP NAVIGATION (>=769px) ─── */}
      <header className="desktop-navbar">
        <NavLink
          to="/dashboard"
          className="navbar-logo"
          aria-label="CV.Api Dashboard"
        >
          CV<span>.</span>Api
        </NavLink>

        <nav aria-label="Navegación principal">
          <ul
            className="navbar-links"
            style={{ display: "flex", margin: 0, padding: 0 }}
          >
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ marginRight: "6px", verticalAlign: "text-bottom" }}
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/api-key"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ marginRight: "6px", verticalAlign: "text-bottom" }}
                >
                  <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-1.5 1.5 1.5 1.5L13 10l-1.5-1.5-1.5 1.5 1.5 1.5-3.5 3.5a5 5 0 1 1-2.83-2.83l9.33-9.33z" />
                </svg>
                API Key
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/documents"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ marginRight: "6px", verticalAlign: "text-bottom" }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Documentos
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                className="navbar-logout"
                onClick={() => setShowLogoutModal(true)}
                aria-label="Cerrar sesión"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Salir</span>
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* ─── MOBILE TOP BRAND BAR (<=768px) ─── */}
      <header className="mobile-navbar-top">
        <NavLink
          to="/dashboard"
          className="navbar-logo"
          aria-label="CV.Api Dashboard"
        >
          CV<span>.</span>Api
        </NavLink>
      </header>

      {/* ─── MOBILE THUMB BOTTOM TAB BAR (<=768px) ─── */}
      <nav className="mobile-tab-bar" aria-label="Navegación móvil">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `mobile-tab-item ${isActive ? "active" : ""}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/api-key"
          className={({ isActive }) =>
            `mobile-tab-item ${isActive ? "active" : ""}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-1.5 1.5 1.5 1.5L13 10l-1.5-1.5-1.5 1.5 1.5 1.5-3.5 3.5a5 5 0 1 1-2.83-2.83l9.33-9.33z" />
          </svg>
          <span>API Key</span>
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) =>
            `mobile-tab-item ${isActive ? "active" : ""}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
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
          <span>Documentos</span>
        </NavLink>

        <button
          type="button"
          className="mobile-tab-item"
          onClick={() => setShowLogoutModal(true)}
          aria-label="Cerrar sesión"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Salir</span>
        </button>
      </nav>

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Cerrar sesión"
        size="sm"
        footer={
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              data-testid="confirm-logout-btn"
              onClick={handleConfirmLogout}
            >
              Cerrar sesión
            </button>
          </div>
        }
      >
        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
          }}
        >
          ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a ingresar
          tus credenciales para acceder.
        </p>
      </Modal>
    </>
  );
};

export default Navbar;
