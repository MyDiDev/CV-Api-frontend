import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App Authentication Views", () => {
  it("renders login view by default with form controls", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^usuario$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mostrar contraseña/i })).toBeInTheDocument();
  });

  it("toggles password visibility when toggle button is clicked", async () => {
    render(<App />);
    const passwordInput = screen.getByLabelText(/^contraseña$/i);
    const toggleBtn = screen.getByRole("button", { name: /mostrar contraseña/i });

    expect(passwordInput).toHaveAttribute("type", "password");

    await userEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /ocultar contraseña/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /ocultar contraseña/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("navigates to register view when clicking register link", async () => {
    render(<App />);
    const registerLink = screen.getByRole("link", { name: /regístrate gratis/i });
    await userEvent.click(registerLink);

    expect(screen.getByRole("heading", { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^usuario$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirmar contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear cuenta/i })).toBeInTheDocument();
  });
});
