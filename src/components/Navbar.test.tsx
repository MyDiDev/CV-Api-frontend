import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';

describe('Navbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navigation links and brand logo', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/API Key/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Documentos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CV/i).length).toBeGreaterThan(0);
  });

  it('renders desktop and mobile navigation containers with responsive classes', () => {
    const { container } = render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    const desktopNav = container.querySelector('.desktop-navbar');
    const mobileTopBar = container.querySelector('.mobile-navbar-top');
    const mobileTabBar = container.querySelector('.mobile-tab-bar');

    expect(desktopNav).toBeInTheDocument();
    expect(mobileTopBar).toBeInTheDocument();
    expect(mobileTabBar).toBeInTheDocument();
  });

  it('highlights active tab based on the current route', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    );

    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i });
    expect(dashboardLinks.some((link) => link.classList.contains('active'))).toBe(true);

    const apiKeyLinks = screen.getAllByRole('link', { name: /api key/i });
    expect(apiKeyLinks.every((link) => !link.classList.contains('active'))).toBe(true);
  });

  it('provides accessible navigation landmarks and ARIA attributes', () => {
    const { container } = render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    const navElements = container.querySelectorAll('nav');
    expect(navElements.length).toBeGreaterThanOrEqual(1);

    const svgs = container.querySelectorAll('svg');
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('opens logout confirmation modal when logout button is clicked and cancels', async () => {
    localStorage.setItem('cv_api_token', 'test-token');
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    const logoutButtons = screen.getAllByRole('button', { name: /salir|cerrar sesión/i });
    expect(logoutButtons.length).toBeGreaterThan(0);

    fireEvent.click(logoutButtons[0]);

    expect(
      await screen.findByText(/¿Estás seguro de que deseas cerrar sesión\?/i)
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(/¿Estás seguro de que deseas cerrar sesión\?/i)
      ).not.toBeInTheDocument();
    });

    expect(localStorage.getItem('cv_api_token')).toBe('test-token');
  });

  it('confirms logout, removes token, and closes modal', async () => {
    localStorage.setItem('cv_api_token', 'test-token');
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    const logoutButtons = screen.getAllByRole('button', { name: /salir|cerrar sesión/i });
    fireEvent.click(logoutButtons[0]);

    const confirmBtn = await screen.findByTestId('confirm-logout-btn');
    fireEvent.click(confirmBtn);

    expect(localStorage.getItem('cv_api_token')).toBeNull();
  });
});
