"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff, ShoppingBag, User, Store } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    let data = null;

    try {
      data = await res.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
    }

    if (!res.ok) {
      setError(data?.message || "Server error");
      return;
    }

    if (form.role === "MERCHANT") {
      alert("Request sent for admin approval");
    } else {
      alert("Account created successfully");
    }

    router.push("/customer/products");

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    setError("Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => router.back()}
      />

      {/* modal */}
      <div className="relative w-full md:max-w-md m-0 md:mx-auto max-h-[calc(100vh-32px)] md:max-h-none overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-black via-gray-600 to-black" />

        <div className="p-8">
          <button
            onClick={() => router.back()}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-semibold tracking-[0.3em] text-gray-400 uppercase">
                  Shop
                </span>
                <span className="text-lg font-black text-black leading-none">
                  ME
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900">
              Create account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Join thousands of shoppers on ShopMe
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6 w-full">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "CUSTOMER" })}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all ${
                form.role === "CUSTOMER"
                  ? "border-black bg-black text-white"
                  : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold">Customer</p>
                <p
                  className={`text-[10px] ${
                    form.role === "CUSTOMER"
                      ? "text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  Shop products
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, role: "MERCHANT" })}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all ${
                form.role === "MERCHANT"
                  ? "border-black bg-black text-white"
                  : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold">Merchant</p>
                <p
                  className={`text-[10px] ${
                    form.role === "MERCHANT"
                      ? "text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  Sell products
                </p>
              </div>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 min-w-0">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition truncate"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-11 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Merchant notice */}
            {form.role === "MERCHANT" && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 font-medium">
                  ⏳ Merchant accounts require admin approval before you can list products.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-500">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-black font-bold hover:underline underline-offset-4 transition"
            >
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
