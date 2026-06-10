import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      // =========================
      // STATE
      // =========================
      cart: [],

      // Promo code state
      promoCode: "SHOPME10",
      promoApplied: false,

      // =========================
      // CART ACTIONS
      // =========================
      addToCart: (product) => {
        const existing = get().cart.find(
          (item) => item._id === product._id
        );

        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item._id === product._id
                ? {
                    ...item,
                    quantity: Math.min(
                      item.quantity + 1,
                      item.stock || 99
                    ),
                  }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              {
                ...product,
                quantity: 1,
              },
            ],
          });
        }
      },

      removeFromCart: (id) =>
        set({
          cart: get().cart.filter((item) => item._id !== id),
        }),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({
            cart: get().cart.filter((item) => item._id !== id),
          });
          return;
        }

        set({
          cart: get().cart.map((item) =>
            item._id === id
              ? {
                  ...item,
                  quantity,
                }
              : item
          ),
        });
      },

      clearCart: () =>
        set({
          cart: [],
          promoCode: "SHOPME10",
          promoApplied: false,
        }),

      // =========================
      // PROMO CODE ACTIONS
      // =========================
      applyPromo: (code) => {
        const normalizedCode = code.toUpperCase().trim();

        if (normalizedCode === "SHOPME10") {
          set({
            promoCode: normalizedCode,
            promoApplied: true,
          });
          return true;
        } else {
          set({
            promoCode: normalizedCode,
            promoApplied: false,
          });
          return false;
        }
      },

      removePromo: () =>
        set({
          promoCode: "SHOPME10",
          promoApplied: false,
        }),

      // =========================
      // HELPER GETTERS
      // =========================
      totalItems: () =>
        get().cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),

      subtotal: () =>
        get().cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      originalTotal: () =>
        get().cart.reduce(
          (sum, item) =>
            sum +
            (item.originalPrice || item.price) *
              item.quantity,
          0
        ),

      totalPrice: () => {
        const subtotal = get().subtotal();
        const shipping = subtotal >= 999 ? 0 : 49;
        const promoDiscount = get().promoApplied
          ? Math.round(subtotal * 0.1)
          : 0;

        return subtotal + shipping - promoDiscount;
      },

      promoDiscount: () => {
        const subtotal = get().subtotal();
        return get().promoApplied
          ? Math.round(subtotal * 0.1)
          : 0;
      },

      shipping: () => {
        const subtotal = get().subtotal();
        return subtotal >= 999 ? 0 : 49;
      },

      savedAmount: () =>
        get().originalTotal() - get().subtotal(),

      isInCart: (id) =>
        get().cart.some((item) => item._id === id),
    }),
    {
      name: "shopme-cart", // persisted in localStorage
    }
  )
);