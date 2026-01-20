import { useCallback, useState, useEffect } from 'react';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

// Global toast state (singleton pattern for DaisyUI toast)
let toastContainer: HTMLDivElement | null = null;
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function getOrCreateToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast toast-top toast-end z-50';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(options: ToastOptions): void {
  const container = getOrCreateToastContainer();
  const duration = options.duration ?? 5000;

  // Clear existing toast timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  // Determine alert class based on variant
  const variantClass = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  }[options.variant ?? 'info'];

  // Create toast content
  container.innerHTML = `
    <div class="alert ${variantClass} shadow-lg">
      <div>
        <span class="font-bold">${options.title}</span>
        ${options.description ? `<span class="text-sm">${options.description}</span>` : ''}
      </div>
    </div>
  `;

  // Auto-dismiss after duration
  toastTimeout = setTimeout(() => {
    container.innerHTML = '';
  }, duration);
}

/**
 * Custom hook for showing toast notifications using DaisyUI
 * @returns toast function to display notifications
 */
export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    showToast(options);
  }, []);

  return { toast };
}
