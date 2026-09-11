import gsap from 'gsap';

export const animateEnter = (element: HTMLElement | null, delay: number = 0): gsap.core.Tween | undefined => {
  if (!element) return;
  return gsap.fromTo(
    element,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.35, delay, ease: 'power2.out' }
  );
};

export const animateStagger = (
  elements: (HTMLElement | null)[],
  stagger: number = 0.08
): gsap.core.Tween | undefined => {
  const validElements = elements.filter(Boolean) as HTMLElement[];
  if (!validElements.length) return;
  return gsap.fromTo(
    validElements,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.3, stagger, ease: 'power2.out' }
  );
};

export const animateModalOpen = (backdrop: HTMLElement | null, dialog: HTMLElement | null): void => {
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
): void => {
  if (!dialog && !backdrop) {
    onComplete?.();
    return;
  }
  const tl = gsap.timeline({ onComplete });
  if (dialog) {
    tl.to(dialog, { opacity: 0, scale: 0.96, duration: 0.18, ease: 'power2.in' }, 0);
  }
  if (backdrop) {
    tl.to(backdrop, { opacity: 0, duration: 0.18, ease: 'power2.in' }, 0);
  }
};
