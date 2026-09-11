# UI & UX Flow Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the frontend UI/UX into a modern developer SaaS product with dark-first design tokens, Google fonts (*Plus Jakarta Sans* & *JetBrains Mono*), GSAP animations, a global Toast notification system, an accessible Modal dialog, a mobile-first dual-mode navigation bar, and upgraded page layouts.

**Architecture:** A foundation layer of design tokens in `index.css` and Google fonts in `index.html`, followed by GSAP animation utilities and context providers (`ToastContext`, `Modal`). The navigation component (`Navbar`) provides dual-mode desktop sticky header and mobile bottom tab navigation. Page components are refactored to consume the new design system, toast feedback, and modal dialogs.

**Tech Stack:** React 19, TypeScript, GSAP, React Router v7, React Bootstrap, Google Fonts.

**Spec:** `docs/superpowers/specs/2026-09-10-ui-ux-upgrade-design.md`

## Global Constraints
- Target platform: Modern web browsers (mobile & desktop).
- Styling: Standard CSS variables + React Bootstrap utility classes, maintaining `--bg-base: #090a0f` dark aesthetic.
- Fonts: `Plus Jakarta Sans` for UI text, `JetBrains Mono` for code and telemetry data.
- Animation library: `gsap` for smooth 60fps micro-interactions and transitions.

---

### Task 1: Dependencies, Typography & Design Tokens Setup

**Files:**
- Modify: `package.json`
- Modify: `public/index.html`
- Modify: `src/index.css`

**Interfaces:**
- Produces: CSS custom properties (`--bg-base`, `--bg-surface`, `--brand-primary`, etc.) and font definitions available globally.

- [ ] **Step 1: Install gsap and types**

Run:
```bash
npm install gsap @types/gsap
```

- [ ] **Step 2: Update public/index.html with Google Fonts**

Add the preconnect and font stylesheet link for `Plus Jakarta Sans` and `JetBrains Mono` in `public/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Update src/index.css with complete Design System Tokens & Base Reset**

Replace the root styles in `src/index.css` with the updated color palette, typography definitions, mobile utilities, glassmorphism classes, and button styles.

- [ ] **Step 4: Verify build succeeds**

Run:
```bash
npm run build
```
Expected: Build passes without CSS or dependency errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json public/index.html src/index.css
git commit -m "feat: setup design tokens, google fonts, and gsap dependencies"
```

---

### Task 2: GSAP Animation Utilities

**Files:**
- Create: `src/utils/animations.ts`
- Create: `src/utils/animations.test.ts`

**Interfaces:**
- Produces:
  - `animateEnter(element: HTMLElement | null, delay?: number): gsap.core.Tween | undefined`
  - `animateStagger(elements: (HTMLElement | null)[], stagger?: number): gsap.core.Tween | undefined`
  - `animateModalOpen(backdrop: HTMLElement | null, dialog: HTMLElement | null): void`
  - `animateModalClose(backdrop: HTMLElement | null, dialog: HTMLElement | null, onComplete?: () => void): void`

- [ ] **Step 1: Write test for animation helper presence and safety**

Create `src/utils/animations.test.ts`:
```typescript
import { animateEnter, animateStagger, animateModalOpen, animateModalClose } from './animations';

describe('Animation utilities', () => {
  it('handles null elements safely without throwing', () => {
    expect(() => animateEnter(null)).not.toThrow();
    expect(() => animateStagger([])).not.toThrow();
    expect(() => animateModalOpen(null, null)).not.toThrow();
    expect(() => animateModalClose(null, null)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:
```bash
npm test -- src/utils/animations.test.ts --watchAll=false
```
Expected: FAIL due to missing module `./animations`.

- [ ] **Step 3: Implement src/utils/animations.ts**

Write `src/utils/animations.ts` with GSAP methods ensuring null-checks:
```typescript
import gsap from 'gsap';

export const animateEnter = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.35, delay, ease: 'power2.out' }
  );
};

export const animateStagger = (elements: (HTMLElement | null)[], stagger: number = 0.08) => {
  const validElements = elements.filter(Boolean) as HTMLElement[];
  if (!validElements.length) return;
  return gsap.fromTo(
    validElements,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.3, stagger, ease: 'power2.out' }
  );
};

export const animateModalOpen = (backdrop: HTMLElement | null, dialog: HTMLElement | null) => {
  if (backdrop) {
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
  }
  if (dialog) {
    gsap.fromTo(
      dialog,
      { opacity: 0, scale: 0.94, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.4)' }
    );
  }
};

