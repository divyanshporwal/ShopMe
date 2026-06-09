"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import showToast from "@/lib/toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const toastId = toast.loading("Sending OTP...");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Try again.");
        toast.dismiss(toastId);
        showToast.error("No account found with this email.");
        return;
      }

      sessionStorage.setItem("resetEmail", email);
      toast.dismiss(toastId);
      showToast.success("OTP sent! Check your email inbox.", { duration: 4000 });
      router.push("/auth/verify-otp");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      toast.dismiss(toastId);
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-start justify-center py-10 px-4 z-50 register-overlay [-webkit-overflow-scrolling:touch]">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        onClick={() => router.push("/auth/login")}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-[460px] p-8 m-auto shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-black via-gray-600 to-black" />

        <button
          onClick={() => router.push("/auth/login")}
          className="absolute top-5 left-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="mb-7 mt-8">
          <div className="flex items-center justify-center gap-2 mb-6">
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

          <h2 className="text-2xl font-black text-gray-900 text-center">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Enter your registered email address.<br />
            We'll send you a verification code.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium text-center">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition truncate"
            />
          </div>

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
                Sending...
              </span>
            ) : (
              "Send OTP →"
            )}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="text-black font-bold hover:underline underline-offset-4 transition"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
