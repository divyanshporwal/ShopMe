"use client";

import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuthUser = {
  role?: string;
};

export default function AuthGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const { user, loading } = useAuth() as { user: AuthUser | null; loading: boolean };
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/auth/login");
      else if (role && user.role !== role) router.push("/");
    }
  }, [user, loading]);

  if (loading) return <p className="p-6">Loading...</p>;

  return children;
}
