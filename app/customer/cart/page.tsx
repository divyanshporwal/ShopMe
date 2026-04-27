"use client";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState("SHOPME10");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity, 0
  );
  const originalTotal = cart.reduce(
    (sum: number, item: any) => sum + (item.originalPrice || item.price) * item.quantity, 0
  );
  const savedAmount = originalTotal - subtotal;
  const shipping = subtotal >= 999 ? 0 : 99;
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal + shipping - promoDiscount;

  const handleApplyPromo = () => {
    if (promoCode === "SHOPME10") {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
      setPromoApplied(false);
    }
  };

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          Looks like you haven't added anything yet. Browse our products and find something you love!
        </p>
        <Link
          href="/customer/products"
          className="bg-black text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-800 transition"
        >
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Cart</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 font-semibold hover:text-red-600 hover:underline transition"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Cart items — left */}
        <div className="col-span-8 space-y-4">
          {cart.map((item: any) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-5 hover:border-gray-300 transition"
            >
              {/* Product image */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.category && (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {item.category}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.title}
                    </p>
                    {item.stock && item.stock <= 5 && (
                      <p className="text-xs text-orange-500 font-semibold mt-1">
                        ⚠️ Only {item.stock} left in stock
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Price + quantity row */}
                <div className="flex items-center justify-between mt-4">
                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{(item.originalPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition text-gray-600 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock || 99)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition text-gray-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue shopping */}
          <Link
            href="/customer/products"
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition mt-2 w-fit"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary — right */}
        <div className="col-span-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-32 space-y-5">
            <h2 className="text-base font-black text-gray-900">Order Summary</h2>

            {/* Savings banner */}
            {savedAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-green-600 text-sm font-bold">
                  🎉 You're saving ₹{savedAmount.toLocaleString("en-IN")}!
                </span>
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Subtotal ({cart.reduce((s: number, i: any) => s + i.quantity, 0)} items)
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {savedAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-semibold text-green-600">
                    −₹{savedAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-900"}`}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              {shipping > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-blue-600 font-medium">
                    Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for FREE shipping
                  </p>
                </div>
              )}

              {promoApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    SHOPME10
                  </span>
                  <span className="font-semibold text-purple-600">
                    −₹{promoDiscount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-base font-black text-gray-900">Total</span>
              <div className="text-right">
                <p className="text-xl font-black text-gray-900">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </p>
                {promoApplied && (
                  <p className="text-xs text-purple-600 font-semibold">
                    10% promo applied ✓
                  </p>
                )}
              </div>
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Promo Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setPromoApplied(false);
                    setPromoError("");
                  }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-black transition bg-gray-50"
                />
                <button
                  onClick={handleApplyPromo}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    promoApplied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  {promoApplied ? "✓" : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="text-xs text-red-500 font-medium">{promoError}</p>
              )}
              {promoApplied && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Promo code applied successfully!
                </p>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={() => router.push("/customer/checkout")}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
              {[
                { icon: "🔒", label: "Secure Pay" },
                { icon: "↩️", label: "Easy Returns" },
                { icon: "✅", label: "Authentic" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}