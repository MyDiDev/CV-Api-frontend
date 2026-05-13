import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-navbar">
      <NavLink to="/dashboard" className="navbar-logo">
        CV<span>.</span>Api
      </NavLink>

      <ul className="navbar-links" style={{ display: 'flex' }}>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/api-key" className={({ isActive }) => isActive ? 'active' : ''}>
            API Key
          </NavLink>
        </li>
        <li>
          <NavLink to="/documents" className={({ isActive }) => isActive ? 'active' : ''}>
            Documents
          </NavLink>
        </li>
        <li>
          <button className="navbar-logout" onClick={handleLogout}>
            Salir
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;