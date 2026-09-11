# UI & UX Flow Upgrade Design Specification

## Overview
This specification details the comprehensive overhaul of the `cv-api-client` frontend. The goal is to transform the user interface into a modern developer SaaS product with a dark-first aesthetic, sleek typography, subtle GSAP animations, a global toast notification and modal popup system, and a mobile-first responsive layout.

---

## 1. Design System & Tokens

### 1.1 Typography
- **Primary Font**: `Plus Jakarta Sans`, sans-serif (Google Fonts) for headings, body text, buttons, and navigation.
- **Monospace Font**: `JetBrains Mono`, monospace (Google Fonts) for code snippets, API keys, and metrics values.

### 1.2 Color Palette (`src/index.css`)
- **Backgrounds**:
  - Base: `#090a0f`
  - Surface: `#11141d`
  - Elevated: `#181c28`
  - Hover: `#22283a`
  - Glass: `rgba(17, 20, 29, 0.75)` with `backdrop-filter: blur(12px)`
- **Accents**:
  - Primary Brand (Electric Indigo): `#6366f1`, hover `#4f46e5`, dim `rgba(99, 102, 241, 0.15)`
  - Success (Emerald): `#10b981`, dim `rgba(16, 185, 129, 0.12)`
  - Warning (Amber): `#f59e0b`, dim `rgba(245, 158, 11, 0.12)`
  - Danger (Crimson): `#ef4444`, dim `rgba(239, 68, 68, 0.12)`
  - Info (Sky Blue): `#38bdf8`, dim `rgba(56, 189, 248, 0.12)`
- **Borders & Dividers**:
  - Standard: `rgba(255, 255, 255, 0.08)`
  - Strong: `rgba(255, 255, 255, 0.16)`
  - Glow: `rgba(99, 102, 241, 0.35)`

---

## 2. Navigation Architecture

### 2.1 Dual-Mode Responsive Navigation (`src/components/Navbar.tsx`)
- **Desktop (`≥768px`)**:
  - Sticky glass header (`position: sticky; top: 0; z-index: 1000;`).
  - Brand logo with glowing dot accent.
  - Active navigation pill indicators (`/dashboard`, `/api-key`, `/documents`).
  - User session info and logout button with icon.
- **Mobile (`<768px`)**:
  - Top minimal header displaying logo, active page title, and logout button.
  - Fixed bottom tab navigation bar (`position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;`):
    - 📊 **Dashboard** (`/dashboard`)
    - 🔑 **API Key** (`/api-key`)
    - 📁 **Documentos** (`/documents`)
  - Safe-area-inset padding for mobile home bars.

---

## 3. Motion & Interaction Systems

### 3.1 GSAP Animation Foundation (`src/utils/animations.ts`)
- **Dependency**: `gsap`
- **Animation Helpers**:
  - `animateEnter(target, delay)`: Smooth entrance with `opacity: 0 -> 1` and `y: 16 -> 0` (`duration: 0.35s, ease: "power2.out"`).
  - `animateStagger(targets, stagger)`: Staggers entry for stat cards, document list items, and table rows.
  - `animateModal(backdrop, dialog, isOpening, onComplete)`: Backdrop fade with spring-like scale entrance (`scale: 0.94 -> 1`).

### 3.2 Global Toast Notification System (`src/context/ToastContext.tsx` & `src/components/ToastContainer.tsx`)
- Exposes `useToast()` hook with `showToast(message, type, duration)`.
- Types: `success`, `error`, `warning`, `info`.
- Floating notification pill with status icon, title/message, auto-dismiss countdown bar (3.5s), and GSAP slide-in/out animations.
- Positioned top-right on desktop, top-center on mobile.

### 3.3 Reusable Modal / Popup Component (`src/components/Modal.tsx`)
- Accessible dialog supporting backdrop blur, escape-key closing, backdrop-click dismiss, and body scroll lock.
- Used for:
  - API Key creation confirmation.
  - Document details and PDF preview modal.
  - Logout confirmation on mobile.

---

## 4. Page Enhancements

### 4.1 Authentication (`Login.tsx`, `Register.tsx`)
- Modernized dual-pane desktop / single-pane mobile layout.
- Floating label input fields with glow focus state.
- Button states with loading spinners and error feedback via toast notifications.

### 4.2 Dashboard (`Dashboard.tsx`)
- 4 Grid Stat Cards with icons (Total Requests, Tokens Used, Success Rate %, Avg Response Time).
- Responsive table for desktop and styled cards for mobile view.
- Refresh trigger button with rotation transition.

### 4.3 API Key (`ApiKeyPage.tsx`)
- Segmented toggle tab control with smooth sliding active background.
- Masked key display with copy-to-clipboard button and instant toast feedback.
- Interactive cURL snippet box with one-click copy.
- Structured rate limit cards.

### 4.4 Documents (`Documents.tsx`)
- Clean input bar for API Key querying.
- Document list cards with direct copy link, external open, and inline preview modal.
- Empty states with SVG iconography.
