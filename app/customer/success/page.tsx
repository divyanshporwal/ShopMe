
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setError("Payment session not found");
          return;
        }

        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Payment verification failed");
        }

        clearCart();
        localStorage.removeItem("checkout_cart");
        sessionStorage.removeItem("shopme_delivery_address");

        router.push("/customer/orders");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Payment verification failed");
      }
    };

    verifyPayment();
  }, [clearCart, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      {error ? (
        <div>
          <h1 className="text-2xl font-bold text-red-600">Payment verification failed</h1>
          <p className="mt-3 text-gray-600">{error}</p>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-gray-900">Processing payment...</h1>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Processing payment...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