export const animateModalClose = (
  backdrop: HTMLElement | null,
  dialog: HTMLElement | null,
  onComplete?: () => void
) => {
  const tl = gsap.timeline({ onComplete });
  if (dialog) {
    tl.to(dialog, { opacity: 0, scale: 0.96, duration: 0.18, ease: 'power2.in' }, 0);
  }
  if (backdrop) {
    tl.to(backdrop, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0);
  }
  if (!dialog && !backdrop && onComplete) {
    onComplete();
  }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm test -- src/utils/animations.test.ts --watchAll=false
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/animations.ts src/utils/animations.test.ts
git commit -m "feat: add gsap animation utility functions"
```

---

### Task 3: Global Toast Notification System

**Files:**
- Create: `src/context/ToastContext.tsx`
- Create: `src/components/ToastContainer.tsx`
- Create: `src/context/ToastContext.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces:
  - `ToastProvider`: React Context Provider wrapping the app.
  - `useToast()` hook returning `{ showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void }`

- [ ] **Step 1: Write unit test for ToastContext**

Create `src/context/ToastContext.test.tsx`:
```typescript
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastContext';

const TestComponent = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Test success message', 'success')}>
      Trigger Toast
    </button>
  );
};

describe('ToastContext', () => {
  it('renders and triggers a toast notification', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Trigger Toast');
    await userEvent.click(button);

    expect(screen.getByText('Test success message')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:
```bash
npm test -- src/context/ToastContext.test.tsx --watchAll=false
```
Expected: FAIL

- [ ] **Step 3: Implement ToastContext and ToastContainer**

Create `src/context/ToastContext.tsx` and `src/components/ToastContainer.tsx` with auto-dismiss timers, progress bars, and GSAP slide animations.

- [ ] **Step 4: Mount ToastProvider in src/App.tsx**

Wrap `src/App.tsx` with `<ToastProvider>`.

- [ ] **Step 5: Run tests and verify**

Run:
```bash
npm test -- src/context/ToastContext.test.tsx --watchAll=false
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/context/ToastContext.tsx src/components/ToastContainer.tsx src/context/ToastContext.test.tsx src/App.tsx
git commit -m "feat: implement global animated toast notification system"
```

---

### Task 4: Accessible Animated Modal Component

**Files:**
- Create: `src/components/Modal.tsx`
- Create: `src/components/Modal.test.tsx`

**Interfaces:**
- Produces:
  - `Modal` component with props:
    - `isOpen: boolean`
    - `onClose: () => void`
    - `title: string`
    - `children: React.ReactNode`
    - `footer?: React.ReactNode`

- [ ] **Step 1: Write test for Modal component**

Create `src/components/Modal.test.tsx`:
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal Component', () => {
  it('renders title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const closeBtn = screen.getByLabelText('Close modal');
    await userEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:
```bash
npm test -- src/components/Modal.test.tsx --watchAll=false
```
Expected: FAIL

- [ ] **Step 3: Implement Modal component with GSAP open/close animations and body scroll lock**

Create `src/components/Modal.tsx` using `animateModalOpen` and `animateModalClose`.

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm test -- src/components/Modal.test.tsx --watchAll=false
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Modal.tsx src/components/Modal.test.tsx
git commit -m "feat: add reusable animated modal dialog component"
```

---

### Task 5: Mobile-First Responsive Dual-Mode Navigation

**Files:**
- Modify: `src/components/Navbar.tsx`
- Create: `src/components/Navbar.test.tsx`

**Interfaces:**
- Produces:
  - Responsive Navbar rendering sticky glass header on desktop and fixed thumb navigation bar on mobile (`<768px`).

- [ ] **Step 1: Write unit test for Navbar**

Create `src/components/Navbar.test.tsx`:
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';

describe('Navbar Component', () => {
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
  });
});
```

- [ ] **Step 2: Implement responsive Navbar with desktop glass header & mobile bottom tab bar**

Update `src/components/Navbar.tsx` with clean SVGs/icons and active indicator states.

- [ ] **Step 3: Run test to verify it passes**

Run:
```bash
npm test -- src/components/Navbar.test.tsx --watchAll=false
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/Navbar.tsx src/components/Navbar.test.tsx
git commit -m "feat: create mobile-first dual-mode navigation bar"
```

---

### Task 6: Page Overhaul — Authentication Pages (Login & Register)

**Files:**
- Modify: `src/pages/Login.tsx`
- Modify: `src/pages/Register.tsx`

**Interfaces:**
- Consumes: `useToast()`, `animateEnter`, and updated CSS classes.

- [ ] **Step 1: Upgrade Login.tsx**
  - Add GSAP entrance animation to the login card.
  - Connect error reporting to `showToast(err.message, 'error')`.
  - Add password visibility toggle and clean responsive layout.

- [ ] **Step 2: Upgrade Register.tsx**
  - Apply matching layout, toast error/success handling, and loading animations.

- [ ] **Step 3: Verify build and test**

Run:
```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.tsx src/pages/Register.tsx
git commit -m "feat: modernize login and register pages with toasts and animations"
```

---

### Task 7: Page Overhaul — Dashboard, API Key & Documents Pages

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/ApiKeyPage.tsx`
- Modify: `src/pages/Documents.tsx`

**Interfaces:**
- Consumes: `useToast()`, `Modal`, `animateEnter`, `animateStagger`.

- [ ] **Step 1: Upgrade Dashboard.tsx**
  - Staggered GSAP card animations.
  - Refresh button with loading animation.
  - Responsive table (desktop) and mobile-optimized telemetry cards.

- [ ] **Step 2: Upgrade ApiKeyPage.tsx**
  - Smooth segmented toggle pill for `Ver mi Key` vs `Crear nueva Key`.
  - Confirmation Modal popup before creating/replacing an API key.
  - Copy button with GSAP feedback and toast notification.
  - Interactive cURL snippet box with copy action.

- [ ] **Step 3: Upgrade Documents.tsx**
  - Clean API key input with instant feedback.
  - PDF Preview Modal dialog directly viewing the document inside an iframe or details viewer.
  - Staggered document cards with direct copy link toast and download button.

- [ ] **Step 4: Run full test suite & build check**

Run:
```bash
npm test -- --watchAll=false
npm run build
```
Expected: All unit tests PASS and production build compiles cleanly.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/ApiKeyPage.tsx src/pages/Documents.tsx
git commit -m "feat: upgrade dashboard, api key, and documents pages with modals and toasts"
```
