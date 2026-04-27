"use client";

export default function AuthModal({ children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* 🔥 Blurred Background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 🔥 Modal */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}