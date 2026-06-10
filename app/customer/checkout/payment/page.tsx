// checkout/payment/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

interface Address {
  fullName: string;
  mobile: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
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
  const [address, setAddress] = useState<Address | null>(null);

  // Redirect if no delivery address in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("shopme_delivery_address");
    if (!saved) {
      router.push("/customer/checkout");
    } else {
      try {
        setAddress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse checkout address", e);
        router.push("/customer/checkout");
      }
    }
  }, [router]);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const promoDiscount = getPromoDiscount();
  const total = getTotalPrice();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      if (!address) {
        throw new Error("Delivery address is required");
      }

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

      // Send the exact same values to payment API
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
          deliveryAddress: address,
        }),
      });

      const data = await res.json();

      if (!data.url) {
        throw new Error(data.error || "Failed to initiate payment");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-6 text-center">
          Payment
        </h1>

        {/* Address Summary */}
        {address && (
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">
                📦 Delivering to
              </span>
              <Link
                href="/customer/checkout"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Change
              </Link>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {address.fullName}  •  {address.mobile}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {address.address1}
              {address.address2 ? `, ${address.address2}` : ""}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        )}

        {/* Cart Summary */}
        <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
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
          <div className="mb-4 text-red-500 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading || cart.length === 0 || !address}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${
            loading || !address
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
