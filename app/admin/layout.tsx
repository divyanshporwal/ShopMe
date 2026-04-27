"use client";

import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, loading]);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      <main className="flex-1 p-8 max-w-7xl">{children}</main>
    </div>
  );
}