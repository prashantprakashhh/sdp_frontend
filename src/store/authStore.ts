import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  customerId: number | null;
  supplierId: number | null;
  role: 'customer' | 'supplier' | null;
  setToken: (token: string) => void;
  setCustomer: (customerId: number) => void;
  setSupplier: (supplierId: number) => void;
  setRole: (role: 'customer' | 'supplier') => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customerId: null,
      supplierId: null,
      role: null,
      setToken: (token: string) => set({ token }),
      setCustomer: (customerId: number) => set({ customerId }),
      setSupplier: (supplierId: number) => set({ supplierId }),
      setRole: (role: 'customer' | 'supplier') => set({ role }),
      resetAuth: () =>
        set({
          token: null,
          customerId: null,
          supplierId: null,
          role: null,
        }),
    }),
    {
      name: 'auth-storage', // unique name for storage
      storage: createJSONStorage(() => localStorage), // persist to localStorage
    }
  )
);
