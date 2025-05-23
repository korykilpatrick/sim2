import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  billingCycle: 'monthly' | 'annual';
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, billingCycle?: 'monthly' | 'annual') => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateBillingCycle: (productId: string, billingCycle: 'monthly' | 'annual') => void;
  clearCart: () => void;
  getTotal: () => { subtotal: number; tax: number; total: number };
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, billingCycle = 'monthly') => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // If item already exists, increment quantity
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                product,
                quantity: 1,
                billingCycle,
                addedAt: new Date(),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      updateBillingCycle: (productId, billingCycle) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, billingCycle } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const items = get().items;
        const subtotal = items.reduce((sum, item) => {
          const price =
            item.billingCycle === 'monthly'
              ? item.product.pricing.monthly
              : item.product.pricing.annual / 12; // Monthly equivalent for display
          return sum + price * item.quantity;
        }, 0);

        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        return { subtotal, tax, total };
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      // Serialize dates properly
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        })),
      }),
      // Deserialize dates
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }));
        }
      },
    }
  )
);