"use client";

import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "MERCHANT") {
        // Not a merchant — redirect with contextual notice
        const status = (user as any)?.merchantRequest?.status;
        if (status === 'pending') {
          router.push("/customer/dashboard?notice=pending");
        } else {
          router.push("/customer/dashboard?notice=no-access");
        }
      }
    }
  }, [user, loading]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Overlay (mobile only) */}
      {sidebarOpen && windowWidth < 1024 && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Hamburger button (shows on tablet/mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: windowWidth < 1024 ? 'flex' : 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          width: '40px',
          height: '40px',
          background: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '20px',
        }}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          zIndex: 50,
          transition: 'transform 0.25s ease',
          transform: sidebarOpen || windowWidth >= 1024
            ? 'translateX(0)'
            : 'translateX(-100%)',
        }}
      >
        <Sidebar role="merchant" onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content area */}
      <main
        style={{
          marginLeft: windowWidth >= 1024 ? '256px' : '0',
          minHeight: '100vh',
          padding: windowWidth < 1024
            ? '72px 16px 16px'  // top padding for hamburger
            : '24px 32px',
          transition: 'margin-left 0.25s ease',
        }}
      >
        {children}
      </main>
    </div>
  );
}
