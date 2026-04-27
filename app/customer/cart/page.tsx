"use client";

import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { cart, removeFromCart } = useCartStore();

  return (
    <div>
      <h1 className="text-xl mb-4">Cart</h1>

      {cart.map((item) => (
        <div key={item._id} className="flex justify-between border p-3 mb-2">
          <p>{item.title}</p>
          <button onClick={() => removeFromCart(item._id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}