"use client";

import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

type AuthUser = {
  role?: string;
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth() as { user: AuthUser | null; loading: boolean };
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "MERCHANT") {
        router.push("/");
      }
    }
  }, [user, loading]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Toggle Button (Mobile only) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 bg-gray-900 text-white w-10 h-10 rounded-lg flex md:hidden items-center justify-center z-[60] hover:bg-gray-800 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`merchant-sidebar shrink-0 ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar role="merchant" onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="merchant-main flex-1 p-6 min-w-0">
        {children}
      </main>
    </div>
  );
}
