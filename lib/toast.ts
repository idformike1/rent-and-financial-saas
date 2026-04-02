'use client'

type ToastType = 'success' | 'error' | 'info';

export interface ToastEvent {
  message: string;
  type: ToastType;
  id: string;
}

const TOAST_EVENT = 'custom-toast-event';

export const toast = {
  success: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { 
      detail: { message, type: 'success', id: Math.random().toString(36).substring(2, 9) } 
    }));
  },
  error: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { 
      detail: { message, type: 'error', id: Math.random().toString(36).substring(2, 9) } 
    }));
  },
  info: (message: string) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { 
      detail: { message, type: 'info', id: Math.random().toString(36).substring(2, 9) } 
    }));
  }
};

export const SUBSCRIBE_TOAST = (callback: (toast: ToastEvent) => void) => {
  const handler = (e: any) => callback(e.detail);
  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
};
