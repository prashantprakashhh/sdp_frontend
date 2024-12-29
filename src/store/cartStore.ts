import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../types/cart';

type CartState = {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      
      // Add to Cart: Adds a new product or increases the quantity if it already exists
      addToCart: (product: Product) => {
        const existingItem = get().cartItems.find(item => item.id === product.id);
        if (existingItem) {
          set({
            cartItems: get().cartItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            cartItems: [...get().cartItems, { ...product, quantity: 1 }],
          });
        }
      },
      
      // Remove from Cart: Decreases quantity or removes the item if quantity is 1
      removeFromCart: (productId: number) => {
        const existingItem = get().cartItems.find(item => item.id === productId);
        if (existingItem) {
          if (existingItem.quantity === 1) {
            set({
              cartItems: get().cartItems.filter(item => item.id !== productId),
            });
          } else {
            set({
              cartItems: get().cartItems.map(item =>
                item.id === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            });
          }
        }
      },
      
      // Increase Quantity: Specifically increases the quantity of a product
      increaseQuantity: (productId: number) => {
        const existingItem = get().cartItems.find(item => item.id === productId);
        if (existingItem) {
          set({
            cartItems: get().cartItems.map(item =>
              item.id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        }
      },
      
      // Decrease Quantity: Specifically decreases the quantity or removes the item
      decreaseQuantity: (productId: number) => {
        const existingItem = get().cartItems.find(item => item.id === productId);
        if (existingItem) {
          if (existingItem.quantity === 1) {
            set({
              cartItems: get().cartItems.filter(item => item.id !== productId),
            });
          } else {
            set({
              cartItems: get().cartItems.map(item =>
                item.id === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            });
          }
        }
      },
      
      // Clear Cart: Empties the entire cart
      clearCart: () => set({ cartItems: [] }),
      
      // Get Total Items: Returns the total number of items in the cart
      getTotalItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0);
      },
      
      // Get Total Price: Returns the total price of all items in the cart
      getTotalPrice: () => {
        return get().cartItems.reduce((total, item) => Number(total) + (Number(item.price) * Number(item.quantity)), 0);
      },
    }),
    {
      name: 'cart-storage', // unique name for storage
      storage: createJSONStorage<Pick<CartState, 'cartItems'>>(
        () => localStorage
      ), // using createJSONStorage for proper serialization
      partialize: (state) => ({ cartItems: state.cartItems }), // persist only cartItems
    }
  )
);