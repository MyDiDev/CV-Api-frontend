import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';
import * as animations from '../utils/animations';

describe('Modal Component', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Closed Modal">
        <p>Hidden content</p>
      </Modal>
    );

    expect(screen.queryByText('Closed Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
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

  it('calls onClose when clicking on the backdrop', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
        <p>Click outside</p>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal dialog', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Inner Click Test">
        <p>Inside dialog</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        <p>Press escape</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided and omits footer container when not provided', () => {
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Footer Test"
        footer={<button>Confirm Action</button>}
      >
        <p>Body</p>
      </Modal>
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Footer Test">
        <p>Body</p>
      </Modal>
    );

    expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();
  });

  it('applies appropriate size class and max-width when size prop is specified', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Size Test" size="lg">
        <p>Large modal</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('modal-dialog-lg');

    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Size Test" size="sm">
        <p>Small modal</p>
      </Modal>
    );
    expect(dialog).toHaveClass('modal-dialog-sm');
  });

  it('locks body scroll on open and restores body scroll on close', () => {
    document.body.style.overflow = 'auto';

    const { rerender, unmount } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Scroll Test">
        <p>Scroll content</p>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Scroll Test">
        <p>Scroll content</p>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('auto');

    // Test unmount restores overflow
    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Scroll Test">
        <p>Scroll content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('has correct ARIA accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Accessible Title">
        <p>A11y content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const title = screen.getByText('Accessible Title');
    const titleId = title.getAttribute('id');
    expect(titleId).toBeTruthy();
    expect(dialog).toHaveAttribute('aria-labelledby', titleId);
  });

  it('traps focus inside the modal on Tab and Shift+Tab key navigation', () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Focus Trap Test"
        footer={<button>Submit</button>}
      >
        <input data-testid="test-input" />
      </Modal>
    );

    const closeBtn = screen.getByLabelText('Close modal');
    const input = screen.getByTestId('test-input');
    const submitBtn = screen.getByText('Submit');

    // Initial focus should be inside the modal
    expect(document.activeElement).toBe(closeBtn);

    // Tab to next element
    input.focus();
    expect(document.activeElement).toBe(input);

    submitBtn.focus();
    expect(document.activeElement).toBe(submitBtn);

    // Tab from last focusable element should cycle back to first
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab from first element should cycle to last
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(submitBtn);
  });

  it('restores focus to previously active element upon closing', () => {
    const externalButton = document.createElement('button');
    externalButton.textContent = 'External Button';
    document.body.appendChild(externalButton);
    externalButton.focus();
    expect(document.activeElement).toBe(externalButton);

    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Restore Focus Test">
        <p>Focus restored</p>
      </Modal>
    );

    expect(document.activeElement).not.toBe(externalButton);

    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Restore Focus Test">
        <p>Focus restored</p>
      </Modal>
    );

    expect(document.activeElement).toBe(externalButton);
    document.body.removeChild(externalButton);
  });

  it('triggers animateModalOpen on open and animateModalClose on close', async () => {
    const openSpy = jest.spyOn(animations, 'animateModalOpen');
    const closeSpy = jest.spyOn(animations, 'animateModalClose').mockImplementation((b, d, cb) => {
      cb?.();
    });

    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Animation Test">
        <p>Animated content</p>
      </Modal>
    );

    expect(openSpy).toHaveBeenCalledTimes(1);

    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Animation Test">
        <p>Animated content</p>
      </Modal>
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    openSpy.mockRestore();
    closeSpy.mockRestore();
  });

  it('unmounts after closing animation completes', async () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Unmount Test">
        <p>Will be removed</p>
      </Modal>
    );

    expect(screen.getByText('Unmount Test')).toBeInTheDocument();

    rerender(
      <Modal isOpen={false} onClose={jest.fn()} title="Unmount Test">
        <p>Will be removed</p>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.queryByText('Unmount Test')).not.toBeInTheDocument();
    });
  });
});

