import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      duration: 4000,
      ...toast,
    };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  success: (title, message) => {
    return get().addToast({ type: 'success', title, message });
  },

  error: (title, message) => {
    return get().addToast({ type: 'error', title, message, duration: 6000 });
  },

  info: (title, message) => {
    return get().addToast({ type: 'info', title, message });
  },
}));