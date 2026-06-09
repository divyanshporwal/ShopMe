"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import showToast from "@/lib/toast";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
      router.push("/auth/forgot-password");
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const nextFocus = Math.min(pastedData.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;

    setLoading(true);
    setError("");
    const toastId = toast.loading("Verifying...");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 || res.status === 429) {
           setShake(true);
           setTimeout(() => setShake(false), 500);
           setOtp(["", "", "", "", "", ""]);
           inputRefs.current[0]?.focus();
        }
        setError(data.message || "Invalid OTP");
        
        if (res.status === 429) {
          toast.dismiss(toastId);
          showToast.error("Too many attempts. Please try again later.");
        } else if (res.status === 410) {
          toast.dismiss(toastId);
          showToast.error("OTP has expired. Please request a new one.");
        } else {
          toast.dismiss(toastId);
          showToast.error("Invalid OTP.");
        }
        return;
      }

      sessionStorage.setItem("resetToken", data.resetToken);
      toast.dismiss(toastId);
      showToast.success("OTP Verified!", { duration: 3000 });
      router.push("/auth/reset-password");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      toast.dismiss(toastId);
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    const toastId = toast.loading("Sending new OTP...");
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not resend OTP");
        toast.dismiss(toastId);
        showToast.error("Could not resend OTP");
        return;
      }
      setCountdown(60);
      toast.dismiss(toastId);
      showToast.success("New OTP sent to your email.", { duration: 3000 });
    } catch (err) {
      console.error(err);
      setError("Failed to resend OTP");
      toast.dismiss(toastId);
      showToast.error("Failed to resend OTP");
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "";

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto flex items-start justify-center py-10 px-4 z-50 register-overlay [-webkit-overflow-scrolling:touch]">
      <div
        className="fixed inset-0 backdrop-blur-sm"
        onClick={() => router.push("/auth/forgot-password")}
      />

      <div className="relative bg-white rounded-2xl w-full max-w-[460px] p-8 m-auto shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 w-full bg-gradient-to-r from-black via-gray-600 to-black" />

        <button
          onClick={() => router.push("/auth/forgot-password")}
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
            Verify OTP
          </h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Enter the 6-digit code sent to<br />
            <strong>{maskedEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 min-w-0">
          <div className={`flex justify-center gap-2 ${shake ? 'animate-shake' : ''}`}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg text-gray-900 bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition"
              />
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-600 font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP →"
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-2">
            Didn't receive the code?
          </p>
          {countdown > 0 ? (
            <p className="text-sm text-gray-400">
              Resend OTP in 00:{countdown.toString().padStart(2, '0')}
            </p>
          ) : (
            <button
              onClick={resendOtp}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
            >
              Resend OTP
            </button>
          )}
        </div>
        
        <p className="text-xs text-center text-gray-400 mt-6">
          OTP is valid for 15 minutes
        </p>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
