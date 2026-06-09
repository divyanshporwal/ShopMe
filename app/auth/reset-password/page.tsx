"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import showToast from "@/lib/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    const savedToken = sessionStorage.getItem("resetToken");
    if (!savedEmail || !savedToken) {
      setError("Session expired. Please restart the process.");
    } else {
      setEmail(savedEmail);
      setResetToken(savedToken);
    }
  }, []);

  const getStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    if (pass.length < 8) return 1; // Weak
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (hasLetters && hasNumbers && hasSpecial) return 4; // Very Strong
    if (hasLetters && hasNumbers) return 3; // Strong
    return 2; // Fair (8+ chars but missing letters or numbers)
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    const toastId = toast.loading("Updating...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        toast.dismiss(toastId);
        showToast.error(data.message || "Something went wrong.");
        return;
      }

      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");
      toast.dismiss(toastId);
      showToast.success("Password updated successfully! Please sign in.", { duration: 4000 });
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
      toast.dismiss(toastId);
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error === "Session expired. Please restart the process.") {
    return (
      <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-start justify-center py-10 px-4 z-50 register-overlay">
        <div className="fixed inset-0 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl w-full max-w-[460px] p-8 m-auto shadow-2xl overflow-hidden text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => router.push("/auth/forgot-password")}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-start justify-center py-10 px-4 z-50 register-overlay [-webkit-overflow-scrolling:touch]">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        onClick={() => router.push("/auth/login")}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-[460px] p-8 m-auto shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-black via-gray-600 to-black" />

        <button
          onClick={() => router.push("/auth/verify-otp")}
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Create a strong new password for your account.
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
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword1 ? "text" : "password"}
                placeholder="Min. 8 characters"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              >
                {showPassword1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2">
                <div className="flex h-1.5 gap-1 w-full">
                  <div className={`h-full flex-1 rounded-full ${strength >= 1 ? (strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                  <div className={`h-full flex-1 rounded-full ${strength >= 2 ? (strength === 2 ? 'bg-orange-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                  <div className={`h-full flex-1 rounded-full ${strength >= 3 ? (strength === 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`}></div>
                  <div className={`h-full flex-1 rounded-full ${strength >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  {strength === 0 && ""}
                  {strength === 1 && <span className="text-red-500">Weak</span>}
                  {strength === 2 && <span className="text-orange-500">Fair</span>}
                  {strength === 3 && <span className="text-yellow-500">Strong</span>}
                  {strength === 4 && <span className="text-green-500">Very Strong</span>}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Re-enter new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 border-2 border-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-300 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
              >
                {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Updating...
              </span>
            ) : (
              "Update Password →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
