"use client";

import Sidebar from "@/components/layout/Sidebar";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MerchantLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="flex">
      <Sidebar role="merchant" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}