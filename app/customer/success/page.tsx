
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function SuccessPage() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("checkout_cart") || "[]"
    );

    const saveOrder = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          credentials: "include", // 🔥 IMPORTANT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: savedCart.map((item) => ({
              productId: item._id,
              quantity: 1,
              price: item.price,
            })),
          }),
        });

        const data = await res.json();
        console.log("ORDER RESPONSE:", data);

        clearCart();
        localStorage.removeItem("checkout_cart");

        router.push("/customer/orders");
      } catch (err) {
        console.error(err);
      }
    };

    if (savedCart.length > 0) {
      saveOrder();
    }
  }, []);

  return (
    <h1 className="text-center mt-10">
      Processing payment...
    </h1>
  );
}