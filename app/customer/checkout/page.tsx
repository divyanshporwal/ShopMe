// checkout/page.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Loader2, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  // Get all required values directly from Zustand store
  const {
    cart,
    promoApplied,
    promoCode,
    subtotal: getSubtotal,
    shipping: getShipping,
    promoDiscount: getPromoDiscount,
    totalPrice: getTotalPrice,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the same helper functions from the store
  // This guarantees Cart Page and Checkout Page always show identical values
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const promoDiscount = getPromoDiscount();
  const total = getTotalPrice();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // Save checkout data locally (optional)
      localStorage.setItem(
        "checkout_cart",
        JSON.stringify({
          cart,
          promoApplied,
          promoCode,
          subtotal,
          shipping,
          promoDiscount,
          total,
        })
      );

      // Send the exact same values to your payment API
      const res = await fetch("/api/payment/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          promoApplied,
          promoCode,
          subtotal,
          shipping,
          promoDiscount,
          total,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        throw new Error("Failed to initiate payment");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-6 text-center">
          Checkout
        </h1>

        {/* Cart Summary */}
        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
          {cart.map((item: any) => (
            <div
              key={item._id}
              className="flex justify-between items-center border-b pb-3"
            >
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">
                  ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                </p>
              </div>

              <p className="font-bold text-gray-900">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6 border-t border-b py-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-semibold">
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </span>
          </div>

          {/* Promo Discount */}
          {promoApplied && (
            <div className="flex justify-between text-sm">
              <span className="text-purple-600 font-semibold">
                {promoCode} (10% OFF)
              </span>
              <span className="font-semibold text-purple-600">
                -₹{promoDiscount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-500 text-sm">Total Amount</span>
          <div className="text-right">
            <span className="text-3xl font-black text-gray-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
            {promoApplied && (
              <p className="text-xs text-purple-600 font-semibold mt-1">
                10% promo applied ✓
              </p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || cart.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${
            loading
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay ₹{total.toLocaleString("en-IN")}
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Secure payments powered by Stripe
        </p>
      </div>
    </div>
  );
}