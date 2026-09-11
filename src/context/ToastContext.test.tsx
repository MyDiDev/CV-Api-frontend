import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast, ToastType } from './ToastContext';

const TestComponent: React.FC<{ message?: string; type?: ToastType; duration?: number }> = ({
  message = 'Test success message',
  type = 'success',
  duration,
}) => {
  const { showToast, removeToast, toasts } = useToast();
  return (
    <div>
      <button onClick={() => showToast(message, type, duration)}>
        Trigger Toast
      </button>
      {toasts.map((t) => (
        <button key={t.id} onClick={() => removeToast(t.id)}>
          Remove {t.id}
        </button>
      ))}
    </div>
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
    expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument();
  });

  it('supports various toast types: error, warning, info', async () => {
    const { rerender } = render(
      <ToastProvider>
        <TestComponent message="Error alert" type="error" />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Error alert')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-error')).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <TestComponent message="Warning alert" type="warning" />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Warning alert')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-warning')).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <TestComponent message="Info alert" type="info" />
      </ToastProvider>
    );
    await userEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Info alert')).toBeInTheDocument();
    expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument();
  });

  it('allows manual dismissal via the close button', async () => {
    render(
      <ToastProvider>
        <TestComponent message="Dismiss me" type="info" />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    const closeBtn = screen.getByLabelText('Cerrar notificación');
    await userEvent.click(closeBtn);

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('allows programmatic dismissal via removeToast', async () => {
    render(
      <ToastProvider>
        <TestComponent message="Programmatic dismiss" type="success" />
      </ToastProvider>
    );

    await userEvent.click(screen.getByText('Trigger Toast'));
    expect(screen.getByText('Programmatic dismiss')).toBeInTheDocument();

    const removeBtn = screen.getByText(/Remove toast-/i);
    await userEvent.click(removeBtn);

    expect(screen.queryByText('Programmatic dismiss')).not.toBeInTheDocument();
  });

  it('auto-dismisses toast when duration timer expires', () => {
    jest.useFakeTimers();

    render(
      <ToastProvider>
        <TestComponent message="Auto dismiss message" duration={1000} />
      </ToastProvider>
    );

    const triggerBtn = screen.getByText('Trigger Toast');
    act(() => {
      triggerBtn.click();
    });

    expect(screen.getByText('Auto dismiss message')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(screen.queryByText('Auto dismiss message')).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it('throws an error when useToast is called outside of ToastProvider', () => {
    const ComponentOutside = () => {
      useToast();
      return <div>Outside</div>;
    };

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ComponentOutside />);
    }).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });

  it('memoizes context value across provider re-renders when toasts remain unchanged', () => {
    const capturedValues: any[] = [];
    const ConsumerComponent = () => {
      const value = useToast();
      capturedValues.push(value);
      return <div>Consumer</div>;
    };

    const Wrapper: React.FC<{ count: number }> = ({ count }) => {
      return (
        <ToastProvider>
          <ConsumerComponent />
          <span data-testid="count">{count}</span>
        </ToastProvider>
      );
    };

    const { rerender } = render(<Wrapper count={1} />);
    rerender(<Wrapper count={2} />);

    expect(capturedValues.length).toBe(2);
    expect(capturedValues[0]).toBe(capturedValues[1]);
  });
});
