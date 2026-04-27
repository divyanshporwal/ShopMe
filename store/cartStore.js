// import { create } from "zustand";

// export const useCartStore = create((set, get) => ({
//   cart: [],

//   addToCart: (product) => {
//     const existing = get().cart.find(
//       (item) => item._id === product._id
//     );

//     if (existing) {
//       set({
//         cart: get().cart.map((item) =>
//           item._id === product._id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         ),
//       });
//     } else {
//       set({
//         cart: [...get().cart, { ...product, quantity: 1 }],
//       });
//     }
//   },

//   removeFromCart: (id) =>
//     set({
//       cart: get().cart.filter((item) => item._id !== id),
//     }),

//   clearCart: () => set({ cart: [] }),
// }));

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const existing = get().cart.find((item) => item._id === product._id);
        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || 99) }
                : item
            ),
          });
        } else {
          set({
            cart: [...get().cart, { ...product, quantity: 1 }],
          });
        }
      },

      removeFromCart: (id) =>
        set({ cart: get().cart.filter((item) => item._id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({ cart: get().cart.filter((item) => item._id !== id) });
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item._id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      // Helper getters
      totalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

      isInCart: (id) => get().cart.some((item) => item._id === id),
    }),
    {
      name: "shopme-cart", // persists in localStorage
    }
  )
);